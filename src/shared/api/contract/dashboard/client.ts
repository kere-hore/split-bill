import { DashboardResponse } from "./types";
import { api } from "@/shared/api/axios";

export const getDashboardData = async (): Promise<DashboardResponse> => {
  const response = await api.get("/dashboard");
  return response.data;
};
