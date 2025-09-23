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
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  try {
    // Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse(
        "Authentication required",
        401,
        "User not authenticated",
        `/api/groups/${id}`
      );
    }

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
        `/api/groups/${id}`
      );
    }

    // Query group with bill data
    const group = await prisma.group.findFirst({
      where: {
        id,
        createdBy: dbUser.id,
      },
      select: {
        id: true,
        name: true,
        description: true,
        billId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
        paymentReceiverId: true,
      },
    });

    if (!group) {
      throw new Error("Group not found");
    }

    // Fetch bill data if billId exists
    let billData = null;
    if (group.billId) {
      const bill = await prisma.bill.findUnique({
        where: { id: group.billId },
        include: {
          items: true,
          discounts: true,
          additionalFees: true,
        },
      });

      if (bill) {
        billData = {
          id: bill.id,
          merchantName: bill.merchantName,
          receiptNumber: bill.receiptNumber,
          date: bill.date.toISOString().split("T")[0],
          time: bill.time,
          subtotal: Number(bill.subtotal),
          serviceCharge: Number(bill.serviceCharge),
          tax: Number(bill.tax),
          totalAmount: Number(bill.totalAmount),
          paymentMethod: bill.paymentMethod,
          currency: bill.currency,
          items: bill.items.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice),
            totalPrice: Number(item.totalPrice),
            category: item.category,
          })),
          discounts: bill.discounts.map((discount) => ({
            id: discount.id,
            name: discount.name,
            amount: Number(discount.amount),
            type: discount.type,
          })),
          additionalFees: bill.additionalFees.map((fee) => ({
            id: fee.id,
            name: fee.name,
            amount: Number(fee.amount),
          })),
        };
      }
    }

    // Get group members
    const members = await prisma.groupMember.findMany({
      where: { groupId: id },
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

    const transformedGroup = {
      id: group.id,
      name: group.name,
      description: group.description,
      memberCount: members.length,
      status: group.status,
      createdAt: group.createdAt.toISOString(),
      updatedAt: group.updatedAt.toISOString(),
      createdBy: group.createdBy,
      currentUserId: dbUser.id,
      isCurrentUserAdmin: group.createdBy === dbUser.id,
      paymentReceiverId: group.paymentReceiverId,
      bill: billData,
      members: members.map((member) => ({
        id: member.id,
        role:
          member.userId && member.userId === group.createdBy
            ? "admin"
            : "member",
        user: member.user
          ? {
              id: member.user.id,
              name: member.user.name,
              email: member.user.email,
              image: member.user.image,
            }
          : {
              id: null,
              name: member.name,
              email: null,
              image: null,
            },
      })),
    };

    const response = createSuccessResponse(
      transformedGroup,
      "Group retrieved successfully"
    );

    return response;
  } catch (error) {
    // Handle authentication errors
    if (error instanceof Error && error.message === "Unauthorized") {
      return createErrorResponse(
        "Authentication required",
        401,
        "User not authenticated",
        `/api/groups/${id}`
      );
    }

    // Handle Prisma/Database specific errors
    if (error && typeof error === "object" && "code" in error) {
      console.error("Database error:", error);
      return createErrorResponse(
        "Database connection error",
        500,
        "Please try again later",
        `/api/groups/${id}`
      );
    }

    console.error("Error fetching group:", error);

    if (error instanceof Error && error.message === "Group not found") {
      return createErrorResponse(
        "Group not found",
        404,
        "Group does not exist or you don't have access",
        `/api/groups/${id}`
      );
    }

    return createErrorResponse(
      "Failed to fetch group",
      500,
      error instanceof Error ? error.message : "Unknown error occurred",
      `/api/groups/${id}`
    );
  }
}
