import { ApiResponse } from "@/shared/types/api-response";

export interface PublicBillItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PublicBillDiscount {
  id: string;
  name: string;
  amount: number;
}

export interface PublicBillFee {
  id: string;
  name: string;
  amount: number;
}

export interface PublicBill {
  id: string;
  merchantName: string;
  receiptNumber?: string;
  date: string;
  subtotal: number;
  tax: number;
  serviceCharge: number;
  totalAmount: number;
  items: PublicBillItem[];
  discounts: PublicBillDiscount[];
  additionalFees: PublicBillFee[];
}

export interface PublicGroup {
  id: string;
  name: string;
  description?: string;
  status: string;
  createdAt: string;
  createdBy: string;
}

export interface PublicMember {
  id: string;
  name: string;
  user?: {
    image?: string;
  };
}

export interface PublicAllocationBreakdown {
  subtotal: number;
  discount: number;
  tax: number;
  serviceCharge: number;
  additionalFees: number;
  total: number;
}

export interface PublicAllocationItem {
  itemName: string;
  quantity: number;
  totalPrice: number;
}

export interface PublicAllocation {
  memberId: string;
  memberName: string;
  breakdown: PublicAllocationBreakdown;
  items: PublicAllocationItem[];
}

export interface PublicBillData {
  group: PublicGroup;
  bill: PublicBill;
  members: PublicMember[];
  paymentReceiver?: PublicMember | null;
  allocation?: {
    allocations: PublicAllocation[];
  };
}

export type PublicBillResponse = ApiResponse<PublicBillData>