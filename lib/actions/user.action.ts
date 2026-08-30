'use server'
import {
  paymentMethodSchema,
  shippingAddressSchema,
  signInSchema,
  signUpSchema,
} from '@/lib/validators'
import { auth, signIn, signOut } from '@/auth'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { hashSync } from 'bcrypt-ts-edge'
import { createUser } from '@/lib/db'
import { formatError } from '@/lib/format-error'
import { prisma } from '@/db/prisma'
import { ShippingAddress } from '@/types'
import { z } from 'zod'

// Sign in user with credentials
export async function signInWithCredentials(
  prevState: unknown,
  formData: FormData,
) {
  try {
    const user = signInSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    })
    await signIn('credentials', user)
    return { success: true, message: 'Signed in successfully' }
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }
    return {
      success: false,
      message: 'Invalid email or password',
    }
  }
}

// Sign out user
export async function signOutUser() {
  await signOut()
}

// Sign up user
export async function signUpUser(prevState: unknown, formData: FormData) {
  try {
    const user = signUpSchema.parse({
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
    })

    const hashedPassword = hashSync(user.password, 10)

    await createUser({
      name: user.name,
      email: user.email,
      password: hashedPassword,
    })

    await signIn('credentials', {
      email: user.email,
      password: user.password,
    })
    return { success: true, message: 'Signed up successfully' }
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }
    return { success: false, message: formatError(error) }
  }
}

// get user by ID
export async function getUserById(userId: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId },
  })
  if (!user) {
    throw new Error('User not found')
  }
  return user
}

// update user shipping address
export async function updateUserAddress(data: ShippingAddress) {
  try {
    const session = await auth()

    const currentUser = await prisma.user.findFirst({
      where: { id: session?.user?.id },
    })
    if (!currentUser) {
      throw new Error('User not found')
    }

    const address = shippingAddressSchema.parse(data)
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { address },
    })
    return { success: true, message: 'Shipping address updated successfully' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// update user's payment method
export async function updateUserPaymentMethod(
  data: z.infer<typeof paymentMethodSchema>,
) {
  try {
    const session = await auth()
    const currentUser = await prisma.user.findFirst({
      where: { id: session?.user?.id },
    })
    if (!currentUser) {
      throw new Error('User not found')
    }
    const paymentMethod = paymentMethodSchema.parse(data)
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { paymentMethod: paymentMethod.type },
    })
    return { success: true, message: 'Payment method updated successfully' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// update user profile
export async function updateUserProfile(user: { name: string; email: string }) {
  try {
    const session = await auth()
    const currentUser = await prisma.user.findFirst({
      where: { id: session?.user?.id },
    })
    if (!currentUser) {
      throw new Error('User not found')
    }
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { name: user.name, email: user.email },
    })
    return { success: true, message: 'Profile updated successfully' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}
