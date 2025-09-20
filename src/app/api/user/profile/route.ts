import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import {
  createSuccessResponse,
  createErrorResponse,
} from "@/shared/lib/api-response";
import { prisma } from "@/shared/lib/prisma";

const updateProfileSchema = z.object({
  name: z.string().min(1, "Full name is required").optional(),
  username: z.string().min(3, "Username must be at least 3 characters").optional(),
  phone: z.string().min(10, "Phone number must be at least 10 digits").optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return createErrorResponse(
        "Authentication required",
        401,
        "User not authenticated",
        "/api/user/profile"
      );
    }

    // Try to find user, create if not exists
    let user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        phone: true,
        image: true,
        updatedAt: true,
      },
    });

    if (!user) {
      // Create user if not exists
      user = await prisma.user.create({
        data: {
          clerkId,
          username: `user_${clerkId.slice(-8)}`,
          name: "User",
          email: `${clerkId}@temp.com`,
        },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          phone: true,
          image: true,
          updatedAt: true,
        },
      });
    }

    return createSuccessResponse(
      {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        image: user.image,
        updatedAt: user.updatedAt.toISOString(),
      },
      "Profile retrieved successfully"
    );
  } catch (error) {
    console.error("Error retrieving profile:", error);
    return createErrorResponse(
      "Failed to retrieve profile",
      500,
      error instanceof Error ? error.message : "Unknown error occurred",
      "/api/user/profile"
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return createErrorResponse(
        "Authentication required",
        401,
        "User not authenticated",
        "/api/user/profile"
      );
    }

    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);



    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { clerkId },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.username && { username: validatedData.username }),
        ...(validatedData.phone && { phone: validatedData.phone }),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        phone: true,
        image: true,
        updatedAt: true,
      },
    });

    return createSuccessResponse(
      {
        id: updatedUser.id,
        name: updatedUser.name,
        username: updatedUser.username,
        email: updatedUser.email,
        phone: updatedUser.phone,
        image: updatedUser.image,
        updatedAt: updatedUser.updatedAt.toISOString(),
      },
      "Profile updated successfully"
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse(
        "Invalid profile data",
        400,
        error.errors.map(e => e.message).join(", "),
        "/api/user/profile"
      );
    }

    console.error("Error updating profile:", error);
    return createErrorResponse(
      "Failed to update profile",
      500,
      error instanceof Error ? error.message : "Unknown error occurred",
      "/api/user/profile"
    );
  }
}