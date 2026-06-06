import { authConfig } from "./auth.config"
import NextAuth from "next-auth"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import Credentials from "next-auth/providers/credentials"
import type { SignInFormData } from "@/types/db"

function isCredentialsInput(
  value: unknown,
): value is { email: string; password: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "email" in value &&
    "password" in value &&
    typeof (value as Record<string, unknown>).email === "string" &&
    typeof (value as Record<string, unknown>).password === "string"
  );
}

const overrideProviders = {
  providers: [
    ...authConfig.providers,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!isCredentialsInput(credentials)) {
          return null;
        }

        const { email, password } = credentials;

        if (!email || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user || !user.password) {
          return null
        }

        const isValid = await bcrypt.compare(
          password,
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
