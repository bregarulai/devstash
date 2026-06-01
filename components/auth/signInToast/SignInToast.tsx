"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
import { toast } from "sonner"

export function SignInToast() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const shown = useRef(false)

  useEffect(() => {
    const success = searchParams.get("success")
    const error = searchParams.get("error")
    if ((success || error) && !shown.current) {
      shown.current = true
      if (success === "registered") {
        toast.success("Account created!", {
          description: "You can now sign in to your account.",
        })
      }
      if (success === "resent") {
        toast.success("Verification email sent", {
          description: "A new verification email has been sent to your inbox.",
        })
      }
      if (error === "Invalid email or password") {
        toast.error("Sign in failed", {
          description: "Invalid email or password.",
        })
      }
      router.replace("/sign-in")
    }
  }, [searchParams, router])

  return null
}
