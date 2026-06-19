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
import { getVerificationEmailHtml, getVerificationEmailText } from "@/lib/email/templates/verification"

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
        html: getVerificationEmailHtml(verificationLink),
        text: getVerificationEmailText(verificationLink),
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
  } catch (error) {
    console.error('Failed to update password:', error)
    return { error: 'Failed to update password', data: null }
  }

  return { success: true, data: null }
}


