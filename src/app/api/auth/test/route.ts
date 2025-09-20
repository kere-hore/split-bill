import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  createSuccessResponse,
  createErrorResponse,
} from "@/shared/lib/api-response";
import { prisma } from "@/shared/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return createErrorResponse(
        "Authentication required",
        401,
        "No valid session found",
        "/api/auth/test"
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        clerkId: true,
        email: true,
        username: true,
        createdAt: true,
      },
    });

    if (!user) {
      return createErrorResponse(
        "User not found in database",
        404,
        "User exists in Clerk but not in database",
        "/api/auth/test"
      );
    }

    return createSuccessResponse(
      {
        user,
        session: {
          clerkId,
          authenticated: true,
        },
      },
      "Authentication test successful"
    );
  } catch (error) {
    console.error("Auth test error:", error);
    return createErrorResponse(
      "Authentication test failed",
      500,
      error instanceof Error ? error.message : "Unknown error",
      "/api/auth/test"
    );
  }
}
