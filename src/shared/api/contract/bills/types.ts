import { ApiResponse } from "@/shared/types/api-response";

export interface CreateBillRequest {
  merchantName: string;
  receiptNumber?: string | null;
  date: string;
  time?: string | null;
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    category?: string | null;
  }[];
  subtotal: number;
  discounts?: {
    name: string;
    amount: number;
    type: string;
  }[];
  serviceCharge?: number;
  tax?: number;
  additionalFees?: {
    name: string;
    amount: number;
  }[];
  totalAmount: number;
  paymentMethod?: string | null;
  currency: string;
}

export interface BillResponse {
  id: string;
  merchantName: string;
  receiptNumber?: string;
  date: string;
  time?: string;
  subtotal: number;
  serviceCharge: number;
  tax: number;
  totalAmount: number;
  paymentMethod?: string;
  currency: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  groupId: string;
  items: BillItem[];
  discounts: BillDiscount[];
  additionalFees: BillFee[];
}

export interface BillItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category?: string | null;
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

export type CreateBillResponse = ApiResponse<BillResponse>;
