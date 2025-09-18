import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import {
  createSuccessResponse,
  createErrorResponse,
} from "@/shared/lib/api-response";
import { prisma } from "@/shared/lib/prisma";

const addMemberSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  role: z.enum(["admin", "member"]).default("member"),
});

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return createErrorResponse(
        "Authentication required",
        401,
        "User not authenticated",
        "/api/groups/[id]/members"
      );
    }

    const { id: groupId } = await params;
    const body = await request.json();
    const { userId, role } = addMemberSchema.parse(body);

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

    // Check if current user is the group creator
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: { createdBy: true },
    });

    if (!group || group.createdBy !== currentUser.id) {
      return createErrorResponse(
        "Permission denied",
        403,
        "Only group creator can add members",
        "/api/groups/[id]/members"
      );
    }

    // Check if user to be added exists
    const userToAdd = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    if (!userToAdd) {
      return createErrorResponse(
        "User not found",
        404,
        "User to be added not found",
        "/api/groups/[id]/members"
      );
    }

    // Check if user is already a member
    const existingMember = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId,
      },
    });

    if (existingMember) {
      return createErrorResponse(
        "User already member",
        400,
        "User is already a member of this group",
        "/api/groups/[id]/members"
      );
    }

    // Add member to group
    const newMember = await prisma.groupMember.create({
      data: {
        groupId,
        userId,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return createSuccessResponse(
      {
        id: newMember.id,
        role: newMember.role,
        user: newMember.user,
      },
      "Member added successfully"
    );
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return createErrorResponse(
        "Invalid request data",
        400,
        error.message,
        "/api/groups/[id]/members"
      );
    }

    console.error("Error adding member:", error);
    return createErrorResponse(
      "Failed to add member",
      500,
      error instanceof Error ? error.message : "Unknown error occurred",
      "/api/groups/[id]/members"
    );
  }
}