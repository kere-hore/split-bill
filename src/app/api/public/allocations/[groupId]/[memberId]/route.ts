import { NextRequest } from "next/server";
import {
  createSuccessResponse,
  createErrorResponse,
} from "@/shared/lib/api-response";
import { prisma } from "@/shared/lib/prisma";
import { MemberAllocation } from "@/shared/types/allocation";

interface RouteParams {
  params: Promise<{
    groupId: string;
    memberId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { groupId, memberId } = await params;
  try {
    // Get group with allocation data
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: {
        id: true,
        name: true,
        allocationData: true,
        status: true,
      },
    });

    if (!group) {
      return createErrorResponse(
        "Group not found",
        404,
        "Group does not exist",
        `/api/public/allocations/${groupId}/${memberId}`
      );
    }

    if (!group.allocationData) {
      return createErrorResponse(
        "No allocations found",
        404,
        "Group has no saved allocations",
        `/api/public/allocations/${groupId}/${memberId}`
      );
    }

    const allocationData = JSON.parse(group.allocationData);
    const memberAllocation = allocationData.allocations.find(
      (allocation: MemberAllocation) => allocation.memberId === memberId
    );

    if (!memberAllocation) {
      return createErrorResponse(
        "Member allocation not found",
        404,
        "No allocation found for this member",
        `/api/public/allocations/${groupId}/${memberId}`
      );
    }

    // Return member-specific data with group context
    const response = {
      group: {
        id: group.id,
        name: group.name,
        status: group.status,
      },
      member: memberAllocation,
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
      `/api/public/allocations/${groupId}/${memberId}`
    );
  }
}
