"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft, Receipt, Loader2 } from "lucide-react";
import Link from "next/link";
import { 
  useBillsToPayManagement,
  BillsToPayList,
  PaymentSummary 
} from "@/features/bills-to-pay-management";

export function BillsToPayWidget() {
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
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            <span>Loading bills to pay...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">❌ Failed to load bills to pay</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Bills to Pay</h1>
          <p className="text-muted-foreground">
            Manage your pending payments and track what you owe
          </p>
        </div>

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
      </div>
    </div>
  );
}