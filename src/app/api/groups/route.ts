import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
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
  view: z
    .enum(["allocation", "settlement"])
    .nullable()
    .optional()
    .default("allocation")
    .transform((val) => val || "allocation"),
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
    const { page, limit, status, view } = querySchema.parse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      status: searchParams.get("status"),
      view: searchParams.get("view"),
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
    const whereClause: Prisma.GroupWhereInput = { createdBy: dbUser.id };
    if (status !== "all") {
      whereClause.status = status;
    }

    const [groups, totalCount] = await Promise.all([
      prisma.group.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: (page - 1) * limit,
        include: {
          _count: {
            select: { members: true },
          },
          bill: {
            select: {
              merchantName: true,
              totalAmount: true,
              date: true,
            },
          },
        },
      }),
      prisma.group.count({ where: whereClause }),
    ]);

    const hasMore = page * limit < totalCount;

    // Get settlements for all allocated groups in single query
    const allocatedGroupIds = groups
      .filter((g) => g.status === "allocated")
      .map((g) => g.id);

    const settlementsMap = new Map<string, { status: string }[]>();
    if (allocatedGroupIds.length > 0) {
      // Build settlement where clause based on view parameter
      const settlementWhere: any = { groupId: { in: allocatedGroupIds } };
      if (view === "settlement") {
        settlementWhere.receiverId = dbUser.id; // Only settlements where current user is receiver
      }

      const settlements = await prisma.settlement.findMany({
        where: settlementWhere,
        select: { groupId: true, status: true },
      });

      settlements.forEach((s) => {
        if (!settlementsMap.has(s.groupId)) {
          settlementsMap.set(s.groupId, []);
        }
        settlementsMap.get(s.groupId)!.push({ status: s.status });
      });
    }

    // Transform groups data
    const transformedGroups = groups.map((group) => {
      // Bill data
      let billData = null;
      if (group.bill) {
        billData = {
          merchantName: group.bill.merchantName,
          totalAmount: Number(group.bill.totalAmount),
          date: group.bill.date.toISOString().split("T")[0],
        };
      }

      // Payment stats for allocated groups
      let paymentStats = null;
      if (group.status === "allocated") {
        const settlements = settlementsMap.get(group.id) || [];

        if (settlements.length > 0) {
          const totalMembers = settlements.length;
          const paidMembers = settlements.filter(
            (s) => s.status === "paid"
          ).length;

          paymentStats = {
            totalMembers,
            paidMembers,
            pendingMembers: totalMembers - paidMembers,
          };
        }
      }

      return {
        id: group.id,
        name: group.name,
        description: group.description,
        memberCount: group._count.members,
        status: group.status || "outstanding",
        createdAt: group.createdAt.toISOString(),
        updatedAt: group.updatedAt.toISOString(),
        bill: billData,
        paymentStats,
      };
    });

    const result = {
      groups: transformedGroups,
      pagination: {
        page,
        limit,
        total: totalCount,
        hasMore,
        totalPages: Math.ceil(totalCount / limit),
      },
    };

    const response = createSuccessResponse(
      result,
      "Groups retrieved successfully"
    );
    return response;
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
