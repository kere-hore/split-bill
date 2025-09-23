import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import {
  createSuccessResponse,
  createErrorResponse,
} from "@/shared/lib/api-response";
import { prisma } from "@/shared/lib/prisma";

const updateReceiverSchema = z.object({
  paymentReceiverId: z.string().min(1, "Payment receiver ID is required"),
});

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return createErrorResponse(
        "Authentication required",
        401,
        "User not authenticated",
        "/api/groups/[id]/payment-receiver"
      );
    }

    const { id: groupId } = await params;
    const body = await request.json();
    const { paymentReceiverId } = updateReceiverSchema.parse(body);

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!currentUser) {
      return createErrorResponse(
        "User not found",
        404,
        "Current user not found in database",
        "/api/groups/[id]/payment-receiver"
      );
    }

    // Check if current user is the group creator
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: { createdBy: true, status: true },
    });

    if (!group || group.createdBy !== currentUser.id) {
      return createErrorResponse(
        "Permission denied",
        403,
        "Only group creator can set payment receiver",
        "/api/groups/[id]/payment-receiver"
      );
    }

    if (group.status === "allocated") {
      return createErrorResponse(
        "Group already allocated",
        400,
        "Cannot change payment receiver for allocated groups",
        "/api/groups/[id]/payment-receiver"
      );
    }

    // Verify the payment receiver is a member of the group
    const member = await prisma.groupMember.findFirst({
      where: {
        id: paymentReceiverId,
        groupId,
      },
    });

    if (!member) {
      return createErrorResponse(
        "Invalid payment receiver",
        400,
        "Payment receiver must be a member of the group",
        "/api/groups/[id]/payment-receiver"
      );
    }

    // Update payment receiver
    await prisma.group.update({
      where: { id: groupId },
      data: { paymentReceiverId },
    });

    return createSuccessResponse(
      { paymentReceiverId },
      "Payment receiver updated successfully"
    );
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return createErrorResponse(
        "Invalid request data",
        400,
        error.message,
        "/api/groups/[id]/payment-receiver"
      );
    }

    console.error("Error updating payment receiver:", error);
    return createErrorResponse(
      "Failed to update payment receiver",
      500,
      error instanceof Error ? error.message : "Unknown error occurred",
      "/api/groups/[id]/payment-receiver"
    );
  }
}
