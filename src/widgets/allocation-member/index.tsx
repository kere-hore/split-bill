import { AllocationMember } from "@/features/allocation-management";

interface AllocationMemberPageProps {
  groupId: string;
}

export function AllocationMemberPage({ groupId }: AllocationMemberPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Cost Allocation</h1>
          <p className="text-muted-foreground">
            Manage group members and allocate costs for this receipt
          </p>
        </div>

        <AllocationMember groupId={groupId} />
      </div>
    </div>
  );
}
