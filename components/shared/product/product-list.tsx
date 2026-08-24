import ProductCard from './product-card'
import { Product } from '@/types'
const ProductList = ({
  data,
  title,
  limit,
}: {
  data: Product[]
  title?: string
  limit?: number
}) => {
  const limitedProducts = data.slice(0, limit)
  return (
    <div className='my-10'>
      <h2 className='h2-bold mb-4'>{title}</h2>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {limitedProducts.map((product: Product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </div>
  )
}

export default ProductList
