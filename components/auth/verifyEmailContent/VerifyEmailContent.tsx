'use client'

import { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type VerificationStatus = 'loading' | 'success' | 'error' | 'no-token' | 'pending'

export function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const success = searchParams.get('success')

  const { status: initialStatus, message: initialMessage } = useMemo(() => {
    if (success === 'registered') {
      return {
        status: 'pending' as VerificationStatus,
        message: "We've sent a verification link to your email. Please check your inbox and click the link to verify your account.",
      }
    }
    if (!token) {
      return {
        status: 'no-token' as VerificationStatus,
        message: "We've sent you a verification link. Please check your inbox.",
      }
    }
    return {
      status: 'loading' as VerificationStatus,
      message: 'Please wait while we verify your email address.',
    }
  }, [success, token])

  const [status, setStatus] = useState<VerificationStatus>(initialStatus)
  const [message, setMessage] = useState(initialMessage)

  useEffect(() => {
    if (!token) return

    async function verifyEmail() {
      try {
        const response = await fetch(`/api/auth/verify?token=${token}`)
        const data = await response.json()

        if (response.ok) {
          setStatus('success')
          setMessage(data.message)
        } else {
          setStatus('error')
          setMessage(data.error || 'Verification failed')
        }
      } catch {
        setStatus('error')
        setMessage('An unexpected error occurred')
      }
    }

    verifyEmail()
  }, [token])

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4">
          {status === 'loading' && (
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
          )}
          {status === 'success' && (
            <CheckCircle className="h-12 w-12 text-green-500" />
          )}
          {status === 'error' && (
            <XCircle className="h-12 w-12 text-destructive" />
          )}
          {status === 'no-token' && (
            <Mail className="h-12 w-12 text-muted-foreground" />
          )}
          {status === 'pending' && (
            <Mail className="h-12 w-12 text-muted-foreground" />
          )}
        </div>
        <CardTitle className="text-2xl">
          {status === 'loading' && 'Verifying your email...'}
          {status === 'success' && 'Email Verified!'}
          {status === 'error' && 'Verification Failed'}
          {status === 'no-token' && 'Check your email'}
          {status === 'pending' && 'Check your email'}
        </CardTitle>
        <CardDescription>
          {message}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {status === 'error' && message.includes('expired') && (
          <p className="text-center text-sm text-muted-foreground">
            Your verification link has expired. Please request a new one.
          </p>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        {status === 'success' && (
          <Button asChild className="w-full">
            <Link href="/sign-in">Sign in to your account</Link>
          </Button>
        )}
        {status === 'error' && (
          <Button asChild variant="outline" className="w-full">
            <Link href="/register">Try registering again</Link>
          </Button>
        )}
        {status === 'no-token' && (
          <Button asChild variant="outline" className="w-full">
            <Link href="/sign-in">Back to sign in</Link>
          </Button>
        )}
        {status === 'pending' && (
          <Button asChild variant="outline" className="w-full">
            <Link href="/sign-in">Back to sign in</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
