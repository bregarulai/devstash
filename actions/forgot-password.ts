"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { resend } from "@/lib/resend"
import { createVerificationToken } from "@/lib/verification-token"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

const forgotPasswordSchema = z.object({
  email: z.email(),
})

export async function handleForgotPassword(formData: FormData) {
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

  const token = await createVerificationToken(email)

  const resetLink = `${process.env.AUTH_URL || "http://localhost:3000"}/reset-password?token=${token}&email=${encodeURIComponent(email)}`

  try {
    await resend.emails.send({
      from: "DevStash <onboarding@resend.dev>",
      to: email,
      subject: "Reset your DevStash password",
      html: `
        <h1>Reset your password</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
      `,
    })
  }
  catch (error) {
    console.error("Failed to send password reset email:", error)
  }

  revalidatePath("/forgot-password")
  redirect("/forgot-password?success=If+an+account+exists+with+that+email,+a+password+reset+link+has+been+sent.")
}
