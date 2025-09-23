import { useQuery } from "@tanstack/react-query";
import { getPublicBill } from "@/shared/api/contract/public-bills";

export const publicBillKeys = {
  all: ["public-bills"] as const,
  detail: (groupId: string) => [...publicBillKeys.all, "detail", groupId] as const,
};

export function usePublicBill(groupId: string) {
  return useQuery({
    queryKey: publicBillKeys.detail(groupId),
    queryFn: () => getPublicBill(groupId),
    enabled: !!groupId,
  });
}