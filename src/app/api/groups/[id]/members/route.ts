import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import {
  createSuccessResponse,
  createErrorResponse,
} from "@/shared/lib/api-response";
import { prisma } from "@/shared/lib/prisma";

const addMemberSchema = z.object({
  userId: z.string().nullable(), // null for non-registered users
  name: z.string().min(1, "Name is required"),
  // role is always "member" - only creator is admin
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
    const { userId, name } = addMemberSchema.parse(body);
    const role = "member"; // Always member - only creator is admin

    // Use provided userId or generate one for custom users
    const finalUserId =
      userId ||
      `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

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

    let userToAdd;

    if (userId) {
      // Registered user - check if exists
      userToAdd = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, image: true },
      });

      if (!userToAdd) {
        return createErrorResponse(
          "User not found",
          404,
          "Registered user not found",
          "/api/groups/[id]/members"
        );
      }
    } else {
      // Custom user - create a temporary user record
      userToAdd = await prisma.user.create({
        data: {
          id: finalUserId,
          clerkId: finalUserId, // Use same ID for custom users
          username: name.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now(),
          name,
          email: `${finalUserId}@custom.local`, // Temporary email
        },
      });
    }

    // Check if user is already a member
    const existingMember = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: finalUserId,
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
        userId: finalUserId,
        name: userToAdd.name,
        role,
      },
    });

    return createSuccessResponse(
      {
        id: newMember.id,
        role: newMember.role,
        user: {
          id: userToAdd.id,
          name: userToAdd.name,
          email: userToAdd.email || null,
          image: userToAdd.id ? userToAdd.image : null,
        },
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
