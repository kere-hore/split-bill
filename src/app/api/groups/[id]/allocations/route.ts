import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  createSuccessResponse,
  createErrorResponse,
} from "@/shared/lib/api-response";
import { prisma } from "@/shared/lib/prisma";
import { MemberAllocation } from "@/shared/types/allocation";
import { generateWhatsAppMessage, generateWhatsAppUrl } from "@/shared/lib/whatsapp-broadcast";

type GroupMemberWithUser = {
  id: string;
  user: {
    name: string;
    phone: string | null;
  } | null;
};

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return createErrorResponse(
        "Authentication required",
        401,
        "User not authenticated",
        "/api/groups/[id]/allocations"
      );
    }

    const { id: groupId } = await params;
    const requestBody = await request.json();
    const { allocations, billId, paymentReceiverId } = requestBody;

    // Verify user is group admin
    const currentUser = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!currentUser) {
      return createErrorResponse(
        "User not found",
        404,
        "Current user not found in database",
        "/api/groups/[id]/allocations"
      );
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: {
        createdBy: true,
        status: true,
      },
    });

    if (!group || group.createdBy !== currentUser.id) {
      return createErrorResponse(
        "Permission denied",
        403,
        "Only group creator can save allocations",
        "/api/groups/[id]/allocations"
      );
    }

    // Check if group is already allocated
    if (group.status === "allocated") {
      return createErrorResponse(
        "Group already allocated",
        400,
        "Cannot modify allocations for a group that has already been allocated and shared",
        "/api/groups/[id]/allocations"
      );
    }

    // Save allocation data as JSON
    const allocationData = {
      groupId,
      billId,
      allocations: allocations as MemberAllocation[],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Auto-generate settlements from allocations
    let settlementsCreated = 0;

    // Get all group members and payment receiver info
    const groupMembers = await prisma.groupMember.findMany({
      where: { groupId },
      select: { id: true, userId: true },
    });
    
    const memberIdToUserId = new Map(groupMembers.map(m => [m.id, m.userId]));
    
    // Get payment receiver's userId
    let paymentReceiverUserId = currentUser.id; // fallback to creator
    if (paymentReceiverId) {
      const paymentReceiverMember = groupMembers.find(m => m.id === paymentReceiverId);
      if (paymentReceiverMember) {
        paymentReceiverUserId = paymentReceiverMember.userId;
      }
    }

    // Calculate member totals and prepare settlement data
    const settlementData = [];
    for (const allocation of allocations as MemberAllocation[]) {
      const memberTotal = allocation.breakdown.total;
      if (memberTotal > 0) {
        const userId = memberIdToUserId.get(allocation.memberId);
        // Skip if this member is the payment receiver (they don't pay to themselves)
        if (userId && userId !== paymentReceiverUserId) {
          settlementData.push({
            groupId,
            payerId: userId,
            receiverId: paymentReceiverUserId, // Payment receiver gets the money
            amount: memberTotal,
            currency: "IDR",
            status: "pending",
          });
        }
      }
    }

    // Batch create settlements
    if (settlementData.length > 0) {
      await prisma.settlement.createMany({
        data: settlementData,
      });
      settlementsCreated = settlementData.length;
    }

    // Store allocation data in group
    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: {
        allocationData: JSON.stringify(allocationData),
        status: "allocated",
        paymentReceiverId,
      },
      include: {
        bill: {
          select: {
            merchantName: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    // Generate WhatsApp broadcast URLs for members with phone numbers
    const whatsappBroadcasts = [];
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://split-bill-mu.vercel.app";

    for (const allocation of allocations as MemberAllocation[]) {
      if (allocation.breakdown.total > 0) {
        const member = updatedGroup.members.find(
          (m: GroupMemberWithUser) => m.id === allocation.memberId
        );

        if (member?.user?.phone) {
          const memberUrl = `${baseUrl}/public/allocations/${groupId}/${allocation.memberId}`;

          const message = generateWhatsAppMessage({
            memberName: allocation.memberName,
            groupName: updatedGroup.name,
            merchantName: updatedGroup.bill?.merchantName,
            totalAmount: allocation.breakdown.total,
            memberUrl,
          });

          const whatsappUrl = generateWhatsAppUrl(member.user.phone, message);

          whatsappBroadcasts.push({
            memberId: allocation.memberId,
            memberName: allocation.memberName,
            phone: member.user.phone,
            whatsappUrl,
            totalAmount: allocation.breakdown.total,
          });
        }
      }
    }

    return createSuccessResponse(
      {
        groupId,
        saved: true,
        settlementsCreated,
        allocationsCount: allocations.length,
        whatsappBroadcasts,
        broadcastCount: whatsappBroadcasts.length,
      },
      "Allocations saved successfully. WhatsApp broadcast URLs generated."
    );
  } catch (error) {
    console.error("Error saving allocations:", error);
    return createErrorResponse(
      "Failed to save allocations",
      500,
      error instanceof Error ? error.message : "Unknown error occurred",
      "/api/groups/[id]/allocations"
    );
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: groupId } = await params;

    // Get group with allocation data
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: {
        id: true,
        name: true,
        allocationData: true,
      },
    });

    if (!group) {
      return createErrorResponse(
        "Group not found",
        404,
        "Group does not exist",
        "/api/groups/[id]/allocations"
      );
    }

    if (!group.allocationData) {
      return createErrorResponse(
        "No allocations found",
        404,
        "Group has no saved allocations",
        "/api/groups/[id]/allocations"
      );
    }

    const allocationData = JSON.parse(group.allocationData);

    return createSuccessResponse(
      allocationData,
      "Allocations retrieved successfully"
    );
  } catch (error) {
    console.error("Error retrieving allocations:", error);
    return createErrorResponse(
      "Failed to retrieve allocations",
      500,
      error instanceof Error ? error.message : "Unknown error occurred",
      "/api/groups/[id]/allocations"
    );
  }
}
