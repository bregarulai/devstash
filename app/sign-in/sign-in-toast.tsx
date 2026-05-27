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
    if (success === "registered" && !shown.current) {
      shown.current = true
      toast.success("Account created!", {
        description: "You can now sign in to your account.",
      })
      router.replace("/sign-in")
    }
  }, [searchParams, router])

  return null
}
