import { auth } from '@/auth'
import { getMyCart } from '@/lib/actions/cart.actions'
import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import { ShippingAddress } from '@/types'
import { getUserById } from '@/lib/actions/user.action'
import ShippingAddressForm from './shipping-address-form'
import CheckoutSteps from '@/components/shared/checkout-steps'
export const metadata: Metadata = {
  title: 'Shipping Address',
}
export const ShippingAddressPage = async () => {
  const cart = await getMyCart()
  if (!cart || cart.items.length === 0) redirect('/cart')

  const session = await auth()

  const userId = session?.user?.id
  if (!userId) throw new Error('Unauthorized')

  const user = await getUserById(userId)
  return (
    <div>
      <CheckoutSteps current={1} />
      <ShippingAddressForm address={user.address as ShippingAddress} />
    </div>
  )
}

export default ShippingAddressPage
