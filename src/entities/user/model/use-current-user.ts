'use client'

import { useUser } from '@clerk/nextjs'

export function useCurrentUser() {
  const { user, isLoaded } = useUser()
  
  return {
    user: user ? {
      id: user.id,
      name: user.fullName || user.firstName || 'User',
      email: user.emailAddresses[0]?.emailAddress || 'user@example.com',
      avatar: user.imageUrl || '/avatars/default.jpg',
    } : null,
    isLoading: !isLoaded,
    isAuthenticated: !!user,
  }
}