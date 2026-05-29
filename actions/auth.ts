"use server"

import { signOut as nextAuthSignOut } from "@/lib/auth"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { resend } from "@/lib/resend"
import { createVerificationToken } from "@/lib/verification-token"

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export async function handleRegister(formData: FormData) {
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
    redirect("/register?error=User+with+this+email+already+exists")
  }

  const hashedPassword = await bcrypt.hash(password, 10)

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


