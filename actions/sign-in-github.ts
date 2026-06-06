"use server"

import { signIn } from "@/lib/auth"

export async function handleSignInWithGitHub() {
  await signIn("github", {
    redirectTo: "/dashboard",
  })
}
