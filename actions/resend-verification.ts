"use server"

import { prisma } from "@/lib/prisma"
import { resend } from "@/lib/resend"
import { createVerificationToken } from "@/lib/verification-token"
import { redirect } from "next/navigation"

export async function handleResendVerification(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user || user.emailVerified) {
    redirect("/sign-in")
  }

  const token = await createVerificationToken(email)

  const verificationLink = `${process.env.AUTH_URL || "http://localhost:3000"}/verify-email?token=${token}`

  try {
    await resend.emails.send({
      from: "DevStash <onboarding@resend.dev>",
      to: email,
      subject: "Verify your email address",
      html: `
        <h1>Verify your email address</h1>
        <p>Click the link below to verify your email address:</p>
        <a href="${verificationLink}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
      `,
    })
  } catch (error) {
    console.error("Failed to send verification email:", error)
  }

  redirect("/sign-in?success=resent")
}
