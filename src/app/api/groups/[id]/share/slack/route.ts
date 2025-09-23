import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/shared/lib/prisma";
import { SlackWebhookService } from "@/entities/slack";
import {
  createSuccessResponse,
  createErrorResponse,
} from "@/shared/lib/api-response";
import { z } from "zod";

const shareToSlackSchema = z.object({
  webhookUrl: z.string().url("Invalid webhook URL"),
  channel: z.string().optional(),
  messageType: z.enum(["summary", "detailed"]).default("summary"),
  includeMembers: z.boolean().default(true),
  customMessage: z.string().optional(),
});

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// POST /api/groups/[id]/share/slack - Manual share group to Slack
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse(
        "Authentication required",
        401,
        "User not authenticated",
        `/api/groups/${(await params).id}/share/slack`
      );
    }

    const { id: groupId } = await params;
    const body = await request.json();

    // Validate request body
    const validatedData = shareToSlackSchema.parse(body);

    // Get database user ID from Clerk ID
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, name: true },
    });

    if (!dbUser) {
      return createErrorResponse(
        "User not found",
        404,
        "User does not exist in database",
        `/api/groups/${groupId}/share/slack`
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
        `/api/groups/${groupId}/share/slack`
      );
    }

    // Get group details with bill and members
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        bill: {
          select: {
            merchantName: true,
            totalAmount: true,
            date: true,
            currency: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!group) {
      return createErrorResponse(
        "Group not found",
        404,
        "Group does not exist",
        `/api/groups/${groupId}/share/slack`
      );
    }

    // Validate webhook URL format
    if (!isValidSlackWebhookUrl(validatedData.webhookUrl)) {
      return createErrorResponse(
        "Invalid Slack webhook URL",
        400,
        "Webhook URL must be a valid Slack webhook URL",
        `/api/groups/${groupId}/share/slack`
      );
    }

    // Create temporary Slack config for this share
    const tempSlackConfig = {
      id: "temp",
      groupId,
      webhookUrl: validatedData.webhookUrl,
      defaultChannel: validatedData.channel || null,
      enabledEvents: ["manual_share"],
      messageFormat: "rich" as const,
      rateLimitPerMinute: 10,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Format share message
    const publicUrl = `${
      process.env.NEXT_PUBLIC_APP_URL || "https://splitbill.app"
    }/public/groups/${groupId}`;

    let shareText =
      validatedData.customMessage ||
      `📊 ${group.name} - Bill Summary shared by ${dbUser.name}`;

    if (group.bill) {
      shareText += `\n💰 ${group.bill.merchantName} - ${
        group.bill.currency
      } ${Number(group.bill.totalAmount).toLocaleString()}`;
      shareText += `\n📅 ${group.bill.date.toISOString().split("T")[0]}`;
    }

    if (validatedData.includeMembers && group.members.length > 0) {
      const memberNames = group.members
        .map((m) => m.user?.name || m.name)
        .join(", ");
      shareText += `\n👥 Members: ${memberNames}`;
    }

    shareText += `\n🔗 View details: ${publicUrl}`;

    // Create share event
    const shareEvent = {
      type: "manual_share" as const,
      data: {
        groupName: group.name,
        groupId,
        sharedBy: dbUser.name,
        publicUrl,
        messageType: validatedData.messageType,
        memberCount: group.members.length,
        totalAmount: group.bill ? Number(group.bill.totalAmount) : 0,
        currency: group.bill?.currency || "IDR",
      },
      timestamp: new Date(),
      userId: dbUser.id,
      groupId,
    };

    // Send to Slack
    const webhookService = new SlackWebhookService();

    // Create custom payload for manual share
    const slackPayload = {
      text: shareText,
      username: "Split Bill Bot",
      icon_emoji: ":money_with_wings:",
      channel: validatedData.channel,
      attachments: [
        {
          color: "good",
          title: `${group.name} - Bill Summary`,
          title_link: publicUrl,
          fields: [
            ...(group.bill
              ? [
                  {
                    title: "Merchant",
                    value: group.bill.merchantName,
                    short: true,
                  },
                  {
                    title: "Total Amount",
                    value: `${group.bill.currency} ${Number(
                      group.bill.totalAmount
                    ).toLocaleString()}`,
                    short: true,
                  },
                ]
              : []),
            {
              title: "Members",
              value: group.members.length.toString(),
              short: true,
            },
            {
              title: "Shared by",
              value: dbUser.name,
              short: true,
            },
          ],
          footer: "Split Bill App",
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };

    const result = await webhookService.sendFormattedMessage(
      slackPayload,
      tempSlackConfig
    );

    if (result.ok) {
      return createSuccessResponse(
        {
          success: true,
          message: "Group shared to Slack successfully",
          publicUrl,
        },
        "Group shared to Slack channel"
      );
    } else {
      return createErrorResponse(
        "Failed to share to Slack",
        400,
        result.error || "Unknown error occurred while sharing to Slack",
        `/api/groups/${groupId}/share/slack`
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse(
        "Invalid request data",
        400,
        error.message,
        `/api/groups/${(await params).id}/share/slack`
      );
    }

    console.error("Error sharing group to Slack:", error);
    return createErrorResponse(
      "Failed to share group to Slack",
      500,
      error instanceof Error ? error.message : "Unknown error occurred",
      `/api/groups/${(await params).id}/share/slack`
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
