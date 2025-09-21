"use client";

import { BillToPayItem } from "@/entities/bills-to-pay";
import { BillToPay } from "@/shared/api/contract/bills-to-pay";

interface BillsToPayListProps {
  bills: BillToPay[];
  onStatusUpdate: (billId: string, status: string) => void;
  isUpdating: boolean;
}

export function BillsToPayList({
  bills,
  onStatusUpdate,
  isUpdating,
}: BillsToPayListProps) {
  if (bills.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No bills to pay found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bills.map((bill) => (
        <BillToPayItem
          key={bill.id}
          bill={bill}
          onStatusUpdate={onStatusUpdate}
          isUpdating={isUpdating}
        />
      ))}
    </div>
  );
}
