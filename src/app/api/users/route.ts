import { NextRequest } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { prisma } from '@/shared/lib/prisma'
import { createSuccessResponse, createErrorResponse } from '@/shared/lib/api-response'

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request)
    if (!userId) {
      return createErrorResponse('Authentication required', 401, 'User not authenticated', '/api/users')
    }

    // Get all users (for user mapping purposes)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        clerkId: true,
        username: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { name: 'asc' }
    })

    return createSuccessResponse({ users }, 'Users retrieved successfully')
  } catch (error) {
    console.error('Error fetching users:', error)
    return createErrorResponse('Failed to fetch users', 500, error instanceof Error ? error.message : 'Unknown error', '/api/users')
  }
}