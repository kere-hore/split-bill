import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/shared/lib/prisma";
import {
  createSuccessResponse,
  createErrorResponse,
} from "@/shared/lib/api-response";
import { z } from "zod";

const slackConfigSchema = z.object({
  webhookUrl: z.string().url("Invalid webhook URL"),
  defaultChannel: z.string().optional(),
  enabledEvents: z.array(z.string()).optional(),
  messageFormat: z.enum(["simple", "rich"]).optional(),
  rateLimitPerMinute: z.number().min(1).max(60).optional(),
});

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/groups/[id]/slack-config - Get Slack configuration for a group
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse(
        "Authentication required",
        401,
        "User not authenticated",
        `/api/groups/${(await params).id}/slack-config`
      );
    }

    const { id: groupId } = await params;

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
        `/api/groups/${groupId}/slack-config`
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
        `/api/groups/${groupId}/slack-config`
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
        `/api/groups/${groupId}/slack-config`
      );
    }

    // Don't expose the webhook URL in the response for security
    const safeConfig = {
      id: slackConfig.id,
      groupId: slackConfig.groupId,
      webhookUrl: "***configured***",
      defaultChannel: slackConfig.defaultChannel,
      enabledEvents: slackConfig.enabledEvents,
      messageFormat: slackConfig.messageFormat,
      rateLimitPerMinute: slackConfig.rateLimitPerMinute,
      isActive: slackConfig.isActive,
      createdAt: slackConfig.createdAt.toISOString(),
      updatedAt: slackConfig.updatedAt.toISOString(),
    };

    return createSuccessResponse(
      safeConfig,
      "Slack configuration retrieved successfully"
    );
  } catch (error) {
    console.error("Error fetching Slack configuration:", error);
    return createErrorResponse(
      "Failed to fetch Slack configuration",
      500,
      error instanceof Error ? error.message : "Unknown error occurred",
      `/api/groups/${(await params).id}/slack-config`
    );
  }
}

// PUT /api/groups/[id]/slack-config - Update Slack configuration for a group
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse(
        "Authentication required",
        401,
        "User not authenticated",
        `/api/groups/${(await params).id}/slack-config`
      );
    }

    const { id: groupId } = await params;
    const body = await request.json();

    // Validate request body
    const validatedData = slackConfigSchema.parse(body);

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
        `/api/groups/${groupId}/slack-config`
      );
    }

    // Verify user is an admin of the group (creator or admin role)
    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        createdBy: dbUser.id, // Only creator can configure Slack
      },
    });

    if (!group) {
      return createErrorResponse(
        "Access denied",
        403,
        "Only group creators can configure Slack integration",
        `/api/groups/${groupId}/slack-config`
      );
    }

    // Validate webhook URL format
    if (!isValidSlackWebhookUrl(validatedData.webhookUrl)) {
      return createErrorResponse(
        "Invalid Slack webhook URL",
        400,
        "Webhook URL must be a valid Slack webhook URL",
        `/api/groups/${groupId}/slack-config`
      );
    }

    // Prepare configuration data
    const configData = {
      webhookUrl: validatedData.webhookUrl,
      defaultChannel: validatedData.defaultChannel || null,
      enabledEvents: validatedData.enabledEvents || [
        "expense_added",
        "settlement_recorded",
      ],
      messageFormat: validatedData.messageFormat || "rich",
      rateLimitPerMinute: validatedData.rateLimitPerMinute || 10,
      isActive: true,
    };

    // Upsert Slack configuration
    const slackConfig = await prisma.slackConfig.upsert({
      where: { groupId },
      update: {
        ...configData,
        updatedAt: new Date(),
      },
      create: {
        groupId,
        ...configData,
      },
    });

    // Return safe configuration (without webhook URL)
    const safeConfig = {
      id: slackConfig.id,
      groupId: slackConfig.groupId,
      webhookUrl: "***configured***",
      defaultChannel: slackConfig.defaultChannel,
      enabledEvents: slackConfig.enabledEvents,
      messageFormat: slackConfig.messageFormat,
      rateLimitPerMinute: slackConfig.rateLimitPerMinute,
      isActive: slackConfig.isActive,
      createdAt: slackConfig.createdAt.toISOString(),
      updatedAt: slackConfig.updatedAt.toISOString(),
    };

    return createSuccessResponse(
      safeConfig,
      "Slack configuration updated successfully"
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse(
        "Invalid request data",
        400,
        error.message,
        `/api/groups/${(await params).id}/slack-config`
      );
    }

    console.error("Error updating Slack configuration:", error);
    return createErrorResponse(
      "Failed to update Slack configuration",
      500,
      error instanceof Error ? error.message : "Unknown error occurred",
      `/api/groups/${(await params).id}/slack-config`
    );
  }
}

// DELETE /api/groups/[id]/slack-config - Delete Slack configuration for a group
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse(
        "Authentication required",
        401,
        "User not authenticated",
        `/api/groups/${(await params).id}/slack-config`
      );
    }

    const { id: groupId } = await params;

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
        `/api/groups/${groupId}/slack-config`
      );
    }

    // Verify user is the group creator
    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        createdBy: dbUser.id,
      },
    });

    if (!group) {
      return createErrorResponse(
        "Access denied",
        403,
        "Only group creators can delete Slack configuration",
        `/api/groups/${groupId}/slack-config`
      );
    }

    // Delete Slack configuration
    await prisma.slackConfig.delete({
      where: { groupId },
    });

    return createSuccessResponse(
      null,
      "Slack configuration deleted successfully"
    );
  } catch (error) {
    console.error("Error deleting Slack configuration:", error);
    return createErrorResponse(
      "Failed to delete Slack configuration",
      500,
      error instanceof Error ? error.message : "Unknown error occurred",
      `/api/groups/${(await params).id}/slack-config`
    );
  }
}

function isValidSlackWebhookUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return (
      parsedUrl.hostname === "hooks.slack.com" &&
      parsedUrl.pathname.startsWith("/services/")
    );
  } catch {
    return false;
  }
}
