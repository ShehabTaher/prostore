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

function getOrCreatePrismaBase(): PrismaClient {
  const existing = globalForPrisma.prismaBase

  // HMR can keep an old client from before Order models existed
  if (existing && (existing as unknown as { order?: unknown }).order) {
    return existing
  }

  return createPrismaBase()
}

const prismaBaseInstance = getOrCreatePrismaBase()

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
    cart: {
      itemsPrice: {
        needs: { itemsPrice: true },
        compute(cart: { itemsPrice: { toString(): string } }) {
          return cart.itemsPrice.toString()
        },
      },
      shippingPrice: {
        needs: { shippingPrice: true },
        compute(cart: { shippingPrice: { toString(): string } }) {
          return cart.shippingPrice.toString()
        },
      },
      taxPrice: {
        needs: { taxPrice: true },
        compute(cart: { taxPrice: { toString(): string } }) {
          return cart.taxPrice.toString()
        },
      },
      totalPrice: {
        needs: { totalPrice: true },
        compute(cart: { totalPrice: { toString(): string } }) {
          return cart.totalPrice.toString()
        },
      },
    },
    orderItem: {
      price: {
        needs: { price: true },
        compute(orderItem: { price: { toString(): string } }) {
          return orderItem.price.toString()
        },
      },
    },
    order: {
      itemsPrice: {
        needs: { itemsPrice: true },
        compute(order: { itemsPrice: { toString(): string } }) {
          return order.itemsPrice.toString()
        },
      },
      shippingPrice: {
        needs: { shippingPrice: true },
        compute(order: { shippingPrice: { toString(): string } }) {
          return order.shippingPrice.toString()
        },
      },
      taxPrice: {
        needs: { taxPrice: true },
        compute(order: { taxPrice: { toString(): string } }) {
          return order.taxPrice.toString()
        },
      },
      totalPrice: {
        needs: { totalPrice: true },
        compute(order: { totalPrice: { toString(): string } }) {
          return order.totalPrice.toString()
        },
      },
    },
  },
})
