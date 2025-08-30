import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/shared/lib/prisma'

export async function getCurrentUser() {
  const user = await currentUser()
  if (!user) return null

  // Sync user with database
  const dbUser = await prisma.user.upsert({
    where: { clerkId: user.id },
    update: {
      email: user.emailAddresses[0]?.emailAddress || '',
      name: user.fullName || user.firstName || 'User',
      image: user.imageUrl,
    },
    create: {
      clerkId: user.id,
      email: user.emailAddresses[0]?.emailAddress || '',
      name: user.fullName || user.firstName || 'User',
      image: user.imageUrl,
    },
  })

  return dbUser
}

export async function requireAuth() {
  const { userId } = await auth()
  if (!userId) {
    throw new Error('Unauthorized')
  }
  return userId
}

export async function getSession() {
  const { userId } = await auth()
  return userId ? { userId } : null
}