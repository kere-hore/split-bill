import { useQuery } from "@tanstack/react-query";
import { getBillsToPay } from "@/shared/api/contract/bills-to-pay";

export const useBillsToPay = () => {
  return useQuery({
    queryKey: ["bills-to-pay"],
    queryFn: getBillsToPay,
  });
};