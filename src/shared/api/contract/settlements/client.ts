import { api } from "@/shared/api/axios";
import { SettlementsResponse, SettlementStatusResponse } from "./types";

export async function getGroupSettlements(
  groupId: string
): Promise<SettlementsResponse> {
  const response = await api.get(`/groups/${groupId}/settlements`);
  return response.data;
}

export async function updateSettlementStatus(
  settlementId: string,
  status: string
): Promise<SettlementStatusResponse> {
  const response = await api.patch(`/settlements/${settlementId}/status`, {
    status,
  });
  return response.data;
}
