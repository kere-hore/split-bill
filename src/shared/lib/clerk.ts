import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/shared/lib/prisma'

export async function getCurrentUser() {
  try {
    // Get current authenticated user from Clerk
    const user = await currentUser()
    if (!user) return null

    // Extract user information with fallbacks
    const email = user.emailAddresses[0]?.emailAddress || ''
    const name = user.fullName || user.firstName || 'User'
    // Generate username from email prefix or create fallback with user ID
    const username = user.username || email.split('@')[0] || `user_${user.id.slice(-8)}`

    console.log('Syncing user to database:', { clerkId: user.id, email, username })

    // Try to sync user with database
    try {
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
          phone: '',
          image: user.imageUrl,
        },
      })
      console.log('User synced successfully:', dbUser.id)
      return dbUser
    } catch (dbError) {
      console.error('Database sync failed, continuing without sync:', dbError)
      // Return a mock user object if database fails
      return {
        id: user.id,
        clerkId: user.id,
        username,
        email,
        name,
        phone: '',
        image: user.imageUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    }
  } catch (error) {
    console.error('Error in getCurrentUser:', error)
    return null
  }
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