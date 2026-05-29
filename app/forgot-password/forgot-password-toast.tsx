"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
import { toast } from "sonner"

export function ForgotPasswordToast() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const shown = useRef(false)

  useEffect(() => {
    const success = searchParams.get("success")
    const error = searchParams.get("error")
    if ((success || error) && !shown.current) {
      shown.current = true
      if (success) {
        toast.success("Check your email", {
          description: success,
        })
      }
      if (error) {
        toast.error("Error", {
          description: decodeURIComponent(error),
        })
      }
      router.replace("/forgot-password")
    }
  }, [searchParams, router])

  return null
}
