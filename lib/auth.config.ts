import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"

export const authConfig = {
  providers: [], // Providers are defined in auth.ts to avoid Edge compatibility issues with bcrypt/Prisma
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      // Fallback: NextAuth always sets token.sub to the user's id
      if (!token.id && token.sub) {
        token.id = token.sub
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/login',
  },
  session: { strategy: "jwt" },
} satisfies NextAuthConfig
