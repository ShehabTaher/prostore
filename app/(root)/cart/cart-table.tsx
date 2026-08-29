'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Cart } from '@/types'
import { useTransition } from 'react'
import { removeItemFromCart, addToCart } from '@/lib/actions/cart.actions'
import { ArrowRight, Loader, Minus, Plus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

const CartTable = ({ cart }: { cart?: Cart }) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <>
      <h1 className='py-4 h2-bold'>Shopping Cart</h1>
      {!cart || cart.items.length === 0 ? (
        <div>
          Cart is Empty. <Link href='/'>Go Shopping</Link>
        </div>
      ) : (
        <div className='grid md:grid-cols-4 md:gap-5'>
          <div className='overflow-x-auto md:col-span-3'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className='text-center'>Quantity</TableHead>
                  <TableHead className='text-right'>Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.items.map((item) => (
                  <TableRow key={item.productId}>
                    <TableCell>
                      <Link
                        href={`/product/${item.slug}`}
                        className='flex items-center'
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={50}
                          height={50}
                        />
                        <span className='px-2'>{item.name}</span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className='flex-center gap-2'>
                        <Button
                          type='button'
                          variant='outline'
                          disabled={isPending}
                          onClick={() =>
                            startTransition(async () => {
                              const res = await removeItemFromCart(
                                item.productId,
                              )
                              if (!res.success) {
                                toast.error(res.message)
                                return
                              }
                              toast.success(res.message)
                              router.refresh()
                            })
                          }
                        >
                          {isPending ? (
                            <Loader className='h-4 w-4 animate-spin' />
                          ) : (
                            <Minus className='h-4 w-4' />
                          )}
                        </Button>
                        <span className='px-2'>{item.quantity}</span>
                        <Button
                          type='button'
                          variant='outline'
                          disabled={isPending}
                          onClick={() =>
                            startTransition(async () => {
                              const res = await addToCart({
                                ...item,
                                quantity: 1,
                              })
                              if (!res.success) {
                                toast.error(res.message)
                                return
                              }
                              toast.success(res.message)
                              router.refresh()
                            })
                          }
                        >
                          {isPending ? (
                            <Loader className='h-4 w-4 animate-spin' />
                          ) : (
                            <Plus className='h-4 w-4' />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className='text-right'>
                      {formatCurrency(item.price)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Card>
            <CardContent className='p-4 gap-4'>
              <div className='pb-3 text-xl'>
                Subtotal ({cart.items.reduce((a, c) => a + c.quantity, 0)}):
                <span>
                  {formatCurrency(
                    cart.items.reduce(
                      (a, c) => a + Number(c.price) * c.quantity,
                      0,
                    ),
                  )}
                </span>
              </div>
              <Button
                className='w-full'
                disabled={isPending}
                onClick={() =>
                  startTransition(() => router.push('/shipping-address'))
                }
              >
                {isPending ? (
                  <Loader className='h-4 w-4 animate-spin' />
                ) : (
                  <ArrowRight className='h-4 w-4' />
                )}{' '}
                Proceed to Checkout
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}

export default CartTable
