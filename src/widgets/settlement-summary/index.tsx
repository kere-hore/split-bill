"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

interface SettlementSummaryProps {
  pendingAmount: number;
  paidAmount: number;
  totalAmount: number;
  memberCount: number;
  settlementCount: number;
}

export function SettlementSummary({
  pendingAmount,
  paidAmount,
  totalAmount,
  memberCount,
  settlementCount,
}: SettlementSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Total Outstanding</span>
          <span className="font-semibold text-red-600">
            Rp {pendingAmount.toLocaleString("id-ID")}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Total Paid</span>
          <span className="font-semibold text-green-600">
            Rp {paidAmount.toLocaleString("id-ID")}
          </span>
        </div>
        <div className="flex justify-between border-t pt-2">
          <span className="text-sm font-medium">Total Amount</span>
          <span className="font-semibold">
            Rp {totalAmount.toLocaleString("id-ID")}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Members</span>
          <span className="font-medium">{memberCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Settlements</span>
          <span className="font-medium">{settlementCount}</span>
        </div>
      </CardContent>
    </Card>
  );
}