'use server'

import { signIn } from "@/lib/auth/auth/auth"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { createRateLimiter, checkRateLimit, RATE_LIMIT_CONFIGS } from "@/lib/auth/rateLimit/rateLimit"

export async function handleSignInWithGitHub() {
  // Rate limiting check
  const headersList = await headers()
  const ip = headersList.get("x-client-ip") ?? "unknown"
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
