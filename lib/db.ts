import { prismaBase } from '@/db/prisma'
import type { UserModel } from '../lib/generated/prisma/models/User'
import type { CartModel } from '../lib/generated/prisma/models/Cart'
import type { OrderModel } from '../lib/generated/prisma/models/Order'
import type { OrderItemModel } from '../lib/generated/prisma/models/OrderItem'
import type { ShippingAddress, CartItem } from '@/types'

type UserClient = {
  findFirst(args: {
    where: { email: string }
  }): Promise<UserModel | null>
  create(args: {
    data: {
      name: string
      email: string
      password: string
    }
  }): Promise<UserModel>
  update(args: {
    where: { id: string }
    data: { name: string }
  }): Promise<UserModel>
}

type CartClient = {
  findFirst(args: {
    where: { sessionCartId: string }
  }): Promise<CartModel | null>
  deleteMany(args: {
    where: { userId: string }
  }): Promise<{ count: number }>
  update(args: {
    where: { id: string }
    data:
      | { userId: string }
      | {
          items: CartItem[]
          totalPrice: number | string
          itemsPrice: number | string
          shippingPrice: number | string
          taxPrice: number | string
        }
  }): Promise<CartModel>
}

type OrderClient = {
  create(args: {
    data: {
      userId: string
      shippingAddress: ShippingAddress
      paymentMethod: string
      itemsPrice: string
      shippingPrice: string
      taxPrice: string
      totalPrice: string
    }
  }): Promise<OrderModel>
}

type OrderItemClient = {
  create(args: {
    data: {
      orderId: string
      productId: string
      name: string
      slug: string
      image: string
      price: string
      quantity: number
    }
  }): Promise<OrderItemModel>
}

function getUserClient() {
  return (prismaBase as unknown as { user: UserClient }).user
}

function getCartClient() {
  return (prismaBase as unknown as { cart: CartClient }).cart
}

function getOrderClient() {
  const order = (prismaBase as unknown as { order: OrderClient }).order
  if (!order) {
    throw new Error(
      'Prisma Order model is unavailable. Restart the dev server after running prisma generate.',
    )
  }
  return order
}

function getOrderItemClient() {
  const orderItem = (prismaBase as unknown as { orderItem: OrderItemClient })
    .orderItem
  if (!orderItem) {
    throw new Error(
      'Prisma OrderItem model is unavailable. Restart the dev server after running prisma generate.',
    )
  }
  return orderItem
}

export async function getUserByEmail(email: string) {
  return getUserClient().findFirst({ where: { email } })
}

export async function createUser(data: {
  name: string
  email: string
  password: string
}) {
  return getUserClient().create({ data })
}

export async function updateUserName(id: string, name: string) {
  return getUserClient().update({ where: { id }, data: { name } })
}

/** Merge guest session cart into the signed-in user's cart */
export async function assignSessionCartToUser(
  sessionCartId: string,
  userId: string,
) {
  const cart = getCartClient()
  const sessionCart = await cart.findFirst({ where: { sessionCartId } })
  if (!sessionCart) return

  await cart.deleteMany({ where: { userId } })

  await cart.update({
    where: { id: sessionCart.id },
    data: { userId },
  })
}

export async function createOrderWithItems(
  orderData: {
    userId: string
    shippingAddress: ShippingAddress
    paymentMethod: string
    itemsPrice: string
    shippingPrice: string
    taxPrice: string
    totalPrice: string
  },
  items: CartItem[],
  cartId: string,
) {
  const order = getOrderClient()
  const orderItem = getOrderItemClient()
  const cart = getCartClient()

  const insertedOrder = await order.create({ data: orderData })

  for (const item of items) {
    await orderItem.create({
      data: {
        orderId: insertedOrder.id,
        productId: item.productId,
        name: item.name,
        slug: item.slug,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
      },
    })
  }

  await cart.update({
    where: { id: cartId },
    data: {
      items: [],
      totalPrice: 0,
      itemsPrice: 0,
      shippingPrice: 0,
      taxPrice: 0,
    },
  })

  return insertedOrder
}
