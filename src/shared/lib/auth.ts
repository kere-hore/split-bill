import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/shared/lib/prisma'

// Get current authenticated user
export async function getCurrentUser() {
  try {
    const user = await currentUser()
    if (!user) return null

    // Sync user with database
    const dbUser = await prisma.user.upsert({
      where: { clerkId: user.id },
      update: {
        username: user.username || `user_${user.id.slice(-8)}`,
        email: user.emailAddresses[0]?.emailAddress || '',
        phone: user.phoneNumbers[0]?.phoneNumber,
        name: user.fullName || user.firstName || 'User',
        image: user.imageUrl || '',
        provider: user.externalAccounts[0]?.provider || 'email',
      },
      create: {
        clerkId: user.id,
        username: user.username || `user_${user.id.slice(-8)}`,
        email: user.emailAddresses[0]?.emailAddress || '',
        phone: user.phoneNumbers[0]?.phoneNumber,
        name: user.fullName || user.firstName || 'User',
        image: user.imageUrl || '',
        provider: user.externalAccounts[0]?.provider || 'email',
      },
    })

    return dbUser
  } catch (error) {
    console.error('Error in getCurrentUser:', error)
    return null
  }
}

// Check if user is authenticated
export async function requireAuth() {
  const { userId } = await auth()
  if (!userId) {
    throw new Error('Unauthorized')
  }
  return userId
}

// Get user session
export async function getSession() {
  const { userId } = await auth()
  return userId ? { userId } : null
}