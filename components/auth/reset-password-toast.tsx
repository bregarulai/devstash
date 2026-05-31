"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
import { toast } from "sonner"

export function ResetPasswordToast() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const shown = useRef(false)

  useEffect(() => {
    const success = searchParams.get("success")
    const error = searchParams.get("error")
    if ((success || error) && !shown.current) {
      shown.current = true
      if (success === "password-reset") {
        searchParams.get("email")
        toast.success("Password reset", {
          description: `Your password has been reset. Sign in with your new password.`,
        })
      }
      if (error) {
        toast.error("Error", {
          description: decodeURIComponent(error),
        })
      }
      router.replace("/reset-password")
    }
  }, [searchParams, router])

  return null
}
