import { NextRequest } from "next/server";
import {
  createSuccessResponse,
  createErrorResponse,
} from "@/shared/lib/api-response";
import { prisma } from "@/shared/lib/prisma";
import "@/shared/lib/env-validation";

interface RouteParams {
  params: Promise<{
    groupId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { groupId } = await params;
  try {
    if (!groupId) {
      return createErrorResponse(
        "Group ID is required",
        400,
        "Missing group ID parameter",
        `/api/public/bills/[groupId]`
      );
    }

    console.log(`[PUBLIC_BILLS] Fetching bill for group: ${groupId}`);
    // Get group with bill and allocation data
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        bill: {
          include: {
            items: true,
            discounts: true,
            additionalFees: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        creator: {
          select: {
            name: true,
          },
        },
      },
    });

    // Get payment receiver info if exists
    let paymentReceiver = null;
    if (group?.paymentReceiverId) {
      const receiverMember = group.members.find(m => m.id === group.paymentReceiverId);
      if (receiverMember) {
        paymentReceiver = {
          id: receiverMember.id,
          name: receiverMember.name,
          user: receiverMember.user,
        };
      }
    }

    if (!group) {
      return createErrorResponse(
        "Group not found",
        404,
        "Group does not exist",
        `/api/public/bills/${groupId}`
      );
    }

    // Parse allocation data if exists
    let allocationData = null;
    if (group.allocationData) {
      try {
        allocationData = JSON.parse(group.allocationData);
      } catch (error) {
        console.error("Error parsing allocation data:", error);
        // Return error instead of continuing with null data
        return createErrorResponse(
          "Invalid allocation data",
          500,
          "Failed to parse allocation data",
          `/api/public/bills/${groupId}`
        );
      }
    }

    const response = {
      group: {
        id: group.id,
        name: group.name,
        description: group.description,
        status: group.status,
        createdAt: group.createdAt,
        createdBy: group.creator.name,
      },
      bill: group.bill,
      members: group.members.map((member) => ({
        id: member.id,
        userId: member.userId,
        name: member.name,
        role: member.role,
        user: member.user,
      })),
      paymentReceiver,
      allocation: allocationData,
    };

    return createSuccessResponse(
      response,
      "Public bill retrieved successfully"
    );
  } catch (error) {
    console.error("Error retrieving public bill:", error);
    return createErrorResponse(
      "Failed to retrieve bill",
      500,
      error instanceof Error ? error.message : "Unknown error occurred",
      `/api/public/bills/${groupId}`
    );
  }
}
