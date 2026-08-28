'use server'

import { CartItem } from '@/types'
import { cookies } from 'next/headers'
import { formatError } from '../format-error'
import { auth } from '@/auth'
import { prisma } from '@/db/prisma'
import { convertToPlainObject, roundTo2DecimalPlaces } from '../utils'
import { cartSchema, insertCartSchema } from '../validators'
import { revalidatePath } from 'next/cache'

// calculate cart prices
const calcPrice = (items: CartItem[]) => {
  const itemsPrice = roundTo2DecimalPlaces(
    items.reduce(
      (acc, item) => acc + Number(item.price) * Number(item.quantity),
      0,
    ),
  )
  const shippingPrice = roundTo2DecimalPlaces(itemsPrice > 100 ? 0 : 10)
  const taxPrice = roundTo2DecimalPlaces(itemsPrice * 0.15)
  const totalPrice = roundTo2DecimalPlaces(
    itemsPrice + shippingPrice + taxPrice,
  )
  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  }
}

export const addToCart = async (data: CartItem) => {
  try {
    // check for cart cookie
    const sessionCartId = (await cookies()).get('sessionCartId')?.value
    if (!sessionCartId) throw new Error('session cart id not found')

    // get session and user ID
    const session = await auth()
    const userId = session?.user?.id ? (session.user.id as string) : undefined

    // get cart
    const cart = await getMyCart()

    // parse and validate item
    const item = cartSchema.parse(data)

    // find product in database
    const product = await prisma.product.findFirst({
      where: {
        id: item.productId,
      },
    })

    if (!product) throw new Error('product not found')

    if (!cart) {
      // create new cart
      const newCart = insertCartSchema.parse({
        sessionCartId: sessionCartId,
        userId: userId,
        items: [item],
        ...calcPrice([item]),
      })
      // create cart in database
      await prisma.cart.create({
        data: newCart,
      })

      // Revalidate Product Page
      revalidatePath(`/product/${item.slug}`)

      return {
        success: true,
        message: `${item.name} added to cart`,
      }
    } else {
      // check if item already in cart
      const existItem = (cart.items as CartItem[]).find(
        (x) => x.productId === item.productId,
      )
      if (existItem) {
        // check stock
        if (product.stock < existItem.quantity + item.quantity) {
          throw new Error('Product stock is not enough')
        }

        const updatedItems = (cart.items as CartItem[]).map((x) =>
          x.productId === item.productId
            ? { ...x, quantity: x.quantity + item.quantity }
            : x,
        )

        await prisma.cart.update({
          where: { id: cart.id },
          data: {
            items: updatedItems,
            ...calcPrice(updatedItems),
          },
        })
      } else {
        if (product.stock < item.quantity) {
          throw new Error('Product stock is not enough')
        }

        const updatedItems = [...(cart.items as CartItem[]), item]

        await prisma.cart.update({
          where: { id: cart.id },
          data: {
            items: updatedItems,
            ...calcPrice(updatedItems),
          },
        })
      }

      revalidatePath(`/product/${item.slug}`)

      return {
        success: true,
        message: `${item.name} ${existItem ? 'updated in' : 'added to'} cart`,
      }
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    }
  }
}

export async function getMyCart() {
  // check for cart cookie
  const sessionCartId = (await cookies()).get('sessionCartId')?.value

  if (!sessionCartId) throw new Error('session cart id not found')

  // get session and user ID
  const session = await auth()
  const userId = session?.user?.id ? (session.user.id as string) : undefined

  // get user cart from database
  const cart = await prisma.cart.findFirst({
    where: userId ? { userId: userId } : { sessionCartId: sessionCartId },
  })

  if (!cart) return undefined

  // convert decimals and return
  return convertToPlainObject({
    ...cart,
    items: cart.items as CartItem[],
    itemsPrice: cart.itemsPrice.toString(),
    totalPrice: cart.totalPrice.toString(),
    shippingPrice: cart.shippingPrice.toString(),
    taxPrice: cart.taxPrice.toString(),
  })
}

export async function removeItemFromCart(productId: string) {
  try {
    // check for cart cookie
    const sessionCartId = (await cookies()).get('sessionCartId')?.value
    if (!sessionCartId) throw new Error('session cart id not found')

    //get product
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
      },
    })
    if (!product) throw new Error('product not found')

    // get user cart
    const cart = await getMyCart()
    if (!cart) throw new Error('cart not found')
    // check for item
    const existItem = (cart.items as CartItem[]).find(
      (x) => x.productId === productId,
    )
    if (!existItem) throw new Error('item not found in cart')

    const updatedItems =
      existItem.quantity === 1
        ? (cart.items as CartItem[]).filter((x) => x.productId !== productId)
        : (cart.items as CartItem[]).map((x) =>
            x.productId === productId
              ? { ...x, quantity: x.quantity - 1 }
              : x,
          )

    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: updatedItems,
        ...calcPrice(updatedItems),
      },
    })

    revalidatePath(`/product/${product.slug}`)

    return {
      success: true,
      message:
        existItem.quantity === 1
          ? `${existItem.name} removed from cart`
          : `${existItem.name} quantity updated in cart`,
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    }
  }
}
