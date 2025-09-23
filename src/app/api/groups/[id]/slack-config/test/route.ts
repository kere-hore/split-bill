import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/shared/lib/prisma";
import { SlackWebhookService } from "@/entities/slack";
import {
  createSuccessResponse,
  createErrorResponse,
} from "@/shared/lib/api-response";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// POST /api/groups/[id]/slack-config/test - Test Slack webhook connectivity
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id: groupId } = await params;
  try {
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse(
        "Authentication required",
        401,
        "User not authenticated",
        `/api/groups/${(await params).id}/slack-config/test`
      );
    }

    // Get database user ID from Clerk ID
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!dbUser) {
      return createErrorResponse(
        "User not found",
        404,
        "User does not exist in database",
        `/api/groups/${groupId}/slack-config/test`
      );
    }

    // Verify user is a member of the group
    const groupMember = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: dbUser.id,
      },
    });

    if (!groupMember) {
      return createErrorResponse(
        "Access denied",
        403,
        "You are not a member of this group",
        `/api/groups/${groupId}/slack-config/test`
      );
    }

    // Get Slack configuration
    const slackConfig = await prisma.slackConfig.findUnique({
      where: { groupId },
    });

    if (!slackConfig) {
      return createErrorResponse(
        "Slack configuration not found",
        404,
        "No Slack configuration exists for this group",
        `/api/groups/${groupId}/slack-config/test`
      );
    }

    if (!slackConfig.isActive) {
      return createErrorResponse(
        "Slack integration disabled",
        400,
        "Slack integration is disabled for this group",
        `/api/groups/${groupId}/slack-config/test`
      );
    }

    // Test the webhook
    const webhookService = new SlackWebhookService();
    const result = await webhookService.testWebhook(slackConfig);

    if (result.ok) {
      return createSuccessResponse(
        {
          success: true,
          message: "Test message sent successfully to Slack channel",
        },
        "Slack webhook test successful"
      );
    } else {
      return createErrorResponse(
        "Slack webhook test failed",
        400,
        result.error || "Unknown error occurred during webhook test",
        `/api/groups/${groupId}/slack-config/test`
      );
    }
  } catch (error) {
    console.error("Error testing Slack webhook:", error);
    return createErrorResponse(
      "Failed to test Slack webhook",
      500,
      error instanceof Error ? error.message : "Unknown error occurred",
      `/api/groups/${groupId}/slack-config/test`
    );
  }
}
