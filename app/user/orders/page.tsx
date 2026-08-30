import { Metadata } from 'next'
import { getMyOrders } from '@/lib/actions/order.actions'
import { formatCurrency, formatDateTime, shortenUuid } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Link from 'next/link'
import Pagination from '@/components/shared/pagination'

export const metadata: Metadata = {
  title: 'Orders',
}

const OrderPage = async (props: {
  searchParams: Promise<{ page: string }>
}) => {
  const { page } = await props.searchParams
  const orders = await getMyOrders({ page: Number(page) || 1 })

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
                    <Link href={`/order/${order.id}`}>
                      <span className='px-2'>View</span>
                    </Link>
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

export default OrderPage
