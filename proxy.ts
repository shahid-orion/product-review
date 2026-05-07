import NextAuth from "next-auth"
import { authConfig } from "./lib/auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnAdmin = req.nextUrl.pathname.startsWith('/admin')

  if (isOnAdmin) {
    if (!isLoggedIn) {
      return Response.redirect(new URL('/auth/login', req.nextUrl))
    }
    
    // Check RBAC role
    if (req.auth?.user.role !== 'ADMIN') {
      return Response.redirect(new URL('/', req.nextUrl))
    }
  }

  return undefined
})

export const config = {
  matcher: ['/admin/:path*'],
}
