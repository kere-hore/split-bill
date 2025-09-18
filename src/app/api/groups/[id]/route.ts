import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  createSuccessResponse,
  createErrorResponse,
} from "@/shared/lib/api-response";
import { prisma } from "@/shared/lib/prisma";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse(
        "Authentication required",
        401,
        "User not authenticated",
        `/api/groups/${params.id}`
      );
    }
    
    const { id } = params;

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

    // Transform response with bill data
    const transformedGroup = {
      id: group.id,
      name: group.name,
      description: group.description,
      member_count: 0,
      status: "outstanding",
      created_at: group.createdAt.toISOString(),
      updated_at: group.updatedAt.toISOString(),
      bill: billData,
      members: [],
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
        `/api/groups/${params.id}`
      );
    }

    // Handle Prisma/Database specific errors
    if (error && typeof error === "object" && "code" in error) {
      console.error("Database error:", error);
      return createErrorResponse(
        "Database connection error",
        500,
        "Please try again later",
        `/api/groups/${params.id}`
      );
    }

    console.error("Error fetching group:", error);
    
    return createErrorResponse(
      "Failed to fetch group",
      500,
      error instanceof Error ? error.message : "Unknown error occurred",
      `/api/groups/${params.id}`
    );
  }
}