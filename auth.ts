import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prismaBase } from '@/db/prisma'
import {
  getUserByEmail,
  updateUserName,
  assignSessionCartToUser,
} from '@/lib/db'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compareSync } from 'bcrypt-ts-edge/browser'
import { authConfig } from '@/auth.config'
import { cookies } from 'next/headers'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prismaBase as never),
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await getUserByEmail(credentials.email as string)

        if (user && user.password) {
          const passwordsMatch = compareSync(
            credentials.password as string,
            user.password,
          )

          if (passwordsMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            }
          }
        }

        return null
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,

    // Attach JWT fields onto the session sent to the client
    async session({ session, user, trigger, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
        session.user.role = token.role
        session.user.name = token.name

        // Allow client-side session.update() to sync the name
        if (trigger === 'update' && user?.name) {
          session.user.name = user.name
        }
      }

      return session
    },

    // Persist custom fields on the JWT and merge guest cart on sign-in
    async jwt({ token, user, trigger, session }) {
      // Assign user fields to token on first sign-in
      if (user) {
        token.id = user.id
        token.role = user.role

        // If user has no name, derive one from their email
        if (user.name === 'NO_NAME' && user.id && user.email) {
          const name = user.email.split('@')[0]
          token.name = name

          // Keep the database in sync with the token name
          await updateUserName(user.id, name)
        }

        // On sign-in / sign-up, merge the guest session cart into the user cart
        if ((trigger === 'signIn' || trigger === 'signUp') && user.id) {
          const cookiesObject = await cookies()
          const sessionCartId = cookiesObject.get('sessionCartId')?.value

          if (sessionCartId) {
            await assignSessionCartToUser(sessionCartId, user.id)
          }
        }
      }

      // Handle session updates (e.g. name change via session.update)
      if (session?.user.name && trigger === 'update') {
        token.name = session.user.name
      }

      return token
    },
  },
})
