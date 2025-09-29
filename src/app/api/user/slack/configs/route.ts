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

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return createErrorResponse(
        "Authentication required",
        401,
        "User not authenticated",
        "/api/user/slack/configs"
      );
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
        "/api/user/slack/configs"
      );
    }

    // Get user's Slack configs
    const configs = await prisma.slackConfig.findMany({
      where: {
        userId: dbUser.id,
        isActive: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return createSuccessResponse(
      { configs },
      "Slack configurations retrieved successfully"
    );
  } catch (error) {
    console.error("Error fetching user Slack configs:", error);
    return createErrorResponse(
      "Failed to fetch Slack configurations",
      500,
      error instanceof Error ? error.message : "Unknown error",
      "/api/user/slack/configs"
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return createErrorResponse(
        "Authentication required",
        401,
        "User not authenticated",
        "/api/user/slack/configs"
      );
    }

    const body = await request.json();

    // Validate input
    const validatedData = createConfigSchema.parse(body);

    // Get database user
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      return createErrorResponse(
        "User not found",
        404,
        "User does not exist in database",
        "/api/user/slack/configs"
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
        "/api/user/slack/configs"
      );
    }

    // Create config
    const config = await prisma.slackConfig.create({
      data: {
        userId: dbUser.id,
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
        "/api/user/slack/configs"
      );
    }
    console.error("Error creating user Slack config:", error);
    return createErrorResponse(
      "Failed to create Slack configuration",
      500,
      error instanceof Error ? error.message : "Unknown error",
      "/api/user/slack/configs"
    );
  }
}
