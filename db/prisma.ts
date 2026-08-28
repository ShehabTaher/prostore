import { neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient as PrismaClientConstructor } from '../lib/generated/prisma/client'
import type { PrismaClient } from '../lib/generated/prisma/client'
import ws from 'ws'

neonConfig.webSocketConstructor = ws

const connectionString = process.env.DATABASE_URL!

const globalForPrisma = globalThis as unknown as {
  prismaBase: PrismaClient | undefined
}

function createPrismaBase(): PrismaClient {
  const adapter = new PrismaNeon({ connectionString })
  return new PrismaClientConstructor({ adapter })
}

const prismaBaseInstance = globalForPrisma.prismaBase ?? createPrismaBase()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prismaBase = prismaBaseInstance
}

export const prismaBase: PrismaClient = prismaBaseInstance

export const prisma = prismaBase.$extends({
  result: {
    product: {
      price: {
        compute(product: { price: { toString(): string } }) {
          return product.price.toString()
        },
      },
      rating: {
        compute(product: { rating: { toString(): string } }) {
          return product.rating.toString()
        },
      },
    },
  },
})
