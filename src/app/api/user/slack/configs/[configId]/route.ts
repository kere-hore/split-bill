import { NextRequest } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { prisma } from '@/shared/lib/prisma'
import { createSuccessResponse, createErrorResponse } from '@/shared/lib/api-response'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ configId: string }> }
) {
  const { configId } = await params
  try {
    const { userId } = getAuth(request)
    if (!userId) {
      return createErrorResponse('Authentication required', 401, 'User not authenticated', '/api/user/slack/configs/[configId]')
    }

    // Get database user first
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      return createErrorResponse(
        "User not found",
        404,
        "User does not exist in database",
        "/api/user/slack/configs/[configId]"
      );
    }

    // Delete config (only if owned by user)
    await prisma.slackConfig.delete({
      where: {
        id: configId,
        userId: dbUser.id
      }
    })

    return createSuccessResponse({}, 'Slack configuration deleted successfully')
  } catch (error) {
    console.error('Error deleting user Slack config:', error)
    return createErrorResponse('Failed to delete Slack configuration', 500, error instanceof Error ? error.message : 'Unknown error', '/api/user/slack/configs/[configId]')
  }
}