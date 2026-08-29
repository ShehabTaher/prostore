import { prismaBase } from '@/db/prisma'
import type { UserModel } from '../lib/generated/prisma/models/User'
import type { CartModel } from '../lib/generated/prisma/models/Cart'

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
    data: { userId: string }
  }): Promise<CartModel>
}

function getUserClient() {
  return (prismaBase as unknown as { user: UserClient }).user
}

function getCartClient() {
  return (prismaBase as unknown as { cart: CartClient }).cart
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

  // Remove any existing cart tied to this user
  await cart.deleteMany({ where: { userId } })

  // Attach the guest session cart to the user
  await cart.update({
    where: { id: sessionCart.id },
    data: { userId },
  })
}
