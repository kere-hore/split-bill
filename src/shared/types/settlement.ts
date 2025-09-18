export interface Settlement {
  id: string;
  merchant_name: string;
  total_amount: number;
  date: string;
  status: "outstanding" | "allocated";
  member_count: number;
  currency: string;
  created_at: string;
  updated_at: string;
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