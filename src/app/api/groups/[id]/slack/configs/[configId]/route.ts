import { NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/shared/lib/prisma";
import {
  createSuccessResponse,
  createErrorResponse,
} from "@/shared/lib/api-response";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; configId: string }> }
) {
  const { configId, id: groupId } = await params;
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return createErrorResponse(
        "Authentication required",
        401,
        "User not authenticated",
        "/api/groups/[id]/slack/configs/[configId]"
      );
    }

    // Verify user is group admin
    const group = await prisma.group.findFirst({
      where: {
        id: groupId,
        OR: [
          { createdBy: userId },
          { members: { some: { user: { clerkId: userId }, role: "admin" } } },
        ],
      },
    });

    if (!group) {
      return createErrorResponse(
        "Insufficient permissions",
        403,
        "User is not group admin",
        "/api/groups/[id]/slack/configs/[configId]"
      );
    }

    // Verify config belongs to user
    const config = await prisma.slackConfig.findUnique({
      where: { id: configId },
    });

    if (!config || config.userId !== userId) {
      return createErrorResponse(
        "Configuration not found",
        404,
        "Slack configuration not found or access denied",
        "/api/groups/[id]/slack/configs/[configId]"
      );
    }

    // Delete config
    await prisma.slackConfig.delete({
      where: { id: configId },
    });

    return createSuccessResponse(
      {},
      "Slack configuration deleted successfully"
    );
  } catch (error) {
    console.error("Error deleting Slack config:", error);
    return createErrorResponse(
      "Failed to delete Slack configuration",
      500,
      error instanceof Error ? error.message : "Unknown error",
      "/api/groups/[id]/slack/configs/[configId]"
    );
  }
}
