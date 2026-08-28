import { Button } from '@/components/ui/button'
import ModeToggle from './mode-toggle'
import Link from 'next/link'
import { EllipsisVertical, ShoppingCart, UserIcon } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import UserButton from './user-button'

const Menu = () => {
  return (
    <div className='flex justify-end gap-3'>
      <nav className='hidden md:flex w-full max-w-xs items-center gap-1'>
        <ModeToggle />
        <Button asChild variant='ghost'>
          <Link href='/cart'>
            <ShoppingCart /> Cart
          </Link>
        </Button>
        <UserButton />
      </nav>

      <nav className='md:hidden'>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant='ghost' size='icon' aria-label='Open menu'>
              <EllipsisVertical />
            </Button>
          </SheetTrigger>
          <SheetContent className='flex w-72 flex-col gap-0 p-0 sm:max-w-xs'>
            <SheetHeader className='border-b px-5 py-4 text-left'>
              <SheetTitle className='text-lg font-semibold'>Menu</SheetTitle>
              <SheetDescription className='sr-only'>
                Mobile navigation
              </SheetDescription>
            </SheetHeader>

            <div className='flex flex-1 flex-col gap-1 p-3'>
              <div className='flex h-11 items-center justify-between rounded-lg px-3'>
                <span className='text-sm font-medium'>Theme</span>
                <ModeToggle />
              </div>

              <Button
                asChild
                variant='ghost'
                className='mt-2 h-11 w-full gap-2 border-2 border-gray-100'
              >
                <Link href='/cart'>
                  <ShoppingCart /> Cart
                </Link>
              </Button>

              <UserButton />
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  )
}

export default Menu
