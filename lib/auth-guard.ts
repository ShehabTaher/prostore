import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function requireAdmin() {
  const session = await auth()
  if (!session || session.user.role !== 'admin') {
    redirect('/unauthorized')
  }
  return true
}
