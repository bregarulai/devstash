'use server'

import { signOut as nextAuthSignOut } from "@/lib/auth/auth/auth"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma/prisma"
import bcrypt from "bcryptjs"
import { resend } from "@/lib/email/resend/resend"
import { createVerificationToken } from "@/lib/auth/verificationToken/verificationToken"
import { auth } from "@/lib/auth/auth/auth"
import { registerSchema, type ChangePasswordValues } from "@/types/db"
import { headers } from "next/headers"
import { createRateLimiter, checkRateLimit, RATE_LIMIT_CONFIGS } from "@/lib/auth/rateLimit/rateLimit"
import { EMAIL_SENDER } from "@/lib/constants"

export async function handleRegister(formData: FormData) {
  // Rate limiting check
  const headersList = await headers()
  const ip = headersList.get("x-client-ip") ?? "unknown"
  const rateLimiter = createRateLimiter(RATE_LIMIT_CONFIGS.register)
  const rateKey = `register:${ip}`
  const rateResult = await checkRateLimit(rateLimiter, rateKey, RATE_LIMIT_CONFIGS.register, true)

  if (!rateResult.success) {
    const retryAfter = rateResult.retryAfter || 3600
    redirect(`/register?error=${encodeURIComponent(`Too many attempts. Please try again in ${retryAfter / 3600} hour${retryAfter / 3600 > 1 ? "s" : ""}`)}&retry-after=${retryAfter}`)
  }

  const result = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  })

  if (!result.success) {
    redirect(`/register?error=${encodeURIComponent(result.error.issues[0]?.message || "Validation failed")}`)
  }

  const { name, email, password } = result.data

  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    redirect("/register?error=Unable+to+create+account.+Please+try+again.")
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  })

  const emailVerificationEnabled = process.env.ENABLE_EMAIL_VERIFICATION !== "false"

  if (emailVerificationEnabled) {
    const token = await createVerificationToken(email)

    const verificationLink = `${process.env.AUTH_URL || "http://localhost:3000"}/verify-email?token=${token}`

    try {
      await resend.emails.send({
        from: EMAIL_SENDER,
        to: email,
        subject: "Verify your DevStash account",
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
                  Welcome to DevStash
                </h1>
                <p style="font-size: 16px; line-height: 1.5; color: #a1a1aa; margin: 0 0 24px 0;">
                  Thanks for signing up! Please verify your email address by clicking the button below.
                </p>
                <a href="${verificationLink}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; font-size: 14px; font-weight: 500; text-decoration: none; padding: 12px 24px; border-radius: 6px;">
                  Verify Email Address
                </a>
                <p style="font-size: 14px; line-height: 1.5; color: #71717a; margin: 24px 0 0 0;">
                  This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
                </p>
                <hr style="border: none; border-top: 1px solid #262626; margin: 24px 0;">
                <p style="font-size: 12px; color: #52525b; margin: 0;">
                  If the button doesn't work, copy and paste this link into your browser:<br>
                  <a href="${verificationLink}" style="color: #3b82f6; word-break: break-all;">${verificationLink}</a>
                </p>
              </div>
            </body>
          </html>
        `,
        text: `Welcome to DevStash!

Thanks for signing up! Please verify your email address by clicking the link below:

${verificationLink}

This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.`,
      })
    } catch (error) {
      console.error("Failed to send verification email:", error)
    }

    revalidatePath("/register")
    redirect("/verify-email?success=registered&email=" + encodeURIComponent(email))
  }
  else {
    revalidatePath("/register")
    redirect("/sign-in?success=registered&email=" + encodeURIComponent(email))
  }
}

export async function handleSignOut() {
  await nextAuthSignOut({ redirectTo: "/" })
}

export async function handleChangePassword(data: ChangePasswordValues) {
  const { currentPassword, newPassword } = data

  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'Not authenticated', data: null }
  }

  const headersList = await headers()
  const ip = headersList.get('x-client-ip') ?? 'unknown'
  const rateLimiter = createRateLimiter(RATE_LIMIT_CONFIGS.changePassword)
  const rateKey = `changepwd:${ip}:${session.user.id}`
  const rateResult = await checkRateLimit(rateLimiter, rateKey, RATE_LIMIT_CONFIGS.changePassword)

  if (!rateResult.success) {
    const retryAfter = rateResult.retryAfter || 900
    return { error: `Too many attempts. Please try again in ${Math.ceil(retryAfter / 60)} minute${Math.ceil(retryAfter / 60) > 1 ? 's' : ''}`, data: null }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  })

  if (!user?.password) {
    return { error: 'Password change not available for OAuth accounts', data: null }
  }

  const valid = await bcrypt.compare(currentPassword, user.password)

  if (!valid) {
    return { error: 'Current password is incorrect', data: null }
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12)

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    })
  } catch {
    return { error: 'Failed to update password', data: null }
  }

  return { success: true, data: null }
}


