"use server"

import { prisma } from "@/lib/prisma"
import { signIn } from "@/lib/auth"
import { redirect } from "next/navigation"
import { signInSchema, type SignInActionResult } from "@/types/db"
import { createRateLimiter, checkRateLimit, getClientIP, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit"

export async function handleSignIn(formData: FormData): Promise<SignInActionResult> {
  // Rate limiting check
  const loginEmail = formData.get("email") as string
  const ip = getClientIP(null)
  const rateLimiter = createRateLimiter(RATE_LIMIT_CONFIGS.signIn)
  const rateKey = `signin:${ip}:${loginEmail}`
  const rateResult = await checkRateLimit(rateLimiter, rateKey, RATE_LIMIT_CONFIGS.signIn)

  if (!rateResult.success) {
    const retryAfter = rateResult.retryAfter || 900
    redirect(`/sign-in?error=${encodeURIComponent(`Too many attempts. Please try again in ${retryAfter / 60} minute${retryAfter / 60 > 1 ? "s" : ""}`)}&retry-after=${retryAfter}`)
  }

  const result = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!result.success) {
    redirect(`/sign-in?error=${encodeURIComponent(result.error.issues[0]?.message || "Validation failed")}`)
  }

  const { email } = result.data

  const user = await prisma.user.findUnique({
    where: { email },
    select: { emailVerified: true },
  })

  const emailVerificationEnabled = process.env.ENABLE_EMAIL_VERIFICATION !== "false"
  const shouldRedirect = emailVerificationEnabled && user && !user.emailVerified

  try {
    await signIn("credentials", formData, {
      redirectTo: shouldRedirect ? "/verify-required" : "/dashboard",
    });
    return { success: true, data: null, error: null };
  } catch {
    return { success: false, data: null, error: "Invalid email or password" };
  }
}
