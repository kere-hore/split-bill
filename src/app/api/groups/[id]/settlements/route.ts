import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  createSuccessResponse,
  createErrorResponse,
} from "@/shared/lib/api-response";
import { prisma } from "@/shared/lib/prisma";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return createErrorResponse(
        "Authentication required",
        401,
        "User not authenticated",
        "/api/groups/[id]/settlements"
      );
    }

    const { id: groupId } = await params;

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
        "/api/groups/[id]/settlements"
      );
    }

    // Verify group exists
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: { id: true },
    });

    if (!group) {
      return createErrorResponse(
        "Group not found",
        404,
        "Group does not exist",
        "/api/groups/[id]/settlements"
      );
    }

    // Get settlements for this group
    const settlements = await prisma.settlement.findMany({
      where: { groupId },
      include: {
        payer: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate payment statistics
    const totalMembers = settlements.length;
    const paidMembers = settlements.filter(s => s.status === 'paid').length;
    const pendingMembers = totalMembers - paidMembers;

    return createSuccessResponse(
      { 
        settlements,
        paymentStats: {
          totalMembers,
          paidMembers,
          pendingMembers
        }
      },
      "Settlements retrieved successfully"
    );
  } catch (error) {
    console.error("Error retrieving settlements:", error);
    return createErrorResponse(
      "Failed to retrieve settlements",
      500,
      error instanceof Error ? error.message : "Unknown error occurred",
      "/api/groups/[id]/settlements"
    );
  }
}