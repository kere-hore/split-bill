"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { useAllocationMemberDetail } from "../model/use-allocation-member-detail";
import { Badge } from "@/shared/components/ui/badge";
import { CheckCircle, CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useUpdateSettlementStatus } from "@/entities/settlement";

interface AllocationDetailProps {
  groupId: string;
  memberId: string;
}
function PaymentSection({
  groupId,
  totalAmount,
  paymentReceiver,
  settlement,
}: {
  groupId: string;
  memberId: string;
  totalAmount: number;
  paymentReceiver?: {
    id: string;
    name: string;
    user?: {
      image?: string;
    };
  } | null;
  settlement?: {
    id: string;
    status: string;
    amount: number;
  } | null;
}) {
  const [isPaid, setIsPaid] = useState(false);
  const updateSettlementMutation = useUpdateSettlementStatus(groupId);

  useEffect(() => {
    if (settlement) {
      setIsPaid(settlement.status === "paid");
    }
  }, [settlement]);

  const handleMarkAsPaid = () => {
    if (!settlement?.id) {
      toast.error("Settlement not found");
      return;
    }

    updateSettlementMutation.mutate(
      { settlementId: settlement.id, status: "paid" },
      {
        onSuccess: () => {
          setIsPaid(true);
          toast.success("Payment marked as completed! 🎉");
        },
        onError: () => {
          toast.error("Failed to mark payment. Please try again.");
        },
      }
    );
  };

  return (
    <div className="mt-6 space-y-4">
      {/* Payment Receiver Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-8 w-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
            <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-300" />
          </div>
          <div>
            <h3 className="font-bold text-blue-900 dark:text-blue-100">
              Payment Instructions
            </h3>
            <p className="text-blue-600 dark:text-blue-400 text-sm">
              Send payment to the receiver below
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-200 dark:border-blue-600">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-blue-300 dark:border-blue-600">
              <AvatarImage src={paymentReceiver?.user?.image || ""} />
              <AvatarFallback className="bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 font-bold">
                {paymentReceiver?.name?.charAt(0).toUpperCase() || "R"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-bold text-gray-900 dark:text-gray-100">
                {paymentReceiver?.name || "Payment Receiver"}
              </p>
              <p className="text-blue-600 dark:text-blue-400 text-sm">
                💳 Ready to receive your payment
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg text-gray-900 dark:text-gray-100">
                Rp {totalAmount.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Amount to pay
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mark as Paid Button */}
      {!isPaid ? (
        <Button
          onClick={handleMarkAsPaid}
          disabled={updateSettlementMutation.isPending || !settlement?.id}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-bold rounded-xl"
          size="lg"
        >
          {updateSettlementMutation.isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Marking as Paid...
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5 mr-2" />
              Mark as Paid
            </>
          )}
        </Button>
      ) : (
        <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700 rounded-xl p-4 text-center">
          <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-2" />
          <h3 className="font-bold text-green-800 dark:text-green-200 text-lg">
            Payment Completed!
          </h3>
          <p className="text-green-600 dark:text-green-400 text-sm">
            Thank you for settling your bill
          </p>
        </div>
      )}
    </div>
  );
}

export function AllocationMemberDetail({
  groupId,
  memberId,
}: AllocationDetailProps) {
  const { loading, errorMessage, allocation } = useAllocationMemberDetail(
    groupId,
    memberId
  );

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
      <div className="w-full mx-auto px-4">
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Receipt Style Breakdown */}
          <div className="lg:col-span-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg p-4 font-mono text-sm shadow-lg">
            {/* Receipt Header */}
            <div className="text-center border-b dark:border-gray-700 pb-3 mb-4">
              <h2 className="font-bold text-md dark:text-white">
                {group.name}
              </h2>
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

          {/* Payment Section */}
          <div className="lg:col-span-2 space-y-6">
            <PaymentSection
              groupId={groupId}
              memberId={memberId}
              totalAmount={member.breakdown.total}
              paymentReceiver={allocation.paymentReceiver}
              settlement={allocation.settlement}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
