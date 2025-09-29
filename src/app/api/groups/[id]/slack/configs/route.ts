import { NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/shared/lib/prisma";
import {
  createSuccessResponse,
  createErrorResponse,
} from "@/shared/lib/api-response";
import { z } from "zod";

const createConfigSchema = z.object({
  name: z.string().min(1, "Name is required"),
  webhookUrl: z.string().url("Invalid webhook URL"),
  channelName: z.string().min(1, "Channel name is required"),
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
        "/api/groups/[id]/slack/configs"
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
    });

    if (!group) {
      return createErrorResponse(
        "Group not found",
        404,
        "Group does not exist or user has no access",
        "/api/groups/[id]/slack/configs"
      );
    }

    const configs = await prisma.slackConfig.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: "desc" },
    });

    return createSuccessResponse(
      { configs },
      "Slack configurations retrieved successfully"
    );
  } catch (error) {
    console.error("Error fetching Slack configs:", error);
    return createErrorResponse(
      "Failed to fetch Slack configurations",
      500,
      error instanceof Error ? error.message : "Unknown error",
      "/api/groups/[id]/slack/configs"
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
        "/api/groups/[id]/slack/configs"
      );
    }

    const groupId = id;
    const body = await request.json();

    // Validate input
    const validatedData = createConfigSchema.parse(body);

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
        "/api/groups/[id]/slack/configs"
      );
    }

    // Test webhook URL
    const testMessage = {
      text: "Split Bill webhook test - configuration successful!",
    };
    const testResponse = await fetch(validatedData.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testMessage),
      signal: AbortSignal.timeout(10000),
    });

    if (!testResponse.ok) {
      return createErrorResponse(
        "Webhook URL test failed",
        400,
        "Unable to connect to Slack webhook",
        "/api/groups/[id]/slack/configs"
      );
    }

    // Create config
    const config = await prisma.slackConfig.create({
      data: {
        userId,
        name: validatedData.name,
        webhookUrl: validatedData.webhookUrl,
        channelName: validatedData.channelName,
        enabledEvents: ["allocation_completed"],
      },
    });

    return createSuccessResponse(
      { config },
      "Slack configuration created successfully",
      201
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse(
        "Validation failed",
        400,
        error.message,
        "/api/groups/[id]/slack/configs"
      );
    }
    console.error("Error creating Slack config:", error);
    return createErrorResponse(
      "Failed to create Slack configuration",
      500,
      error instanceof Error ? error.message : "Unknown error",
      "/api/groups/[id]/slack/configs"
    );
  }
}
