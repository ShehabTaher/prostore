'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signInDefaultValues, signUpDefaultValues } from '@/lib/constants'
import Link from 'next/link'
import { signUpUser } from '@/lib/actions/user.action'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

const SignUpButton = () => {
  const { pending } = useFormStatus()
  return (
    <Button
      className='w-full'
      variant='default'
      disabled={pending}
      type='submit'
    >
      {pending ? <Loader2 className='w-4 h-4 mr-2 animate-spin' /> : 'Sign Up'}
    </Button>
  )
}

const SignUpForm = () => {
  const [data, action] = useActionState(signUpUser, {
    success: false,
    message: '',
  })
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl')
  return (
    <form action={action}>
      <input type='hidden' name='callbackUrl' value={callbackUrl || '/'} />
      <div className='space-y-6'>
        <div className=''>
          <Label htmlFor='name'>Name</Label>
          <Input
            id='name'
            name='name'
            type='text'
            autoComplete='name'
            defaultValue={signUpDefaultValues.name}
          />
        </div>
        <div className=''>
          <Label htmlFor='email'>Email</Label>
          <Input
            id='email'
            name='email'
            type='text'
            autoComplete='email'
            defaultValue={signUpDefaultValues.email}
          />
        </div>
        <div className=''>
          <Label htmlFor='password'>Password</Label>
          <Input
            id='password'
            name='password'
            type='password'
            autoComplete='new-password'
            required
            defaultValue={signUpDefaultValues.password}
          />
        </div>

        <div className=''>
          <Label htmlFor='confirmPassword'>Confirm Password</Label>
          <Input
            id='confirmPassword'
            name='confirmPassword'
            type='password'
            autoComplete='new-password'
            required
            defaultValue={signUpDefaultValues.confirmPassword}
          />
        </div>

        <div>
          <SignUpButton />
        </div>
        {data && !data.success && (
          <div className='text-sm text-center text-destructive'>
            {data.message}
          </div>
        )}
        <div className='text-sm text-center text-muted-foreground'>
          Already have an account?{' '}
          <Link href='/sign-in' target='_self'>
            Sign In
          </Link>
        </div>
      </div>
    </form>
  )
}

export default SignUpForm
