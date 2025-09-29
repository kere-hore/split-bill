import { NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/shared/lib/prisma";
import {
  createSuccessResponse,
  createErrorResponse,
} from "@/shared/lib/api-response";
import { z } from "zod";

const updateMappingsSchema = z.object({
  mappings: z.record(
    z.string(),
    z.object({
      slackUsername: z.string().optional(),
      mappingStatus: z.enum(["pending", "active", "skipped"]).optional(),
    })
  ),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return createErrorResponse(
        "Authentication required",
        401,
        "User not authenticated",
        "/api/groups/[id]/slack/mappings"
      );
    }

    const groupId = id;

    // Verify user has access to group
    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        OR: [
          { createdBy: userId },
          { members: { some: { user: { clerkId: userId } } } },
        ],
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!group) {
      return createErrorResponse(
        "Group not found",
        404,
        "Group does not exist or user has no access",
        "/api/groups/[id]/slack/mappings"
      );
    }

    // Get existing mappings
    const existingMappings = await prisma.slackUserMapping.findMany({
      where: { userId },
    });

    // Get user's Slack configs to create mappings
    const slackConfigs = await prisma.slackConfig.findMany({
      where: { userId, isActive: true },
    });

    if (slackConfigs.length === 0) {
      return createSuccessResponse(
        { mappings: [] },
        "No active Slack configurations found"
      );
    }

    // Create mappings for members who don't have them for each config
    for (const config of slackConfigs) {
      const membersToMap = group.members.filter(
        (member) =>
          !existingMappings.find(
            (mapping) => 
              mapping.userId === member.userId && 
              mapping.slackConfigId === config.id
          )
      );

      if (membersToMap.length > 0) {
        await prisma.slackUserMapping.createMany({
          data: membersToMap.map((member) => ({
            slackConfigId: config.id,
            userId: member.userId,
            memberName: member.name,
            memberEmail: member.user?.email,
            mappingStatus: "pending",
          })),
          skipDuplicates: true,
        });
      }
    }

    // Get all mappings for user's configs
    const mappings = await prisma.slackUserMapping.findMany({
      where: {
        slackConfigId: { in: slackConfigs.map(c => c.id) },
      },
      include: {
        SlackConfig: true,
        User: true,
      },
      orderBy: { memberName: "asc" },
    });

    return createSuccessResponse(
      { mappings },
      "Slack mappings retrieved successfully"
    );
  } catch (error) {
    console.error("Error fetching Slack mappings:", error);
    return createErrorResponse(
      "Failed to fetch Slack mappings",
      500,
      error instanceof Error ? error.message : "Unknown error",
      "/api/groups/[id]/slack/mappings"
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return createErrorResponse(
        "Authentication required",
        401,
        "User not authenticated",
        "/api/groups/[id]/slack/mappings"
      );
    }

    const groupId = id;
    const body = await request.json();

    // Validate input
    const validatedData = updateMappingsSchema.parse(body);

    // Verify user has access to group
    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        OR: [
          { createdBy: userId },
          { members: { some: { user: { clerkId: userId } } } },
        ],
      },
    });

    if (!group) {
      return createErrorResponse(
        "Insufficient permissions",
        403,
        "User does not have access to this group",
        "/api/groups/[id]/slack/mappings"
      );
    }

    // Update mappings
    const updatePromises = Object.entries(validatedData.mappings).map(
      ([mappingId, data]) =>
        prisma.slackUserMapping.update({
          where: { id: mappingId },
          data: {
            ...data,
            updatedAt: new Date(),
          },
        })
    );

    await Promise.all(updatePromises);

    // Get user's Slack configs
    const slackConfigs = await prisma.slackConfig.findMany({
      where: { userId, isActive: true },
    });

    // Get updated mappings
    const mappings = await prisma.slackUserMapping.findMany({
      where: {
        slackConfigId: { in: slackConfigs.map(c => c.id) },
      },
      include: {
        SlackConfig: true,
        User: true,
      },
      orderBy: { memberName: "asc" },
    });

    return createSuccessResponse(
      { mappings },
      "Slack mappings updated successfully"
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse(
        "Validation failed",
        400,
        error.message,
        "/api/groups/[id]/slack/mappings"
      );
    }
    console.error("Error updating Slack mappings:", error);
    return createErrorResponse(
      "Failed to update Slack mappings",
      500,
      error instanceof Error ? error.message : "Unknown error",
      "/api/groups/[id]/slack/mappings"
    );
  }
}
