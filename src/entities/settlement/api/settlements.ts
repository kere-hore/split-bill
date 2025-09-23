import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSettlementStatus } from "@/shared/api/contract/settlements/client";

export const useUpdateSettlementStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      settlementId,
      status,
    }: {
      settlementId: string;
      status: string;
    }) => updateSettlementStatus(settlementId, status),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["settlements"] });
      queryClient.invalidateQueries({ queryKey: ["allocations"] });
    },
  });
};
