import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prismaBase } from '@/db/prisma'
import { getUserByEmail, updateUserName } from '@/lib/db'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compareSync } from 'bcrypt-ts-edge/browser'
import { authConfig } from '@/auth.config'

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
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        if (user.name === 'NO_NAME' && user.id && user.email) {
          const name = user.email.split('@')[0]
          token.name = name
          await updateUserName(user.id, name)
        }
      }
      return token
    },
  },
})
