import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/shared/lib/prisma'

export async function getCurrentUser() {
  const user = await currentUser()
  if (!user) return null

  const email = user.emailAddresses[0]?.emailAddress || ''
  const name = user.fullName || user.firstName || 'User'
  const username = user.username || email.split('@')[0] || `user_${user.id.slice(-8)}`

  // Sync user with database
  const dbUser = await prisma.user.upsert({
    where: { clerkId: user.id },
    update: {
      email,
      name,
      image: user.imageUrl,
    },
    create: {
      clerkId: user.id,
      username,
      email,
      name,
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