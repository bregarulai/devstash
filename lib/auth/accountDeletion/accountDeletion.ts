import { prisma } from '@/lib/prisma/prisma'
import bcrypt from 'bcryptjs'
import { auth, signOut as nextAuthSignOut } from '@/lib/auth/auth/auth'
import { revalidatePath } from 'next/cache'

export async function deleteAccountByPassword(password: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'Not authenticated', data: null }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, password: true },
  })

  if (!user) {
    return { error: 'User not found', data: null }
  }

  if (!user.password) {
    return { error: 'Password verification required', data: null }
  }

  const valid = await bcrypt.compare(password, user.password)

  if (!valid) {
    return { error: 'Password verification failed', data: null }
  }

  try {
    await prisma.user.delete({
      where: { id: user.id },
    })
  } catch {
    return { error: 'Failed to delete account', data: null }
  }

  await nextAuthSignOut({ redirectTo: '/sign-in' })

  revalidatePath('/profile')

  return { success: true, data: null }
}
