import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  const session = await auth()
  const isAuthPath = request.nextUrl.pathname.startsWith("/api/auth")
  
  if (!session && !isAuthPath) {
    const signInUrl = new URL("/api/auth/signin", request.url)
    signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname)
    return NextResponse.redirect(signInUrl)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
