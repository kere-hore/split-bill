import { AllocationMemberDetail } from "@/features/allocation-management";

interface AllocationDetailPageProps {
  groupId: string;
  memberId: string;
}

export function AllocationDetailPage({
  groupId,
  memberId,
}: AllocationDetailPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Cost Allocation Member</h1>
          <p className="text-muted-foreground">
            Members costs for this receipt
          </p>
        </div>
        <AllocationMemberDetail groupId={groupId} memberId={memberId} />
      </div>
    </div>
  );
}
