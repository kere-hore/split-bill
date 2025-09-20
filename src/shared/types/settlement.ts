export interface Settlement {
  id: string;
  merchantName: string;
  totalAmount: number;
  date: string;
  status: "outstanding" | "allocated";
  memberCount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface SettlementListResponse {
  success: boolean;
  data: {
    settlements: Settlement[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
      totalPages: number;
    };
  };
}

export interface SettlementListParams {
  page?: number;
  limit?: number;
  status?: "outstanding" | "allocated" | "all";
}