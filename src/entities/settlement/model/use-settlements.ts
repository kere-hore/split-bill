import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getGroupSettlements, updateSettlementStatus } from "@/shared/api/contract/settlements";
import { toast } from "sonner";

export const settlementKeys = {
  all: ["settlements"] as const,
  group: (groupId: string) => [...settlementKeys.all, "group", groupId] as const,
};

export function useGroupSettlements(groupId: string) {
  return useQuery({
    queryKey: settlementKeys.group(groupId),
    queryFn: () => getGroupSettlements(groupId),
    enabled: !!groupId,
  });
}

export function useUpdateSettlementStatus(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ settlementId, status }: { settlementId: string; status: string }) =>
      updateSettlementStatus(settlementId, status),
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: settlementKeys.group(groupId) });
      toast.success(`Settlement marked as ${status}`);
    },
    onError: () => {
      toast.error("Failed to update settlement status");
    },
  });
}