import { ApiResponse } from "@/shared/types/api-response";

export interface BillToPay {
  id: string;
  groupId: string;
  groupName: string;
  merchantName: string;
  billDate: string | null;
  amount: number;
  currency: string;
  status: string;
  receiver: {
    id: string;
    name: string;
    image: string | null;
  };
  createdAt: string;
}

export interface BillsToPayResponse {
  billsToPay: BillToPay[];
}

export type BillsToPayApiResponse = ApiResponse<BillsToPayResponse>;