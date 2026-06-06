import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyTokenSchema } from "@/types/db"
import crypto from "crypto"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const token = searchParams.get("token")

  const result = verifyTokenSchema.safeParse({ token })

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0].message },
      { status: 400 }
    )
  }

  const hashedToken = crypto.createHash("sha256").update(result.data.token).digest("hex")

  const existingToken = await prisma.verificationToken.findFirst({
    where: { token: hashedToken },
  })

  if (!existingToken) {
    return NextResponse.json(
      { error: "Verification link has expired or is invalid" },
      { status: 400 }
    )
  }

  if (existingToken.expires < new Date()) {
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
    await prisma.verificationToken.deleteMany({
      where: { identifier: existingToken.identifier, token: hashedToken },
    }).catch(() => {})
    return NextResponse.json(
      { message: "Email already verified" },
      { status: 200 }
    )
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: new Date() },
  })

  await prisma.verificationToken.deleteMany({
    where: { identifier: existingToken.identifier, token: hashedToken },
  }).catch(() => {})

  return NextResponse.json(
    { message: "Email verified successfully" },
    { status: 200 }
  )
}
