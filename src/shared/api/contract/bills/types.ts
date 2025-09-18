import { ApiResponse } from "@/shared/types/api-response";

export interface CreateBillRequest {
  merchant_name: string;
  receipt_number?: string | null;
  date: string;
  time?: string | null;
  items: {
    name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    category?: string | null;
  }[];
  subtotal: number;
  discounts?: {
    name: string;
    amount: number;
    type: string;
  }[];
  service_charge?: number;
  tax?: number;
  additional_fees?: {
    name: string;
    amount: number;
  }[];
  total_amount: number;
  payment_method?: string | null;
  currency: string;
}

export interface BillResponse {
  id: string;
  merchant_name: string;
  receipt_number?: string;
  date: string;
  time?: string;
  subtotal: number;
  service_charge: number;
  tax: number;
  total_amount: number;
  payment_method?: string;
  currency: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  items: BillItem[];
  discounts: BillDiscount[];
  additional_fees: BillFee[];
}

export interface BillItem {
  id: string;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
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
