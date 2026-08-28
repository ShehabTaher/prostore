'use client'

import { Button } from '@/components/ui/button'
import { Cart, CartItem } from '@/types'
import { Plus, Minus, Loader } from 'lucide-react'
import { toast } from 'sonner'
import { addToCart, removeItemFromCart } from '@/lib/actions/cart.actions'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

const AddToCart = ({ cart, item }: { cart?: Cart; item: CartItem }) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleAddToCart = async () => {
    startTransition(async () => {
      const res = await addToCart(item)

      if (!res.success) {
        toast.error(res.message)
        return
      }

      toast.success(res.message, {
        action: {
          label: 'Go to Cart',
          onClick: () => router.push('/cart'),
        },
      })

      router.refresh()
    })
  }

  const handleRemoveFromCart = async () => {
    startTransition(async () => {
      const res = await removeItemFromCart(item.productId)

      if (!res.success) {
        toast.error(res.message)
        return
      }

      toast.success(res.message)
      router.refresh()
    })
  }

  const isInCart =
    cart &&
    (cart.items as CartItem[]).find((x) => x.productId === item.productId)

  return isInCart ? (
    <div className='flex items-center gap-2'>
      <Button type='button' variant='outline' onClick={handleRemoveFromCart}>
        {isPending ? (
          <Loader className='h-4 w-4 animate-spin' />
        ) : (
          <Minus className='h-4 w-4' />
        )}
      </Button>
      <span className='px-2'>{isInCart.quantity}</span>
      <Button type='button' variant='outline' onClick={handleAddToCart}>
        {isPending ? (
          <Loader className='h-4 w-4 animate-spin' />
        ) : (
          <Plus className='h-4 w-4' />
        )}
      </Button>
    </div>
  ) : (
    <Button className='w-full' onClick={handleAddToCart}>
      <Plus className='h-4 w-4' />
      Add to Cart
    </Button>
  )
}

export default AddToCart
