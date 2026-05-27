import type { NextAuthConfig } from "next-auth"
import { prisma } from "@/lib/prisma"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GitHub from "next-auth/providers/github"

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [GitHub],
  session: { strategy: "jwt" },
  trustHost: true,
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`
      const urlObj = new URL(url)
      if (urlObj.origin === baseUrl) return url
      return baseUrl
    },
  },
} satisfies NextAuthConfig
