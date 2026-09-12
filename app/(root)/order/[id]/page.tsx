import { getOrderById } from '@/lib/actions/order.actions'
import { OrderDetailsTable } from './order-details-table'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ShippingAddress } from '@/types'
import { auth } from '@/auth'

export const metadata: Metadata = {
  title: 'Order',
}

const OrderDetailsPage = async (props: { params: Promise<{ id: string }> }) => {
  const { id } = await props.params

  const order = await getOrderById(id)
  if (!order) notFound()

  const session = await auth()

  return (
    <div>
      <OrderDetailsTable
        order={{
          ...order,
          shippingAddress: order.shippingAddress as ShippingAddress,
        }}
        paypalClientId={process.env.PAYPAL_CLIENT_ID || ''}
        isAdmin={session?.user?.role === 'admin' || false}
      />
    </div>
  )
}

export default OrderDetailsPage
