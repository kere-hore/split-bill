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
    const { page, limit, status } = querySchema.parse({
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

    // Build where clause with status filter
    const whereClause: any = { createdBy: dbUser.id };
    if (status !== "all") {
      whereClause.status = status;
    }

    // Query groups using Prisma ORM
    const groups = await prisma.group.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
    });

    const totalCount = await prisma.group.count({
      where: whereClause,
    });

    const hasMore = page * limit < totalCount;

    // Get member counts and bill data for each group
    const transformedGroups = await Promise.all(
      (groups as any[]).map(async (group) => {
        // Get member count
        const memberCount = await prisma.groupMember.count({
          where: { groupId: group.id },
        });

        // Get bill data if exists
        let billData = null;
        if (group.billId) {
          const bill = await prisma.bill.findUnique({
            where: { id: group.billId },
            select: {
              merchantName: true,
              totalAmount: true,
              date: true,
            },
          });
          if (bill) {
            billData = {
              merchantName: bill.merchantName,
              totalAmount: Number(bill.totalAmount),
              date: bill.date.toISOString().split("T")[0],
            };
          }
        }

        return {
          id: group.id,
          name: group.name,
          description: group.description,
          memberCount: memberCount,
          status: group.status || "outstanding",
          createdAt: group.createdAt.toISOString(),
          updatedAt: group.updatedAt.toISOString(),
          bill: billData,
        };
      })
    );

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
