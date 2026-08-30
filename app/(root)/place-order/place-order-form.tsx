'use client'

import { useRouter } from 'next/navigation'
import { Check, Loader } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTransition } from 'react'
import { createOrder } from '@/lib/actions/order.actions'
import { toast } from 'sonner'

export default function PlaceOrderForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    startTransition(async () => {
      const res = await createOrder()

      if (!res.success) {
        toast.error(res.message)
        if (res.redirectTo) router.push(res.redirectTo)
        return
      }

      toast.success(res.message)
      if (res.redirectTo) router.push(res.redirectTo)
    })
  }

  return (
    <form onSubmit={handleSubmit} className='w-full'>
      <Button type='submit' disabled={isPending} className='w-full'>
        {isPending ? (
          <Loader className='w-4 h-4 animate-spin' />
        ) : (
          <Check className='w-4 h-4' />
        )}{' '}
        Place Order
      </Button>
    </form>
  )
}
