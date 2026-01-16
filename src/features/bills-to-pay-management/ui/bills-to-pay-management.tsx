"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Receipt, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useBillsToPayManagement } from "../model/use-bills-to-pay-management";
import { BillsToPayList } from "./bills-to-pay-list";
import { PaymentSummary } from "./payment-summary";

export function BillsToPayManagement() {
  const {
    billsToPay,
    isLoading,
    error,
    totalAmount,
    pendingAmount,
    paidAmount,
    handleStatusUpdate,
    isUpdating,
  } = useBillsToPayManagement();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin mr-2" />
        <span>Loading bills to pay...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">❌ Failed to load bills to pay</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Your Bills ({billsToPay.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BillsToPayList
              bills={billsToPay}
              onStatusUpdate={handleStatusUpdate}
              isUpdating={isUpdating}
            />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <PaymentSummary
          totalAmount={totalAmount}
          pendingAmount={pendingAmount}
          paidAmount={paidAmount}
        />
      </div>
    </div>
  );
}