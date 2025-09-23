// Removed circular import - using inline type

import { ApiResponse, ApiSuccessResponse } from "@/shared/types/api-response";

export type SplitMethod = "equal" | "proportional" | "custom";

export interface SplitConfig {
  tax: SplitMethod;
  serviceCharge: SplitMethod;
  discount: SplitMethod;
  additionalFees: SplitMethod;
}

export interface ItemAllocation {
  itemId: string;
  memberAllocations: Record<string, number>;
}

export interface MemberAllocation {
  memberId: string;
  memberName: string;
  items: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  breakdown: {
    subtotal: number;
    discount: number;
    tax: number;
    serviceCharge: number;
    additionalFees: number;
    total: number;
  };
  splitConfig: SplitConfig;
}

export interface SaveAllocationsRequest {
  allocations: MemberAllocation[];
  billId?: string;
  paymentReceiverId?: string | null;
}

export interface WhatsAppBroadcast {
  memberId: string;
  memberName: string;
  phone: string;
  whatsappUrl: string;
  totalAmount: number;
}

export interface SaveAllocationsResponse {
  groupId: string;
  saved: boolean;
  settlementsCreated: number;
  allocationsCount: number;
  whatsappBroadcasts?: WhatsAppBroadcast[];
  broadcastCount?: number;
}

export interface AllocationData {
  group: {
    id: string;
    name: string;
    status: string;
  };
  member: MemberAllocation;
  paymentReceiver?: {
    id: string;
    name: string;
    user?: {
      image?: string;
    };
  } | null;
  settlement?: {
    id: string;
    status: string;
    amount: number;
  } | null;
  createdAt: string;
  updatedAt: string;
}
export type GetAllocationsApiResponse = ApiSuccessResponse<AllocationData>;
export type SaveAllocationsApiResponse = ApiResponse<SaveAllocationsResponse>;
