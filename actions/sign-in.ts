"use server"

import { prisma } from "@/lib/prisma"
import { signIn } from "@/lib/auth"
import { redirect } from "next/navigation"
import { signInSchema } from "@/types/signIn"

export async function handleSignIn(formData: FormData) {
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
  })

  const emailVerificationEnabled = process.env.ENABLE_EMAIL_VERIFICATION !== "false"

  if (emailVerificationEnabled && user && !user.emailVerified) {
    redirect(`/sign-in?error=UnverifiedEmail&email=${encodeURIComponent(email)}`)
    return
  }

  try {
    await signIn("credentials", formData)
  } catch {
    redirect(`/sign-in?error=Invalid+email+or+password`)
  }
}
