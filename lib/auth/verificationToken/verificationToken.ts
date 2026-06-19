import { prisma } from "@/lib/prisma/prisma"
import crypto from "crypto"
import { TOKEN_EXPIRY_MS } from "@/lib/constants"

export async function createVerificationToken(email: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex")
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: hashedToken,
      expires: new Date(Date.now() + TOKEN_EXPIRY_MS),
    },
  })

  return token
}

export async function verifyToken(token: string): Promise<string | null> {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

  const existingToken = await prisma.verificationToken.findFirst({
    where: {
      token: hashedToken,
    },
  })

  if (!existingToken) {
    return null
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
    return null
  }

  await prisma.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: existingToken.identifier,
        token: hashedToken,
      },
    },
  })

  return existingToken.identifier
}
