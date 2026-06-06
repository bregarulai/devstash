"use server"

import { prisma } from "@/lib/prisma"
import { signIn } from "@/lib/auth"
import { redirect } from "next/navigation"
import { signInSchema, type SignInActionResult } from "@/types/db"

export async function handleSignIn(formData: FormData): Promise<SignInActionResult> {
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
  } catch (error) {
    return { success: false, data: null, error: "Invalid email or password" };
  }
}
