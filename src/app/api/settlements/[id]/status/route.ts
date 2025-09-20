import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import {
  createSuccessResponse,
  createErrorResponse,
} from "@/shared/lib/api-response";
import { prisma } from "@/shared/lib/prisma";

const updateStatusSchema = z.object({
  status: z.enum(["pending", "paid"]),
});

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return createErrorResponse(
        "Authentication required",
        401,
        "User not authenticated",
        "/api/settlements/[id]/status"
      );
    }

    const { id: settlementId } = await params;
    const body = await request.json();
    const { status } = updateStatusSchema.parse(body);

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
        "/api/settlements/[id]/status"
      );
    }

    // Get settlement and verify permissions
    const settlement = await prisma.settlement.findUnique({
      where: { id: settlementId },
      include: {
        payer: { select: { id: true } },
        receiver: { select: { id: true } },
      },
    });

    if (!settlement) {
      return createErrorResponse(
        "Settlement not found",
        404,
        "Settlement does not exist",
        "/api/settlements/[id]/status"
      );
    }

    // Check if current user is either payer or receiver
    if (
      settlement.payerId !== currentUser.id &&
      settlement.receiverId !== currentUser.id
    ) {
      return createErrorResponse(
        "Permission denied",
        403,
        "Only payer or receiver can update settlement status",
        "/api/settlements/[id]/status"
      );
    }

    // Update settlement status
    const updatedSettlement = await prisma.settlement.update({
      where: { id: settlementId },
      data: { status },
    });

    return createSuccessResponse(
      { id: updatedSettlement.id, status: updatedSettlement.status },
      "Settlement status updated successfully"
    );
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return createErrorResponse(
        "Invalid request data",
        400,
        error.message,
        "/api/settlements/[id]/status"
      );
    }

    console.error("Error updating settlement status:", error);
    return createErrorResponse(
      "Failed to update settlement status",
      500,
      error instanceof Error ? error.message : "Unknown error occurred",
      "/api/settlements/[id]/status"
    );
  }
}