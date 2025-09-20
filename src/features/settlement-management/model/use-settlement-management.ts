import {
  useGroupSettlements,
  useUpdateSettlementStatus,
} from "@/entities/settlement";
import type { Settlement } from "@/shared/api/contract/settlements/types";

export function useSettlementManagement(groupId: string) {
  const {
    data: settlementsData,
    isLoading,
    error,
  } = useGroupSettlements(groupId);
  const updateStatusMutation = useUpdateSettlementStatus(groupId);

  const settlements = (settlementsData?.success ? settlementsData.data.settlements : []) as Settlement[];

  // Business logic calculations
  const totalAmount = settlements.reduce(
    (sum: number, settlement: Settlement) => sum + Number(settlement.amount),
    0
  );

  const pendingAmount = settlements
    .filter((s: Settlement) => s.status === "pending")
    .reduce((sum: number, settlement: Settlement) => sum + Number(settlement.amount), 0);

  const paidAmount = settlements
    .filter((s: Settlement) => s.status === "paid")
    .reduce((sum: number, settlement: Settlement) => sum + Number(settlement.amount), 0);

  const uniqueMembers = Array.from(
    new Set([
      ...settlements.map((s: Settlement) => s.payerId),
      ...settlements.map((s: Settlement) => s.receiverId),
    ])
  );

  const updateSettlementStatus = (settlementId: string, status: string) => {
    return updateStatusMutation.mutate({ settlementId, status });
  };

  return {
    settlements,
    isLoading,
    error,
    totalAmount,
    pendingAmount,
    paidAmount,
    uniqueMembers,
    updateSettlementStatus,
    isUpdating: updateStatusMutation.isPending,
  };
}
