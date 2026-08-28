import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { APP_NAME } from '@/lib/constants'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import SignUpForm from './signup-form'
export const metadata: Metadata = {
  title: 'Sign Up',
}
const SignUpPage = async (props: {
  searchParams: Promise<{ callbackUrl?: string }>
}) => {
  const { callbackUrl } = await props.searchParams

  const session = await auth()
  if (session) {
    redirect(callbackUrl || '/')
  }

  return (
    <div className='w-full max-w-md mx-auto'>
      <Card>
        <CardHeader className='space-y-4'>
          <Link href='/' className='flex-center'>
            <Image
              src='/images/logo.svg'
              alt={`${APP_NAME} logo`}
              width={48}
              height={48}
              priority={true}
            />
          </Link>
          <CardTitle className='text-2xl font-bold text-center'>
            Create Account
          </CardTitle>
          <CardDescription className='text-center'>
            Create an account to get started
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <SignUpForm />
        </CardContent>
      </Card>
    </div>
  )
}

export default SignUpPage
