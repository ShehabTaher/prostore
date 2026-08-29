import type { NextAuthConfig } from 'next-auth'
import { NextResponse } from 'next/server'

export const authConfig = {
  pages: {
    signIn: '/sign-in',
    error: '/sign-in',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [],
  callbacks: {
    authorized({ request, auth }) {
      // Protect checkout and account routes — redirect guests to /sign-in
      const protectedPaths = [
        /\/shipping-address/,
        /\/payment-method/,
        /\/place-order/,
        /\/profile/,
        /\/user\/(.*)/,
        /\/order\/(.*)/,
        /\/admin/,
      ]
      const { pathname } = request.nextUrl

      if (!auth && protectedPaths.some((p) => p.test(pathname))) {
        return false
      }

      // Ensure every visitor has a sessionCartId cookie for the guest cart
      if (!request.cookies.get('sessionCartId')) {
        const sessionCartId = crypto.randomUUID()
        const newRequestHeaders = new Headers(request.headers)

        const response = NextResponse.next({
          request: {
            headers: newRequestHeaders,
          },
        })

        response.cookies.set('sessionCartId', sessionCartId)
        return response
      }

      return true
    },
  },
} satisfies NextAuthConfig
