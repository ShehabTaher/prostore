import { Button } from '@/components/ui/button'
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Unauthorized Access',
}
export default function UnauthorizedPage() {
  return (
    <div className='container mx-auto flex flex-col items-center justify-center space-y-4 h-[calc(100vh-2--px)]'>
      <h1 className='text-4xl font-bold'>Unauthorized Access</h1>
      <p className='text-lg text-gray-500'>
        You are not authorized to access this page
      </p>
      <Link href='/'>
        <Button>Go to Home</Button>
      </Link>
    </div>
  )
}
