import { cn } from '@/lib/utils'
const ProductPrice = ({
  price,
  className,
}: {
  price: number
  className?: string
}) => {
  // format price to 2 decimal places
  const fixedPrice = price.toFixed(2)

  const [intValue, floatValue] = fixedPrice.split('.')

  return (
    <p className={cn('text-2xl', className)}>
      <span className='text-xs align-super'>$</span>
      {intValue}
      <span className='text-xs align-super'>.</span>
      <span className='text-xs align-super'>{floatValue}</span>
    </p>
  )
}

export default ProductPrice
