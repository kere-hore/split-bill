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
    });

    if (!group) {
      return createErrorResponse(
        "Group not found",
        404,
        "Group does not exist or you don't have access",
        `/api/groups/${id}`
      );
    }

    // Fetch bill data if billId exists
    let billData = null;
    if (group.billId) {
      const bill = await prisma.bill.findUnique({
        where: { id: group.billId },
        include: {
          items: true,
        },
      });

      if (bill) {
        billData = {
          id: bill.id,
          merchant_name: bill.merchantName,
          receipt_number: bill.receiptNumber,
          date: bill.date.toISOString().split("T")[0],
          time: bill.time,
          subtotal: Number(bill.subtotal),
          service_charge: Number(bill.serviceCharge),
          tax: Number(bill.tax),
          total_amount: Number(bill.totalAmount),
          payment_method: bill.paymentMethod,
          currency: bill.currency,
          items: bill.items.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            unit_price: Number(item.unitPrice),
            total_price: Number(item.totalPrice),
            category: item.category,
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

    // Transform response with bill data and members
    const transformedGroup = {
      id: group.id,
      name: group.name,
      description: group.description,
      member_count: members.length,
      status: members.length === 0 ? "outstanding" : "allocated",
      created_at: group.createdAt.toISOString(),
      updated_at: group.updatedAt.toISOString(),
      created_by: group.createdBy, // Database user ID of creator
      current_user_id: dbUser.id, // Current user's database ID
      is_current_user_admin: group.createdBy === dbUser.id, // Check if current user is creator
      bill: billData,
      members: members.map((member) => ({
        id: member.id,
        role: (member.userId && member.userId === group.createdBy) ? "admin" : "member",
        user: member.user ? {
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
          image: member.user.image,
        } : {
          id: null,
          name: member.name, // Use name from GroupMember for custom users
          email: null,
          image: null,
        },
      })),
    };

    return createSuccessResponse(
      transformedGroup,
      "Group retrieved successfully"
    );
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

    return createErrorResponse(
      "Failed to fetch group",
      500,
      error instanceof Error ? error.message : "Unknown error occurred",
      `/api/groups/${id}`
    );
  }
}
