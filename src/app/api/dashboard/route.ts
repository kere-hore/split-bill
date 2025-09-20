import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  createSuccessResponse,
  createErrorResponse,
} from "@/shared/lib/api-response";
import { prisma } from "@/shared/lib/prisma";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return createErrorResponse(
        "Authentication required",
        401,
        "User not authenticated",
        "/api/dashboard"
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!currentUser) {
      return createErrorResponse(
        "User not found",
        404,
        "Current user not found in database",
        "/api/dashboard"
      );
    }

    // Get groups stats
    const [totalGroups, outstandingGroups, allocatedGroups] = await Promise.all(
      [
        prisma.group.count({ where: { createdBy: currentUser.id } }),
        prisma.group.count({
          where: { createdBy: currentUser.id, status: "outstanding" },
        }),
        prisma.group.count({
          where: { createdBy: currentUser.id, status: "allocated" },
        }),
      ]
    );

    // Get settlements data
    const settlements = await prisma.settlement.findMany({
      where: {
        OR: [{ payerId: currentUser.id }, { receiverId: currentUser.id }],
      },
      select: {
        amount: true,
        status: true,
        payerId: true,
        receiverId: true,
        createdAt: true,
      },
    });

    const totalSettlements = settlements.length;
    const pendingSettlements = settlements.filter(
      (s) => s.status === "pending"
    ).length;
    const paidSettlements = settlements.filter(
      (s) => s.status === "paid"
    ).length;

    const pendingAmount = settlements
      .filter((s) => s.payerId === currentUser.id && s.status === "pending")
      .reduce((sum, s) => sum + Number(s.amount), 0);

    const paidAmount = settlements
      .filter((s) => s.payerId === currentUser.id && s.status === "paid")
      .reduce((sum, s) => sum + Number(s.amount), 0);

    const totalAmount = pendingAmount + paidAmount;

    // Get recent activities
    const recentGroups = await prisma.group.findMany({
      where: { createdBy: currentUser.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        status: true,
        createdAt: true,
        bill: {
          select: {
            merchantName: true,
            totalAmount: true,
          },
        },
      },
    });

    const recentActivities = recentGroups.map((group) => ({
      id: group.id,
      type:
        group.status === "allocated"
          ? "bill_allocated"
          : ("group_created" as const),
      title: group.status === "allocated" ? "Bill Allocated" : "Group Created",
      description: group.bill?.merchantName || group.name,
      amount: group.bill ? Number(group.bill.totalAmount) : undefined,
      createdAt: group.createdAt.toISOString(),
    }));

    // Get bills to pay
    const billsToPayData = await prisma.settlement.findMany({
      where: {
        payerId: currentUser.id,
        status: "pending",
      },
      take: 5,
      include: {
        receiver: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const billsToPay = billsToPayData.map((settlement) => ({
      id: settlement.id,
      merchantName: `Payment to ${settlement.receiver.name}`,
      amount: Number(settlement.amount),
      receiver: settlement.receiver,
      status: settlement.status,
      billDate: settlement.createdAt.toISOString().split("T")[0],
    }));

    return createSuccessResponse(
      {
        stats: {
          totalGroups,
          outstandingGroups,
          allocatedGroups,
          totalAmount,
          pendingAmount,
          paidAmount,
          totalSettlements,
          pendingSettlements,
          paidSettlements,
        },
        recentActivities,
        billsToPay,
        upcomingPayments: pendingSettlements,
      },
      "Dashboard data retrieved successfully"
    );
  } catch (error) {
    console.error("Error retrieving dashboard data:", error);
    return createErrorResponse(
      "Failed to retrieve dashboard data",
      500,
      error instanceof Error ? error.message : "Unknown error occurred",
      "/api/dashboard"
    );
  }
}
