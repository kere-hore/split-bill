'use client'

import { useAuth, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DebugAuth() {
  const { isLoaded, isSignedIn, userId } = useAuth()
  const { user } = useUser()
  const router = useRouter()

  useEffect(() => {
    console.log('Auth Debug:', {
      isLoaded,
      isSignedIn,
      userId,
      user: user?.id,
      pathname: window.location.pathname,
      href: window.location.href
    })
  }, [isLoaded, isSignedIn, userId, user])

  if (!isLoaded) {
    return <div>Loading auth state...</div>
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Auth Debug</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-semibold">Auth State</h2>
          <p>Loaded: {isLoaded ? 'Yes' : 'No'}</p>
          <p>Signed In: {isSignedIn ? 'Yes' : 'No'}</p>
          <p>User ID: {userId || 'None'}</p>
        </div>

        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-semibold">User Info</h2>
          <p>User ID: {user?.id || 'None'}</p>
          <p>Email: {user?.primaryEmailAddress?.emailAddress || 'None'}</p>
          <p>Username: {user?.username || 'None'}</p>
        </div>

        <div className="space-x-4">
          <button 
            onClick={() => router.push('/sign-in')}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Go to Sign In
          </button>
          <button 
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}