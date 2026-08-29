import NextAuth from 'next-auth'
import { authConfig } from '@/auth.config'

const { auth } = NextAuth(authConfig)

// Next.js 16 renamed middleware → proxy; must be a real function export
export default auth

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
