'use client'

import { LogOutIcon } from 'lucide-react'
import { signOutUser } from '@/lib/actions/user.action'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

const SignOutForm = () => {
  return (
    <DropdownMenuItem
      className='p-0 mb-1'
      onSelect={(event) => {
        event.preventDefault()
      }}
    >
      <form action={signOutUser} className='w-full'>
        <Button
          type='submit'
          className='w-full py-4 px-2 h-4 justify-start'
          variant='ghost'
        >
          <LogOutIcon className='w-4 h-4 mr-2' />
          Sign Out
        </Button>
      </form>
    </DropdownMenuItem>
  )
}

export default SignOutForm
