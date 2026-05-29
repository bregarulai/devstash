import { authConfig } from "./auth.config"
import NextAuth from "next-auth"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import Credentials from "next-auth/providers/credentials"

const overrideProviders = {
  providers: [
    ...authConfig.providers,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.password) {
          return null
        }

        if (process.env.ENABLE_EMAIL_VERIFICATION !== "false" && !user.emailVerified) {
          return null
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        )

        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        }
      },
    }),
  ],
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  ...overrideProviders,
})
