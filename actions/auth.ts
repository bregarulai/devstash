"use server"

import { signOut as nextAuthSignOut, signIn } from "@/lib/auth"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

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

  revalidatePath("/register")
  redirect("/sign-in")
}

export async function handleSignOut() {
  await nextAuthSignOut({ redirectTo: "/" })
}

const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
})

export async function handleSignIn(data: FormData) {
  const result = signInSchema.safeParse({
    email: data.get("email"),
    password: data.get("password"),
  })

  if (!result.success) {
    return { error: result.error.issues[0]?.message || "Validation failed" }
  }

  const { email, password } = result.data

  try {
    await signIn("credentials", {
      email,
      password,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/sign-in?error=InvalidCredentials")
    }
    throw error
  }

  redirect("/dashboard")
}
