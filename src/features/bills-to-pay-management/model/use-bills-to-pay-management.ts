import { useBillsToPay } from "@/entities/bills-to-pay";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSettlementStatus } from "@/shared/api/contract/settlements";
import { toast } from "sonner";

export function useBillsToPayManagement() {
  const queryClient = useQueryClient();
  const {
    data: billsData,
    isLoading,
    error,
  } = useBillsToPay();

  const updateStatusMutation = useMutation({
    mutationFn: ({ settlementId, status }: { settlementId: string; status: string }) =>
      updateSettlementStatus(settlementId, status),
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["bills-to-pay"] });
      toast.success(`Payment marked as ${status}`);
    },
    onError: () => {
      toast.error("Failed to update payment status");
    },
  });

  const billsToPay = billsData?.success ? billsData.data.billsToPay : [];

  // Calculate totals
  const totalAmount = billsToPay.reduce((sum, bill) => sum + bill.amount, 0);
  const pendingAmount = billsToPay
    .filter(bill => bill.status === "pending")
    .reduce((sum, bill) => sum + bill.amount, 0);
  const paidAmount = billsToPay
    .filter(bill => bill.status === "paid")
    .reduce((sum, bill) => sum + bill.amount, 0);

  const handleStatusUpdate = (billId: string, status: string) => {
    updateStatusMutation.mutate({ settlementId: billId, status });
  };

  return {
    billsToPay,
    isLoading,
    error,
    totalAmount,
    pendingAmount,
    paidAmount,
    handleStatusUpdate,
    isUpdating: updateStatusMutation.isPending,
  };
}