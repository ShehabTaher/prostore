'use client'
import { updateProfileSchema } from '@/lib/validators'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { updateUserProfile } from '@/lib/actions/user.action'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader } from 'lucide-react'
import { useRouter } from 'next/navigation'
const ProfileForm = () => {
  const { data: session, update } = useSession()
  const router = useRouter()
  const form = useForm<z.infer<typeof updateProfileSchema>>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: session?.user?.name ?? '',
      email: session?.user?.email ?? '',
    },
  })

  const onSubmit = async (values: z.infer<typeof updateProfileSchema>) => {
    const response = await updateUserProfile(values)
    if (!response.success) {
      toast.error(response.message)
    }
    const newSession = {
      ...session,
      user: {
        ...session?.user,
        name: values.name,
      },
    }
    await update(newSession)
    toast.success('Profile updated successfully')
    router.refresh()
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='flex flex-col gap-5'
      >
        <div className='flex flex-col gap-6'>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled
                    placeholder='Email'
                    className='input-field'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder='Name'
                    className='input-field'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button
          type='submit'
          size={'lg'}
          className='button col-span-2 w-full'
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <Loader className='w-4 h-4 animate-spin' />
          ) : (
            'Update Profile'
          )}
        </Button>
      </form>
    </Form>
  )
}

export default ProfileForm
