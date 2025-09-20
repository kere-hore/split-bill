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
        "User not authenticated",
        "/api/settlements/bills-to-pay"
      );
    }

    await prisma.$connect();

    const currentUser = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!currentUser) {
      return createErrorResponse(
        "User not found",
        404,
        "Current user not found in database",
        "/api/settlements/bills-to-pay"
      );
    }

    // Get settlements where current user is the payer
    const settlements = await prisma.settlement.findMany({
      where: { payerId: currentUser.id },
      include: {
        receiver: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get group info for each settlement
    const billsToPay = await Promise.all(
      settlements.map(async (settlement) => {
        const group = await prisma.group.findUnique({
          where: { id: settlement.groupId },
          select: {
            id: true,
            name: true,
            bill: {
              select: {
                merchantName: true,
                date: true,
              },
            },
          },
        });

        return {
          id: settlement.id,
          groupId: settlement.groupId,
          groupName: group?.name || "Unknown Group",
          merchantName: group?.bill?.merchantName || "Unknown Merchant",
          billDate: group?.bill?.date?.toISOString().split("T")[0] || null,
          amount: Number(settlement.amount),
          currency: settlement.currency,
          status: settlement.status,
          receiver: settlement.receiver,
          createdAt: settlement.createdAt.toISOString(),
        };
      })
    );

    return createSuccessResponse(
      { billsToPay },
      "Bills to pay retrieved successfully"
    );
  } catch (error) {
    console.error("Error retrieving bills to pay:", error);
    return createErrorResponse(
      "Failed to retrieve bills to pay",
      500,
      error instanceof Error ? error.message : "Unknown error occurred",
      "/api/settlements/bills-to-pay"
    );
  }
}