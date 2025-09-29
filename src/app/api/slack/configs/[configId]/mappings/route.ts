import { NextRequest } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { prisma } from '@/shared/lib/prisma'
import { createSuccessResponse, createErrorResponse } from '@/shared/lib/api-response'
import { z } from 'zod'

const updateMappingsSchema = z.object({
  mappings: z.array(z.object({
    userId: z.string(),
    slackUsername: z.string().optional()
  }))
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ configId: string }> }
) {
  const { configId } = await params
  try {
    const { userId } = getAuth(request)
    if (!userId) {
      return createErrorResponse('Authentication required', 401, 'User not authenticated', '/api/slack/configs/[configId]/mappings')
    }

    // Get database user
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!dbUser) {
      return createErrorResponse('User not found', 404, 'User does not exist in database', '/api/slack/configs/[configId]/mappings')
    }

    // Verify user owns the config
    const config = await prisma.slackConfig.findFirst({
      where: { id: configId, userId: dbUser.id }
    })

    if (!config) {
      return createErrorResponse('Config not found', 404, 'Slack configuration not found or access denied', '/api/slack/configs/[configId]/mappings')
    }

    // Get mappings for this config
    const mappings = await prisma.slackUserMapping.findMany({
      where: { slackConfigId: configId },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            username: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return createSuccessResponse({ mappings }, 'Config mappings retrieved successfully')
  } catch (error) {
    console.error('Error fetching config mappings:', error)
    return createErrorResponse('Failed to fetch config mappings', 500, error instanceof Error ? error.message : 'Unknown error', '/api/slack/configs/[configId]/mappings')
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ configId: string }> }
) {
  const { configId } = await params
  try {
    const { userId } = getAuth(request)
    if (!userId) {
      return createErrorResponse('Authentication required', 401, 'User not authenticated', '/api/slack/configs/[configId]/mappings')
    }

    const body = await request.json()
    const { mappings } = updateMappingsSchema.parse(body)

    // Get database user
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!dbUser) {
      return createErrorResponse('User not found', 404, 'User does not exist in database', '/api/slack/configs/[configId]/mappings')
    }

    // Verify user owns the config
    const config = await prisma.slackConfig.findFirst({
      where: { id: configId, userId: dbUser.id }
    })

    if (!config) {
      return createErrorResponse('Config not found', 404, 'Slack configuration not found or access denied', '/api/slack/configs/[configId]/mappings')
    }

    // Delete existing mappings for this config
    await prisma.slackUserMapping.deleteMany({
      where: { slackConfigId: configId }
    })

    // Create new mappings
    if (mappings.length > 0) {
      // Get user data for memberName
      const users = await prisma.user.findMany({
        where: { id: { in: mappings.map(m => m.userId) } },
        select: { id: true, name: true, email: true }
      })

      const userMap = new Map(users.map(u => [u.id, u]))

      await prisma.slackUserMapping.createMany({
        data: mappings.map(mapping => {
          const user = userMap.get(mapping.userId)
          return {
            slackConfigId: configId,
            userId: mapping.userId,
            memberName: user?.name || 'Unknown User',
            memberEmail: user?.email,
            slackUsername: mapping.slackUsername,
            mappingStatus: mapping.slackUsername ? 'active' : 'pending'
          }
        })
      })
    }

    return createSuccessResponse({}, 'Config mappings updated successfully')
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse('Validation failed', 400, error.message, '/api/slack/configs/[configId]/mappings')
    }
    console.error('Error updating config mappings:', error)
    return createErrorResponse('Failed to update config mappings', 500, error instanceof Error ? error.message : 'Unknown error', '/api/slack/configs/[configId]/mappings')
  }
}