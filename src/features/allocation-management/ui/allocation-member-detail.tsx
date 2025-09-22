"use client";

import { Card, CardContent } from "@/shared/components/ui/card";
import { useAllocationMemberDetail } from "../model/use-allocation-member-detail";
import { Badge } from "@/shared/components/ui/badge";

interface AllocationDetailProps {
  groupId: string;
  memberId: string;
}
export function AllocationMemberDetail({
  groupId,
  memberId,
}: AllocationDetailProps) {
  const { loading, errorMessage, errorDetails, allocation } =
    useAllocationMemberDetail(groupId, memberId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading your bill breakdown...
          </p>
        </div>
      </div>
    );
  }

  if (errorMessage || !allocation) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">
              ❌ {errorMessage || "Allocation not found"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  const { group, member } = allocation;
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-sm mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Your Bill
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{group.name}</p>
          <Badge variant="secondary" className="mt-2">
            {group.status}
          </Badge>
        </div>

        {/* Receipt Style Breakdown */}
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg p-4 font-mono text-sm shadow-lg">
          {/* Receipt Header */}
          <div className="text-center border-b dark:border-gray-700 pb-3 mb-4">
            <h2 className="font-bold text-md dark:text-white">{group.name}</h2>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Bill for: {member.memberName}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {new Date(allocation.createdAt).toLocaleDateString("id-ID")}
            </p>
          </div>

          {/* Items */}
          <div className="space-y-1 mb-4">
            <p className="text-xs font-bold dark:text-white mb-2">
              YOUR ITEMS:
            </p>
            {member.items.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between">
                  <span className="text-xs dark:text-gray-300">
                    {item.itemName}
                  </span>
                </div>
                <div className="flex justify-between text-xs dark:text-gray-300">
                  <span>
                    {item.quantity} x Rp {item.unitPrice.toLocaleString()}
                  </span>
                  <span>Rp {item.totalPrice.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Separator */}
          <div className="border-t border-dashed dark:border-gray-600 my-3"></div>

          {/* Breakdown */}
          <div className="space-y-1 text-xs dark:text-gray-300">
            <div className="flex justify-between">
              <span>Items Subtotal:</span>
              <span>Rp {member.breakdown.subtotal.toLocaleString()}</span>
            </div>

            {member.breakdown.discount > 0 && (
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>Discount ({member.splitConfig.discount}):</span>
                <span>-Rp {member.breakdown.discount.toLocaleString()}</span>
              </div>
            )}

            {member.breakdown.tax > 0 && (
              <div className="flex justify-between">
                <span>Tax ({member.splitConfig.tax}):</span>
                <span>Rp {member.breakdown.tax.toLocaleString()}</span>
              </div>
            )}

            {member.breakdown.serviceCharge > 0 && (
              <div className="flex justify-between">
                <span>Service ({member.splitConfig.serviceCharge}):</span>
                <span>
                  Rp {member.breakdown.serviceCharge.toLocaleString()}
                </span>
              </div>
            )}

            {member.breakdown.additionalFees > 0 && (
              <div className="flex justify-between">
                <span>Fees ({member.splitConfig.additionalFees}):</span>
                <span>
                  Rp {member.breakdown.additionalFees.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Final Total */}
          <div className="border-t border-dashed dark:border-gray-600 my-3"></div>
          <div className="flex justify-between text-sm font-bold dark:text-white">
            <span>YOUR TOTAL:</span>
            <span>Rp {member.breakdown.total.toLocaleString()}</span>
          </div>

          {/* Split Method */}
          <div className="border-t border-dashed dark:border-gray-600 my-3"></div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p className="mb-1">SPLIT METHOD:</p>
            <p>• Proportional: Based on consumption</p>
            <p>• Equal: Split equally</p>
          </div>

          {/* Receipt Footer */}
          <div className="text-center mt-4 pt-3 border-t dark:border-gray-600 text-xs text-gray-500 dark:text-gray-400">
            <p>Please pay your share</p>
            <p className="mt-1">Split Bill - {member.memberName}</p>
            <p className="mt-2">
              Generated:{" "}
              {new Date(allocation.createdAt).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
