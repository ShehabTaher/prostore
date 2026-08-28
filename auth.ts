import NextAuth, { type NextAuthConfig } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prismaBase } from '@/db/prisma'
import { getUserByEmail, updateUserName } from '@/lib/db'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compareSync } from 'bcrypt-ts-edge/browser'

export const config = {
  pages: {
    signIn: '/sign-in',
    error: '/sign-in',
  },
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60,
  },
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
        // If no user is found or the password is incorrect, return null
        return null
      },
    }),
  ],
  callbacks: {
    async session({ session, user, trigger, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
        session.user.role = token.role
        session.user.name = token.name

        if (trigger === 'update' && user?.name) {
          session.user.name = user.name
        }
      }

      return session
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user, trigger, session }: any) {
      if (user) {
        token.role = user.role
        if (user.name === 'NO_NAME') {
          token.name = user.email!.split('@')[0]
          await updateUserName(user.id, token.name)
        }
      }
      return token
    },
  },
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)
