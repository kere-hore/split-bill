import { ApiResponse } from "@/shared/types/api-response";

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
}

export interface SaveAllocationsResponse {
  groupId: string;
  saved: boolean;
  settlementsCreated: number;
  allocationsCount: number;
}

export type SaveAllocationsApiResponse = ApiResponse<SaveAllocationsResponse>;