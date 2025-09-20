import { useQuery } from "@tanstack/react-query";
import { getDashboardData } from "@/shared/api/contract/dashboard";

export const useDashboardData = () => {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboardData,
  });
};