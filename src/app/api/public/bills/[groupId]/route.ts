import { NextRequest } from "next/server";
import {
  createSuccessResponse,
  createErrorResponse,
} from "@/shared/lib/api-response";
import { prisma } from "@/shared/lib/prisma";

interface RouteParams {
  params: Promise<{
    groupId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { groupId } = await params;

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
      members: group.members.map(member => ({
        id: member.id,
        userId: member.userId,
        name: member.name,
        role: member.role,
        user: member.user,
      })),
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