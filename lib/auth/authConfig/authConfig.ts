import type { NextAuthConfig } from "next-auth"
import { prisma } from "@/lib/prisma/prisma"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GitHub from "next-auth/providers/github"

const GitHubProvider = GitHub({
  allowDangerousEmailAccountLinking: false,
})

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [GitHubProvider],
  session: { strategy: "jwt" },
  trustHost: true,
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`
      const urlObj = new URL(url)
      if (urlObj.origin === baseUrl) return url
      return baseUrl
    },
    async jwt({ token, user }) {
      if (user) {
        (token as { id: string }).id = String(user.id);
      }
      return token;
    },
    async session({ session, token }) {
      if ((token as { id?: string }).id) {
        session.user.id = String((token as { id: string }).id);
      }
      return session;
    },
  },
} satisfies NextAuthConfig
