import { api } from "@/shared/api/axios";
import { ApiResponse } from "@/shared/types/api-response";
import { PublicBillResponse } from "./types";

export async function getPublicBill(
  groupId: string
): Promise<ApiResponse<PublicBillResponse["data"]>> {
  const response = await api.get(`/public/bills/${groupId}`);
  return response.data;
}