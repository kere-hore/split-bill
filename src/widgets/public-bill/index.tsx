"use client";

import { usePublicBill } from "@/entities/public-bill";
import { PublicBillHeader } from "@/widgets/public-bill-header";
import { PublicBillReceipt } from "@/widgets/public-bill-receipt";
import { PublicBillAllocationSection } from "@/features/public-bill-allocation";
import { PublicBillMembers } from "@/widgets/public-bill-members";
import { PublicBillAllocationDetails } from "@/widgets/public-bill-allocation-details";
import { PublicBillError } from "@/widgets/public-bill-error";
import { PublicBillLoading } from "@/widgets/public-bill-loading";

interface PublicBillWidgetProps {
  groupId: string;
}

export function PublicBillWidget({ groupId }: PublicBillWidgetProps) {
  const { data, isLoading, error } = usePublicBill(groupId);

  if (isLoading) {
    return <PublicBillLoading />;
  }

  if (error || !data || !data.success) {
    return <PublicBillError error={error?.message} />;
  }

  const { group, bill, members, paymentReceiver, allocation } = data.data;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <PublicBillHeader group={group} bill={bill} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <PublicBillReceipt bill={bill} />
          </div>

          <PublicBillAllocationSection
            data={{ members, paymentReceiver, allocation }}
            onRenderMembers={(members, paymentReceiverId) => (
              <PublicBillMembers
                members={members}
                groupId={groupId}
                paymentReceiverId={paymentReceiverId}
              />
            )}
            onRenderAllocation={(allocations) => (
              <PublicBillAllocationDetails allocations={allocations} />
            )}
          />
        </div>
      </div>
    </div>
  );
}
