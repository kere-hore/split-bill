import { AllocationsList } from "@/features/allocation-management";

export function AllocationsListPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Allocations</h1>
            <p className="text-muted-foreground">
              Manage cost allocation and group members for your receipts
            </p>
          </div>
        </div>

        <AllocationsList />
      </div>
    </div>
  );
}
