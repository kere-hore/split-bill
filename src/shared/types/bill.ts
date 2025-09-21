import type { Group, GroupMember, User, Bill } from '@prisma/client';

export type GroupWithBillDetails = Group & {
  members: (GroupMember & {
    user: User | null;
  })[];
  bill: Bill | null;
};

export interface BillDetailsResponse {
  group: {
    id: string;
    name: string;
    status: string;
  };
  bill: {
    id: string;
    merchantName: string;
    totalAmount: number;
    date: Date;
  };
  members: {
    id: string;
    userId: string;
    username: string;
    email: string;
    role: string;
  }[];
  allocation: {
    id: string;
    allocations: unknown;
  } | null;
}