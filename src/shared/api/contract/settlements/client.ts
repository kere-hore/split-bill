import { api } from "@/shared/api/axios";
import { ApiResponse } from "@/shared/types/api-response";
import { Settlement } from "./types";

export async function getGroupSettlements(groupId: string): Promise<ApiResponse<{ settlements: Settlement[] }>> {
  const response = await api.get(`/groups/${groupId}/settlements`);
  return response.data;
}

export async function updateSettlementStatus(settlementId: string, status: string): Promise<ApiResponse<{ id: string; status: string }>> {
  const response = await api.patch(`/settlements/${settlementId}/status`, { status });
  return response.data;
}