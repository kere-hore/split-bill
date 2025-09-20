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
    memberId: string;
  }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    const { id: groupId, memberId } = await params;

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
        "/api/groups/[id]/members/[memberId]"
      );
    }

    // Check if current user is the group creator
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: { createdBy: true },
    });

    if (!group || group.createdBy !== currentUser.id) {
      return createErrorResponse(
        "Permission denied",
        403,
        "Only group creator can remove members",
        "/api/groups/[id]/members/[memberId]"
      );
    }

    // Get member to be removed
    const memberToRemove = await prisma.groupMember.findUnique({
      where: { id: memberId },
      include: {
        user: {
          select: { id: true, clerkId: true },
        },
      },
    });

    if (!memberToRemove || memberToRemove.groupId !== groupId) {
      return createErrorResponse(
        "Member not found",
        404,
        "Member not found in this group",
        "/api/groups/[id]/members/[memberId]"
      );
    }

    // Check if this is a custom user (clerkId starts with "custom_")
    const isCustomUser = memberToRemove.user?.clerkId.startsWith("custom_");

    // Remove member from group
    await prisma.groupMember.delete({
      where: { id: memberId },
    });

    // If custom user, also delete from User table
    if (isCustomUser && memberToRemove.user) {
      await prisma.user.delete({
        where: { id: memberToRemove.user.id },
      });
    }

    return createSuccessResponse(
      { memberId },
      "Member removed successfully"
    );
  } catch (error) {
    console.error("Error removing member:", error);
    return createErrorResponse(
      "Failed to remove member",
      500,
      error instanceof Error ? error.message : "Unknown error occurred",
      "/api/groups/[id]/members/[memberId]"
    );
  }
}