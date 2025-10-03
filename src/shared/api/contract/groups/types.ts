import { ApiResponse } from "@/shared/types/api-response";

export interface GroupMember {
  id: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

export interface BillItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: string | null;
}

export interface BillDiscount {
  id: string;
  name: string;
  amount: number;
  type: string;
}

export interface BillFee {
  id: string;
  name: string;
  amount: number;
}

export interface Bill {
  id: string;
  merchantName: string;
  receiptNumber: string | null;
  date: string;
  time: string | null;
  subtotal: number;
  serviceCharge: number;
  tax: number;
  totalAmount: number;
  paymentMethod: string | null;
  currency: string;
  items: BillItem[];
  discounts: BillDiscount[];
  additionalFees: BillFee[];
}
export interface PaymentStats {
  totalMembers: number;
  paidMembers: number;
  pendingMembers: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
}
export interface Group {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
  status: "outstanding" | "allocated";
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  currentUserId: string;
  isCurrentUserAdmin: boolean;
  members: GroupMember[];
  bill: Bill | null;
  paymentStats: PaymentStats;
  paymentReceiverId: string | null;
}

export interface GetGroupsRequest {
  page?: number;
  limit?: number;
  status?: "outstanding" | "allocated" | "all";
}
export interface GroupData {
  groups: Group[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
      totalPages: number;
    };
}

export type GetGroupsResponse = ApiResponse<GroupData>;
