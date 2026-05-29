"use server"

import { prisma } from "@/lib/prisma"
import { signIn } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function handleSignIn(formData: FormData) {
  const email = formData.get("email") as string

  const user = await prisma.user.findUnique({
    where: { email },
  })

  const emailVerificationEnabled = process.env.ENABLE_EMAIL_VERIFICATION !== "false"

  if (emailVerificationEnabled && user && !user.emailVerified) {
    redirect(`/sign-in?error=UnverifiedEmail&email=${encodeURIComponent(email)}`)
    return
  }

  await signIn("credentials", formData)
}
