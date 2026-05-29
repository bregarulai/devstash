import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const token = searchParams.get("token")

  if (!token) {
    return NextResponse.json(
      { error: "Missing verification token" },
      { status: 400 }
    )
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

  const existingToken = await prisma.verificationToken.findFirst({
    where: { token: hashedToken },
  })

  if (!existingToken) {
    const user = await prisma.user.findFirst({
      where: { emailVerified: { not: null } },
    })
    if (user) {
      return NextResponse.json(
        { message: "Email already verified" },
        { status: 200 }
      )
    }
    return NextResponse.json(
      { error: "Verification link has expired or is invalid" },
      { status: 400 }
    )
  }

  if (existingToken.expires < new Date()) {
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: existingToken.identifier,
          token: hashedToken,
        },
      },
    })
    return NextResponse.json(
      { error: "Verification link has expired or is invalid" },
      { status: 400 }
    )
  }

  const user = await prisma.user.findUnique({
    where: { email: existingToken.identifier },
  })

  if (!user) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    )
  }

  if (user.emailVerified) {
    return NextResponse.json(
      { message: "Email already verified" },
      { status: 200 }
    )
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: new Date() },
  })

  await prisma.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: existingToken.identifier,
        token: hashedToken,
      },
    },
  })

  return NextResponse.json(
    { message: "Email verified successfully" },
    { status: 200 }
  )
}
