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

    // Sync user with database using upsert (update if exists, create if not)
    const dbUser = await prisma.user.upsert({
      where: { clerkId: user.id }, // Find user by Clerk ID
      update: {
        // Update existing user with latest info
        email,
        name,
        image: user.imageUrl,
      },
      create: {
        // Create new user with all required fields
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
  } catch (error) {
    console.error('Error in getCurrentUser:', error)
    // Return null instead of throwing to prevent 500 error
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