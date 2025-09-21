import { prisma } from '@/shared/lib/prisma';
import type { GroupWithBillDetails, BillDetailsResponse } from '@/shared/types/bill';

export async function getBillWithDetails(groupId: string): Promise<BillDetailsResponse | null> {
  try {
    const group: GroupWithBillDetails | null = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        bill: {
          include: {
            items: {
              include: {
                allocations: true,
              },
            },
          },
        },
      },
    });

    if (!group || !group.bill) {
      return null;
    }

    const members = group.members.map((member) => ({
      id: member.id,
      userId: member.userId,
      username: member.user?.username || member.name,
      email: member.user?.email || '',
      role: member.role,
    }));

    const allocation = group.allocationData ? {
      id: group.id,
      allocations: JSON.parse(group.allocationData),
    } : null;

    return {
      group: {
        id: group.id,
        name: group.name,
        status: group.status,
      },
      bill: {
        id: group.bill.id,
        merchantName: group.bill.merchantName,
        totalAmount: Number(group.bill.totalAmount),
        date: group.bill.date,
      },
      members,
      allocation,
    };
  } catch (error) {
    console.error('Error fetching bill details:', error);
    return null;
  }
}