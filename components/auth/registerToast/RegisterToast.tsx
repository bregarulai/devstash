"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
import { toast } from "sonner"

export function RegisterToast() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const shown = useRef(false)

  useEffect(() => {
    const error = searchParams.get("error")
    if (error && !shown.current) {
      shown.current = true
      toast.error("Registration failed", {
        description: decodeURIComponent(error),
      })
      router.replace("/register")
    }
  }, [searchParams, router])

  return null
}
