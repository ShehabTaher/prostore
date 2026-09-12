import { auth } from '@/auth'
import { deleteOrder, getAllOrders } from '@/lib/actions/order.actions'
import Pagination from '@/components/shared/pagination'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { shortenUuid } from '@/lib/utils'
import { formatDateTime } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import DeleteDialog from '@/components/shared/delete-dialog'
export const metadata: Metadata = {
  title: 'Admin Orders',
}
const OrdersPage = async (props: {
  searchParams: Promise<{ page: string }>
}) => {
  const { page = '1' } = await props.searchParams
  const session = await auth()
  if (session?.user?.role !== 'admin')
    throw new Error('User is not Unauthorized')

  const orders = await getAllOrders({
    page: Number(page),
    limit: 2,
  })

  return (
    <>
      <div className='space-y-2'>
        <h2 className='h2-bold'>Orders</h2>
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Delivered</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.data.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{shortenUuid(order.id)}</TableCell>
                  <TableCell>
                    {formatDateTime(order.createdAt).dateTime}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(order.totalPrice.toNumber())}
                  </TableCell>
                  <TableCell>
                    {order.isPaid && order.paidAt
                      ? formatDateTime(order.paidAt).dateTime
                      : 'Not Paid'}
                  </TableCell>
                  <TableCell>
                    {order.isDelivered && order.deliveredAt
                      ? formatDateTime(order.deliveredAt).dateTime
                      : 'Not Delivered'}
                  </TableCell>
                  <TableCell>
                    <Button variant='outline' size='sm' asChild>
                      <Link href={`/order/${order.id}`}>View</Link>
                    </Button>
                    <DeleteDialog id={order.id} action={deleteOrder} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {orders.totalPages > 1 && (
            <Pagination
              page={Number(page) || 1}
              totalPages={orders.totalPages}
            />
          )}
        </div>
      </div>
    </>
  )
}

export default OrdersPage
