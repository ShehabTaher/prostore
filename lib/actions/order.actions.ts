'use server'

import { auth } from '@/auth'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { formatError } from '../format-error'
import { getMyCart } from './cart.actions'
import { getUserById } from './user.action'
import { insertOrderSchema } from '../validators'
import { createOrderWithItems } from '@/lib/db'
import { CartItem, ShippingAddress, PaypalPayment } from '@/types'
import { prismaBase } from '@/db/prisma'
import { convertToPlainObject } from '../utils'
import { paypal } from '../paypal'
import { revalidatePath } from 'next/cache'

export async function createOrder() {
  try {
    const session = await auth()
    if (!session?.user) throw new Error('Unauthorized')

    const cart = await getMyCart()
    const userId = session.user.id
    if (!userId) throw new Error('User not found')

    const user = await getUserById(userId)
    const items = (cart?.items ?? []) as CartItem[]

    if (!cart || items.length === 0) {
      return { success: false, message: 'Cart is empty', redirectTo: '/cart' }
    }
    if (!cart.id) throw new Error('Cart id not found')

    if (!user.address) {
      return {
        success: false,
        message: 'No shipping address found',
        redirectTo: '/shipping-address',
      }
    }
    if (!user.paymentMethod) {
      return {
        success: false,
        message: 'No payment method selected',
        redirectTo: '/payment-method',
      }
    }

    const order = insertOrderSchema.parse({
      userId: user.id,
      shippingAddress: user.address as ShippingAddress,
      paymentMethod: user.paymentMethod,
      itemsPrice: cart.itemsPrice,
      shippingPrice: cart.shippingPrice,
      taxPrice: cart.taxPrice,
      totalPrice: cart.totalPrice,
    })

    const insertedOrder = await createOrderWithItems(order, items, cart.id)

    return {
      success: true,
      message: 'Order created successfully',
      redirectTo: `/order/${insertedOrder.id}`,
    }
  } catch (error) {
    if (isRedirectError(error)) throw error
    return { success: false, message: formatError(error) }
  }
}

// get order by id
export async function getOrderById(orderId: string) {
  const data = await prismaBase.order.findFirst({
    where: { id: orderId },
    include: {
      orderItems: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })

  if (!data) return null

  return convertToPlainObject({
    ...data,
    itemsPrice: data.itemsPrice.toString(),
    shippingPrice: data.shippingPrice.toString(),
    taxPrice: data.taxPrice.toString(),
    totalPrice: data.totalPrice.toString(),
    orderItems: data.orderItems.map((item) => ({
      ...item,
      price: item.price.toString(),
    })),
  })
}

// create new paypal order
export async function createPayPalOrder(orderId: string) {
  try {
    const order = await prismaBase.order.findFirst({
      where: { id: orderId },
    })
    if (order) {
      // create paypal order
      const paypalOrder = await paypal.createOrder(Number(order.totalPrice))

      if (!paypalOrder?.id) {
        throw new Error('PayPal did not return an order id')
      }

      // update order with paypal order id
      await prismaBase.order.update({
        where: { id: orderId },
        data: {
          paymentResult: {
            id: paypalOrder.id,
            status: '',
            email_address: '',
            pricePaid: 0,
          },
        },
      })

      return {
        success: true,
        message: 'Paypal order created successfully',
        data: paypalOrder.id,
      }
    } else {
      return { success: false, message: 'Order not found' }
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// Approve paypal order and update order
export async function approvePayPalOrder(
  orderId: string,
  data: {
    orderID: string
  },
) {
  try {
    const order = await prismaBase.order.findFirst({
      where: { id: orderId },
    })
    if (!order) return { success: false, message: 'Order not found' }

    const captureResponse = await paypal.capturePayment(data.orderID)
    if (
      !captureResponse ||
      captureResponse.id !== (order.paymentResult as PaypalPayment)?.id ||
      captureResponse.status !== 'COMPLETED'
    ) {
      throw new Error('Paypal order capture failed')
    }
    // update order with paypal order capture response
    await updateOrderToPaid({
      orderId,
      paymentResult: {
        id: captureResponse.id,
        status: captureResponse.status,
        email_address: captureResponse.payer.email_address,
        pricePaid:
          captureResponse.purchase_units[0]?.payments?.captures?.[0]?.amount
            ?.value,
      },
    })

    revalidatePath(`/order/${orderId}`)
    return { success: true, message: 'Your order has been paid' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// Update order to paid
export async function updateOrderToPaid({
  orderId,
  paymentResult,
}: {
  orderId: string
  paymentResult?: PaypalPayment
}) {
  try {
    const order = await prismaBase.order.findFirst({
      where: { id: orderId },
      include: {
        orderItems: true,
      },
    })
    if (!order) return { success: false, message: 'Order not found' }

    if (order.isPaid) return { success: false, message: 'Order already paid' }

    // Transaction to update order and account for product stock
    await prismaBase.$transaction(async (tx) => {
      // iterate over products and update stock
      for (const item of order.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: -item.quantity,
            },
          },
        })
      }
      // set order to paid
      await tx.order.update({
        where: { id: orderId },
        data: {
          isPaid: true,
          paidAt: new Date(),
          paymentResult: paymentResult,
        },
      })
    })
  } catch (error) {
    return { success: false, message: formatError(error) }
  }

  // get update order after transaction
  const updatedOrder = await prismaBase.order.findFirst({
    where: { id: orderId },
    include: {
      orderItems: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })
  if (!updatedOrder) return { success: false, message: 'Order not found' }
}
