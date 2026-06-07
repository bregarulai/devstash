"use server"

import { signIn } from "@/lib/auth"
import { redirect } from "next/navigation"
import { createRateLimiter, checkRateLimit, getClientIP, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit"

export async function handleSignInWithGitHub() {
  // Rate limiting check
  const ip = getClientIP(null)
  const rateLimiter = createRateLimiter(RATE_LIMIT_CONFIGS.githubOAuth)
  const rateKey = `github:${ip}`
  const rateResult = await checkRateLimit(rateLimiter, rateKey, RATE_LIMIT_CONFIGS.githubOAuth)

  if (!rateResult.success) {
    const retryAfter = rateResult.retryAfter || 900
    redirect(`/sign-in?error=${encodeURIComponent(`Too many GitHub sign-in attempts. Please try again in ${retryAfter / 60} minute${retryAfter / 60 > 1 ? "s" : ""}`)}&retry-after=${retryAfter}`)
  }

  await signIn("github", {
    redirectTo: "/dashboard",
  })
}
