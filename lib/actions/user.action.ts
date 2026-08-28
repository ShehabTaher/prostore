'use server'
import { signInSchema, signUpSchema } from '@/lib/validators'
import { signIn, signOut } from '@/auth'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { hashSync } from 'bcrypt-ts-edge'
import { createUser } from '@/lib/db'
import { formatError } from '@/lib/format-error'
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
