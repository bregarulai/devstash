'use server'

import { prisma } from "@/lib/prisma/prisma"
import { resend } from "@/lib/email/resend/resend"
import { createVerificationToken } from "@/lib/auth/verificationToken/verificationToken"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { createRateLimiter, checkRateLimit, RATE_LIMIT_CONFIGS } from "@/lib/auth/rateLimit/rateLimit"
import { EMAIL_SENDER } from "@/lib/constants"
import { getVerificationEmailHtml, getVerificationEmailText } from "@/lib/email/templates/verification"

export async function handleResendVerification(email: string) {
  // Rate limiting check
  const headersList = await headers()
  const ip = headersList.get("x-client-ip") ?? "unknown"
  const rateLimiter = createRateLimiter(RATE_LIMIT_CONFIGS.resendVerification)
  const rateKey = `resendverif:${ip}:${email}`
  const rateResult = await checkRateLimit(rateLimiter, rateKey, RATE_LIMIT_CONFIGS.resendVerification)

  if (!rateResult.success) {
    const retryAfter = rateResult.retryAfter || 900
    redirect(`/sign-in?error=${encodeURIComponent(`Too many attempts. Please try again in ${retryAfter / 60} minute${retryAfter / 60 > 1 ? "s" : ""}`)}&retry-after=${retryAfter}`)
  }

  const emailVerificationEnabled = process.env.ENABLE_EMAIL_VERIFICATION !== "false"

  if (!emailVerificationEnabled) {
    redirect("/sign-in")
  }

  // Always create a dummy token to prevent timing-based enumeration
  await createVerificationToken(email).catch(() => {})

  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user || user.emailVerified) {
    redirect("/sign-in?success=resent")
  }

  const token = await createVerificationToken(email)

  const verificationLink = `${process.env.AUTH_URL || "http://localhost:3000"}/verify-email?token=${token}`

  try {
    await resend.emails.send({
      from: EMAIL_SENDER,
      to: email,
      subject: "Verify your DevStash account",
      html: getVerificationEmailHtml(verificationLink),
      text: getVerificationEmailText(verificationLink),
    })
  } catch (error) {
    console.error("Failed to send verification email:", error)
  }

  redirect("/sign-in?success=resent")
}
