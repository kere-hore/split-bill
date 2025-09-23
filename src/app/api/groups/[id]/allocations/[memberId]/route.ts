import {
  createErrorResponse,
  createSuccessResponse,
} from "@/shared/lib/api-response";
import { prisma } from "@/shared/lib/prisma";
import { MemberAllocation } from "@/shared/types/allocation";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

interface RouteParams {
  params: Promise<{
    id: string;
    memberId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id, memberId } = await params;
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return createErrorResponse(
        "Authentication required",
        401,
        "User not authenticated",
        "/api/groups/[id]/members/[memberId]"
      );
    }
    if (!id || !memberId) {
      return createErrorResponse(
        "Group ID and Member ID are required",
        400,
        "Missing required parameters",
        `/api/public/allocations/[groupId]/[memberId]`
      );
    }
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
        "/api/groups/[id]/members"
      );
    }
    // Check if current user is a member of the group
    const groupMember = await prisma.groupMember.findFirst({
      where: {
        groupId: id,
        id: memberId,
      },
    });

    if (currentUser.id !== groupMember?.userId) {
      return createErrorResponse(
        "Access denied",
        403,
        "User does not have access to read this allocation",
        `/api/public/allocations/${id}/${memberId}`
      );
    }

    // Get group with allocation data and payment receiver
    const group = await prisma.group.findUnique({
      where: { id: id },
      select: {
        id: true,
        name: true,
        allocationData: true,
        status: true,
        paymentReceiverId: true,
      },
    });
    // Get payment receiver info if exists
    let paymentReceiver = null;
    if (group?.paymentReceiverId) {
      const receiverMember = await prisma.groupMember.findUnique({
        where: { id: group.paymentReceiverId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

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
        `/api/public/allocations/${id}/${memberId}`
      );
    }
    if (!group.allocationData) {
      return createErrorResponse(
        "No allocations found",
        404,
        "Group has no saved allocations",
        `/api/public/allocations/${id}/${memberId}`
      );
    }

    let allocationData;
    try {
      allocationData = JSON.parse(group.allocationData);
    } catch (error) {
      console.error("Error parsing allocation data:", error);
      return createErrorResponse(
        "Invalid allocation data",
        500,
        "Failed to parse allocation data",
        `/api/public/allocations/${id}/${memberId}`
      );
    }

    const memberAllocation = allocationData.allocations?.find(
      (allocation: MemberAllocation) => allocation.memberId === memberId
    );

    if (!memberAllocation) {
      return createErrorResponse(
        "Member allocation not found",
        404,
        "No allocation found for this member",
        `/api/public/allocations/${id}/${memberId}`
      );
    }

    // Get settlement status for this member
    let settlement = null;
    const memberSettlement = await prisma.settlement.findFirst({
      where: {
        groupId: id,
        payerId: groupMember.userId,
      },
      select: {
        id: true,
        status: true,
        amount: true,
      },
    });

    if (memberSettlement) {
      settlement = {
        id: memberSettlement.id,
        status: memberSettlement.status,
        amount: Number(memberSettlement.amount),
      };
    }

    // Return member-specific data with group context
    const response = {
      group: {
        id: group.id,
        name: group.name,
        status: group.status,
      },
      member: memberAllocation,
      paymentReceiver,
      settlement,
      createdAt: allocationData.createdAt,
      updatedAt: allocationData.updatedAt,
    };

    return createSuccessResponse(
      response,
      "Member allocation retrieved successfully"
    );
  } catch (error) {
    console.error("Error retrieving member allocation:", error);
    return createErrorResponse(
      "Failed to retrieve member allocation",
      500,
      error instanceof Error ? error.message : "Unknown error occurred",
      `/api/public/allocations/${id}/${memberId}`
    );
  }
}
