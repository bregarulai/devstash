'use server'

import { prisma } from "@/lib/prisma/prisma"
import { resend } from "@/lib/email/resend/resend"
import { createVerificationToken } from "@/lib/auth/verificationToken/verificationToken"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { forgotPasswordSchema } from "@/types/db"
import { headers } from "next/headers"
import { createRateLimiter, checkRateLimit, RATE_LIMIT_CONFIGS } from "@/lib/auth/rateLimit/rateLimit"

export async function handleForgotPassword(formData: FormData) {
  // Rate limiting check
  const headersList = await headers()
  const ip = headersList.get("x-client-ip") ?? "unknown"
  const rateLimiter = createRateLimiter(RATE_LIMIT_CONFIGS.forgotPassword)
  const rateKey = `forgotpwd:${ip}`
  const rateResult = await checkRateLimit(rateLimiter, rateKey, RATE_LIMIT_CONFIGS.forgotPassword)

  if (!rateResult.success) {
    const retryAfter = rateResult.retryAfter || 3600
    redirect(`/forgot-password?error=${encodeURIComponent(`Too many attempts. Please try again in ${retryAfter / 3600} hour${retryAfter / 3600 > 1 ? "s" : ""}`)}&retry-after=${retryAfter}`)
  }

  const result = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  })

  if (!result.success) {
    redirect("/forgot-password?error=Please+enter+a+valid+email+address")
  }

  const { email } = result.data

  const user = await prisma.user.findUnique({
    where: { email },
  })

  const emailVerificationEnabled = process.env.ENABLE_EMAIL_VERIFICATION !== "false"

  if (emailVerificationEnabled && user && !user.emailVerified) {
    redirect(`/forgot-password?error=Please+verify+your+email+address+first`)
  }

  // Always generate a dummy token to prevent timing-based enumeration
  // This ensures the response time is similar whether the email exists or not
  await createVerificationToken(email).catch(() => {})

  if (!user) {
    revalidatePath("/forgot-password")
    redirect("/forgot-password?success=A+password+reset+link+has+been+sent+if+the+email+is+registered.")
  }

  const token = await createVerificationToken(email)

  const resetLink = `${process.env.AUTH_URL || "http://localhost:3000"}/reset-password?token=${token}&email=${encodeURIComponent(email)}`

  try {
    await resend.emails.send({
      from: "DevStash <onboarding@resend.dev>",
      to: email,
      subject: "Reset your DevStash password",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #fafafa; padding: 40px 20px; margin: 0;">
            <div style="max-width: 480px; margin: 0 auto; background-color: #171717; border-radius: 8px; padding: 32px; border: 1px solid #262626;">
              <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 16px 0; color: #fafafa;">
                Reset Your Password
              </h1>
              <p style="font-size: 16px; line-height: 1.5; color: #a1a1aa; margin: 0 0 24px 0;">
                We received a request to reset your password. Click the button below to choose a new password.
              </p>
              <a href="${resetLink}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; font-size: 14px; font-weight: 500; text-decoration: none; padding: 12px 24px; border-radius: 6px;">
                Reset Password
              </a>
              <p style="font-size: 14px; line-height: 1.5; color: #71717a; margin: 24px 0 0 0;">
                This link will expire in 24 hours. If you didn't request a password reset, you can safely ignore this email.
              </p>
              <hr style="border: none; border-top: 1px solid #262626; margin: 24px 0;">
              <p style="font-size: 12px; color: #52525b; margin: 0;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${resetLink}" style="color: #3b82f6; word-break: break-all;">${resetLink}</a>
              </p>
            </div>
          </body>
        </html>
      `,
      text: `Reset Your Password

We received a request to reset your password. Click the link below to choose a new password:

${resetLink}

This link will expire in 24 hours. If you didn't request a password reset, you can safely ignore this email.`,
    })
  }
  catch (error) {
    console.error("Failed to send password reset email:", error)
  }

  revalidatePath("/forgot-password")
  redirect("/forgot-password?success=A+password+reset+link+has+been+sent+if+the+email+is+registered.")
}
