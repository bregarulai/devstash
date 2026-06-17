import { auth } from "@/lib/auth/auth/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-client-ip", ip)

  const session = await auth()
  const isAuthPath = request.nextUrl.pathname.startsWith("/api/auth")
  
  if (!session && !isAuthPath) {
    const signInUrl = new URL("/sign-in", request.url)
    signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname)
    return NextResponse.redirect(signInUrl)
  }
  
  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
