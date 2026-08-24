import { Metadata } from 'next'
import { getLatestProducts } from '@/lib/actions/product.actions'
import ProductList from '@/components/shared/product/product-list'
export const metadata: Metadata = {
  title: 'Home',
}
const HomePage = async () => {
  const latestProducts = await getLatestProducts()
  return (
    <>
      <ProductList data={latestProducts} title='Featured Products' />
    </>
  )
}

export default HomePage
