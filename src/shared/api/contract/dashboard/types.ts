import { ApiResponse } from "@/shared/types/api-response";

export interface DashboardStats {
  totalGroups: number;
  outstandingGroups: number;
  allocatedGroups: number;
  totalAmount: number;
  pendingAmount: number;
  paidAmount: number;
  totalSettlements: number;
  pendingSettlements: number;
  paidSettlements: number;
}

export interface RecentActivity {
  id: string;
  type: "group_created" | "bill_allocated" | "payment_received" | "settlement_completed";
  title: string;
  description: string;
  amount?: number;
  createdAt: string;
}

export interface BillsToPay {
  id: string;
  merchantName: string;
  amount: number;
  receiver: {
    name: string;
  };
  status: "pending" | "paid";
  billDate: string;
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivities: RecentActivity[];
  billsToPay: BillsToPay[];
  upcomingPayments: number;
}

export type DashboardResponse = ApiResponse<DashboardData>;