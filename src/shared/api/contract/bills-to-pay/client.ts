import { BillsToPayApiResponse } from "./types";
import { api } from "@/shared/api/axios";

export const getBillsToPay = async (): Promise<BillsToPayApiResponse> => {
  const response = await api.get("/api/settlements/bills-to-pay");
  return response.data;
};