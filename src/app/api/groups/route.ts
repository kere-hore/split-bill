/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import {
  createSuccessResponse,
  createErrorResponse,
} from "@/shared/lib/api-response";
import { prisma } from "@/shared/lib/prisma";

const querySchema = z.object({
  page: z
    .string()
    .nullable()
    .optional()
    .default("1")
    .transform((val) => Number(val || "1")),
  limit: z
    .string()
    .nullable()
    .optional()
    .default("10")
    .transform((val) => Number(val || "10")),
  status: z
    .enum(["outstanding", "allocated", "all"])
    .nullable()
    .optional()
    .default("all")
    .transform((val) => val || "all"),
});

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse(
        "Authentication required",
        401,
        "User not authenticated",
        "/api/groups"
      );
    }

    const { searchParams } = new URL(request.url);
    const { page, limit } = querySchema.parse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      status: searchParams.get("status"),
    });

    // Get database user ID from Clerk ID
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!dbUser) {
      return createErrorResponse(
        "User not found",
        404,
        "User does not exist in database",
        "/api/groups"
      );
    }

    // Query groups using database user ID
    const groups = await prisma.$queryRaw`
      SELECT * FROM "Group" 
      WHERE "createdBy" = ${dbUser.id}
      ORDER BY "createdAt" DESC
      LIMIT ${limit} OFFSET ${(page - 1) * limit}
    `;

    const totalResult = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "Group" 
      WHERE "createdBy" = ${dbUser.id}
    `;

    const totalCount = Number((totalResult as any[])[0]?.count || 0);

    const hasMore = page * limit < totalCount;

    // Transform response with basic data
    const transformedGroups = (groups as any[]).map((group) => ({
      id: group.id,
      name: group.name,
      description: group.description,
      member_count: 0, // Will be calculated separately
      status: "outstanding", // Will be calculated separately
      created_at: group.createdAt.toISOString(),
      updated_at: group.updatedAt.toISOString(),
      bill: null, // Will be fetched separately if needed
      members: [], // Will be fetched separately if needed
    }));

    return createSuccessResponse(
      {
        groups: transformedGroups,
        pagination: {
          page,
          limit,
          total: totalCount,
          hasMore,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
      "Groups retrieved successfully"
    );
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return createErrorResponse(
        "Invalid query parameters",
        400,
        error.message,
        "/api/groups"
      );
    }

    // Handle Prisma/Database specific errors
    if (error && typeof error === "object" && "code" in error) {
      console.error("Database error:", error);
      return createErrorResponse(
        "Database connection error",
        500,
        "Please try again later",
        "/api/groups"
      );
    }

    console.error("Error fetching groups:", error);

    return createErrorResponse(
      "Failed to fetch groups",
      500,
      error instanceof Error ? error.message : "Unknown error occurred",
      "/api/groups"
    );
  }
}
