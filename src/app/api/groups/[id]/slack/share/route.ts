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

    // Get database user first
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      return createErrorResponse(
        "User not found",
        404,
        "User does not exist in database",
        "/api/groups/[id]/slack/share"
      );
    }

    // Verify user has access to group
    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        OR: [
          { createdBy: dbUser.id },
          { members: { some: { userId: dbUser.id } } },
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

    // Get Slack config (verify user owns it)
    const config = await prisma.slackConfig.findFirst({
      where: { id: configId, userId: dbUser.id, isActive: true },
    });

    if (!config) {
      return createErrorResponse(
        "Slack configuration not found",
        404,
        "Configuration does not exist or is inactive",
        "/api/groups/[id]/slack/share"
      );
    }

    // Get mappings for this config
    const slackMappings = await prisma.slackUserMapping.findMany({
      where: { slackConfigId: configId },
    });

    // Create mapping lookup (by userId, memberName, and email)
    const mappingLookup = new Map();
    const nameMappingLookup = new Map();
    const emailMappingLookup = new Map();

    slackMappings.forEach((mapping) => {
      if (mapping.userId && mapping.slackUsername) {
        mappingLookup.set(mapping.userId, mapping.slackUsername);
      }
      if (mapping.memberName && mapping.slackUsername) {
        nameMappingLookup.set(
          mapping.memberName.toLowerCase(),
          mapping.slackUsername
        );
      }
      if (mapping.memberEmail && mapping.slackUsername) {
        emailMappingLookup.set(
          mapping.memberEmail.toLowerCase(),
          mapping.slackUsername
        );
      }
    });

    // Generate Slack message with all mapping lookups
    const slackMessage = generateSlackMessage(
      group,
      mappingLookup,
      nameMappingLookup,
      emailMappingLookup
    );

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
