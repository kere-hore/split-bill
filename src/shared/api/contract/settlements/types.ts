import { ApiResponse } from "@/shared/types/api-response";

export interface Settlement {
  id: string;
  payerId: string;
  receiverId: string;
  amount: number;
  currency: string;
  status: "pending" | "paid";
  createdAt: string;
  payer: {
    id: string;
    name: string;
    image?: string;
  };
  receiver: {
    id: string;
    name: string;
    image?: string;
  };
}

export interface PaymentStats {
  totalMembers: number;
  paidMembers: number;
  pendingMembers: number;
}

export interface SettlementData {
  settlements: Settlement[];
  paymentStats: PaymentStats;
}

export interface SettlementStatus {
  id: string,
  status: string
}

export type SettlementStatusResponse = ApiResponse<SettlementStatus>

export type SettlementsResponse = ApiResponse<SettlementData>