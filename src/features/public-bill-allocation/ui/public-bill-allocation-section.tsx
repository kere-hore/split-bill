import { usePublicBillAllocation, PublicBillAllocationData } from "@/entities/public-bill-allocation";

interface PublicBillAllocationSectionProps {
  data: PublicBillAllocationData;
  onRenderMembers: (members: any[], paymentReceiverId?: string) => React.ReactNode;
  onRenderAllocation: (allocations: any[]) => React.ReactNode;
}

export function PublicBillAllocationSection({
  data,
  onRenderMembers,
  onRenderAllocation,
}: PublicBillAllocationSectionProps) {
  const { members, paymentReceiverId, allocations, hasAllocation } = usePublicBillAllocation(data);

  return (
    <div className="lg:col-span-2 space-y-6">
      {onRenderMembers(members, paymentReceiverId)}
      {hasAllocation && onRenderAllocation(allocations)}
    </div>
  );
}
