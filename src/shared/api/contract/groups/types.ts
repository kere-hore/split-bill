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
  unit_price: number;
  total_price: number;
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
  merchant_name: string;
  receipt_number: string | null;
  date: string;
  time: string | null;
  subtotal: number;
  service_charge: number;
  tax: number;
  total_amount: number;
  payment_method: string | null;
  currency: string;
  items: BillItem[];
  discounts: BillDiscount[];
  additional_fees: BillFee[];
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  member_count: number;
  status: "outstanding" | "allocated";
  created_at: string;
  updated_at: string;
  members: GroupMember[];
  bill: Bill | null;
}

export interface GetGroupsRequest {
  page?: number;
  limit?: number;
  status?: "outstanding" | "allocated" | "all";
}

export interface GetGroupsResponse {
  success: boolean;
  message: string;
  data: {
    groups: Group[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
      totalPages: number;
    };
  };
  timestamp: string;
}
