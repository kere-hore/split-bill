import axios from "axios";
import { BillsToPayApiResponse } from "./types";

export const getBillsToPay = async (): Promise<BillsToPayApiResponse> => {
  const response = await axios.get("/api/settlements/bills-to-pay");
  return response.data;
};