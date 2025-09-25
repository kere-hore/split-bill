import { NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/shared/lib/prisma";
import {
  createSuccessResponse,
  createErrorResponse,
} from "@/shared/lib/api-response";
import { generateSlackMessage, sendToSlackWebhook } from "@/shared/lib/slack";
import { z } from "zod";

const shareSchema = z.object({
  configId: z.string(),
  mappings: z.record(z.string(), z.string()).optional(),
});

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
        "/api/groups/[id]/slack/share"
      );
    }

    const groupId = id;
    const body = await request.json();

    // Validate input
    const { configId, mappings } = shareSchema.parse(body);

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
        bill: true,
      },
    });

    if (!group) {
      return createErrorResponse(
        "Group not found",
        404,
        "Group does not exist or user has no access",
        "/api/groups/[id]/slack/share"
      );
    }

    // Get Slack config
    const config = await prisma.slackConfig.findFirst({
      where: { id: configId, groupId, isActive: true },
    });

    if (!config) {
      return createErrorResponse(
        "Slack configuration not found",
        404,
        "Configuration does not exist or is inactive",
        "/api/groups/[id]/slack/share"
      );
    }

    // Get or update mappings
    let slackMappings = await prisma.slackUserMapping.findMany({
      where: { groupId },
    });

    // Update mappings if provided
    if (mappings) {
      const updatePromises = Object.entries(mappings).map(
        ([mappingId, slackUsername]) =>
          prisma.slackUserMapping.update({
            where: { id: mappingId },
            data: {
              slackUsername,
              mappingStatus: slackUsername ? "active" : "skipped",
              updatedAt: new Date(),
            },
          })
      );
      await Promise.all(updatePromises);

      // Refresh mappings
      slackMappings = await prisma.slackUserMapping.findMany({
        where: { groupId },
      });
    }

    // Transform mappings to match interface
    const transformedMappings = slackMappings.map(mapping => ({
      ...mapping,
      userId: mapping.userId || undefined,
      memberEmail: mapping.memberEmail || undefined,
      slackUsername: mapping.slackUsername || undefined,
      mappingStatus: mapping.mappingStatus as 'pending' | 'active' | 'skipped'
    }));

    // Generate Slack message
    const slackMessage = generateSlackMessage(group, transformedMappings);

    // Send to Slack
    let sentToSlack = false;
    try {
      sentToSlack = await sendToSlackWebhook(config.webhookUrl, slackMessage);
    } catch (error) {
      console.error("Failed to send to Slack:", error);
    }

    return createSuccessResponse(
      {
        slackMessage: slackMessage.text,
        sentToSlack,
      },
      sentToSlack
        ? "Message sent to Slack successfully"
        : "Message generated (Slack delivery failed)"
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse(
        "Validation failed",
        400,
        error.message,
        "/api/groups/[id]/slack/share"
      );
    }
    console.error("Error sharing to Slack:", error);
    return createErrorResponse(
      "Failed to share to Slack",
      500,
      error instanceof Error ? error.message : "Unknown error",
      "/api/groups/[id]/slack/share"
    );
  }
}
