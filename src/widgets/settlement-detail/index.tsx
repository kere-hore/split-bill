"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft, Users, Receipt, Share2, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  useSettlementManagement,
  SettlementList,
} from "@/features/settlement-management";
import { SettlementSummary } from "@/widgets/settlement-summary";
import { SlackShareWidget } from "@/widgets/slack-share";

interface SettlementDetailWidgetProps {
  groupId: string;
}

export function SettlementDetailWidget({
  groupId,
}: SettlementDetailWidgetProps) {
  const {
    settlements,
    paymentStats,
    isLoading: loading,
    error,
    totalAmount,
    pendingAmount,
    paidAmount,
    uniqueMembers,
    updateSettlementStatus,
    isUpdating,
  } = useSettlementManagement(groupId);
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            <span>Loading settlements...</span>
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
            <p className="text-red-600 mb-4">
              ❌ {error.message || "Failed to load settlements"}
            </p>
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
            <Link href="/settlement">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Settlements
            </Link>
          </Button>
        </div>

        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Settlement Details</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            View who owes what to whom in this group
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Outstanding Payments
                  </div>
                  {paymentStats && (
                    <div className="text-sm text-muted-foreground">
                      {paymentStats.paidMembers} of {paymentStats.totalMembers}{" "}
                      members paid
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SettlementList
                  settlements={settlements}
                  onStatusUpdate={updateSettlementStatus}
                  isUpdating={isUpdating}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <SettlementSummary
              pendingAmount={pendingAmount}
              paidAmount={paidAmount}
              totalAmount={totalAmount}
              memberCount={uniqueMembers.length}
              settlementCount={settlements.length}
            />

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="w-full">
                  <SlackShareWidget groupId={groupId} />
                </div>
                <Button className="w-full" asChild>
                  <Link href={`/public/bills/${groupId}`} target="_blank">
                    <Share2 className="w-4 h-4 mr-2" />
                    View Public Bill
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/allocations/${groupId}`}>
                    <Users className="w-4 h-4 mr-2" />
                    Manage Group
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
