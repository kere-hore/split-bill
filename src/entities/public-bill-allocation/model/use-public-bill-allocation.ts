import { PublicMember, PublicAllocation } from "@/shared/api/contract/public-bills";

export interface PublicBillAllocationData {
  members: PublicMember[];
  paymentReceiver?: PublicMember | null;
  allocation?: {
    allocations: PublicAllocation[];
  };
}

export function usePublicBillAllocation(data: PublicBillAllocationData) {
  const { members, paymentReceiver, allocation } = data;

  const paymentReceiverId = paymentReceiver?.id;
  const allocations = allocation?.allocations || [];
  const hasAllocation = allocations.length > 0;

  return {
    members,
    paymentReceiverId,
    allocations,
    hasAllocation,
  };
}