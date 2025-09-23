"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Bill, BillItem, GroupMember } from "@/entities/group";
import { useAllocationLogic } from "../model/use-allocation-logic";
import { formatCurrency } from "@/shared/lib/currency";
import { PaymentReceiverSelector } from "./payment-receiver-selector";

interface ItemAllocationPanelProps {
  bill: Bill;
  members: GroupMember[];
  groupId: string;
  groupStatus?: string;
  isReadOnly?: boolean;
}

export function ItemAllocationPanel({
  bill,
  members,
  groupId,
  groupStatus,
  isReadOnly = false,
}: ItemAllocationPanelProps) {
  const isAllocated = groupStatus === "allocated";
  const effectiveReadOnly = isReadOnly || isAllocated;
  const [paymentReceiver, setPaymentReceiver] = useState<string | null>(null);
  const [showReceiverSelector, setShowReceiverSelector] = useState(
    !isAllocated
  );

  const {
    selectedMember,
    isLoading,
    handleMemberSelect,
    handleItemToggle,
    isItemAllocatedToMember,
    getMemberBreakdown,
    handleSaveAndSend,
    getTotalAllocatedQuantity,
  } = useAllocationLogic(bill, members, groupId);

  const billItems = bill?.items || [];
  // Check if any items are allocated
  const hasAllocations =
    billItems?.some((item) => {
      return members.some((member) =>
        isItemAllocatedToMember(item.id, member.id)
      );
    }) || false;
  if (isReadOnly && !isAllocated) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        This allocation is read-only
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Members Row */}
      <div className="flex justify-start gap-2 sm:gap-4 mb-6 overflow-x-auto pb-2 px-1 sm:px-0">
        {members.map((member) => {
          const isSelected = selectedMember === member.id;
          const memberBreakdown = getMemberBreakdown(member.id);

          return (
            <div
              key={member.id}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all min-w-[95px] ${
                effectiveReadOnly
                  ? "cursor-default border-2 border-transparent"
                  : "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 border-2 border-transparent"
              } ${
                isSelected && !effectiveReadOnly
                  ? "bg-primary/10 border-2 border-primary"
                  : "bg-white dark:bg-gray-900"
              }`}
              onClick={() =>
                !effectiveReadOnly && handleMemberSelect(member.id)
              }
            >
              <Avatar
                className={`h-10 w-10 border-2 ${
                  isSelected
                    ? "border-primary"
                    : "border-gray-200 dark:border-gray-600"
                }`}
              >
                <AvatarImage src={member.user?.image || undefined} />
                <AvatarFallback className="text-sm font-medium">
                  {member.user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-center max-w-[85px] truncate font-medium text-gray-900 dark:text-gray-100">
                {member.user?.name?.split(" ")[0]}
              </span>

              {/* Member Breakdown - Compact */}
              {memberBreakdown.subtotal > 0 && (
                <div className="text-xs bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-600 shadow-sm min-w-[85px] max-w-[100px]">
                  <div className="space-y-0.5">
                    <div className="text-gray-600 dark:text-gray-300 leading-tight text-xs">
                      <div className="flex gap-0.5 justify-between">
                        <span>Sub:</span>
                        <div className="text-right">
                          {formatCurrency(memberBreakdown.subtotal)}
                        </div>
                      </div>
                      {memberBreakdown.discount > 0 && (
                        <div className="text-green-600 dark:text-green-400 text-right mt-1">
                          -{formatCurrency(memberBreakdown.discount)}
                        </div>
                      )}
                      {memberBreakdown.tax > 0 && (
                        <div className="flex gap-0.5 justify-between">
                          <span>Tax:</span>
                          <div className="text-right">
                            {formatCurrency(memberBreakdown.tax)}
                          </div>
                        </div>
                      )}
                      {memberBreakdown.additionalFees > 0 && (
                        <div className="flex gap-0.5 justify-between">
                          <span>Fee:</span>
                          <div className="text-right">
                            {formatCurrency(memberBreakdown.additionalFees)}
                          </div>
                        </div>
                      )}
                      {memberBreakdown.serviceCharge > 0 && (
                        <div className="flex gap-0.5 justify-between">
                          <span>Svc:</span>
                          <div className="text-right">
                            {formatCurrency(memberBreakdown.serviceCharge)}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-0.5 text-primary font-bold text-xs text-right">
                      {formatCurrency(memberBreakdown.total)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
        {selectedMember
          ? `Select items consumed by ${
              members.find((m) => m.id === selectedMember)?.user?.name
            }`
          : "Select a member above to assign items"}
      </div>

      {/* Items List */}
      <div className="space-y-1">
        {billItems?.map((item: BillItem) => {
          const isAllocatedToSelected = selectedMember
            ? isItemAllocatedToMember(item.id, selectedMember)
            : false;

          // Get members who have allocated this item
          const allocatedMembers = members.filter((member) =>
            isItemAllocatedToMember(item.id, member.id)
          );

          // Calculate total allocated quantity for this item
          const totalAllocated = getTotalAllocatedQuantity(item.id);
          const remainingQuantity = item.quantity - totalAllocated;
          const isFullyAllocated = remainingQuantity <= 0;

          return (
            <div
              key={item.id}
              className={`border-b border-dashed border-gray-200 dark:border-gray-700 pb-2 mb-2 sm:pb-3 sm:mb-3 last:border-b-0 rounded-lg p-2 sm:p-3 ${
                isFullyAllocated
                  ? "bg-gray-50 dark:bg-gray-800 opacity-75"
                  : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
              }`}
            >
              <div className="flex items-start gap-2 sm:gap-3 mb-1 sm:mb-2">
                <Checkbox
                  checked={isAllocatedToSelected}
                  onCheckedChange={(checked) => {
                    handleItemToggle(item.id, checked as boolean);
                  }}
                  disabled={
                    effectiveReadOnly ||
                    !selectedMember ||
                    (isFullyAllocated && !isAllocatedToSelected)
                  }
                  className="mt-0.5 sm:mt-1 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2 mb-0.5 sm:mb-1">
                    <h4 className="font-medium text-xs sm:text-sm truncate text-gray-900 dark:text-gray-100">
                      {item.name}
                    </h4>
                    <div className="text-right flex-shrink-0">
                      <div className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                        {formatCurrency(item.totalPrice)}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-0.5 sm:gap-y-1 text-xs">
                    <span className="text-gray-600 dark:text-gray-400 text-xs">
                      Qty: {item.quantity}
                    </span>
                    <span className="text-orange-600 dark:text-orange-400 text-xs">
                      Used: {totalAllocated}
                    </span>
                    <span
                      className={`${
                        remainingQuantity > 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      } font-medium text-xs`}
                    >
                      Left: {remainingQuantity}
                    </span>
                    {isFullyAllocated && (
                      <span className="text-red-500 dark:text-red-400 font-bold text-xs bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                        FULL
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Show allocated members */}
              {allocatedMembers.length > 0 && (
                <div className="ml-6 sm:ml-8 mt-1 sm:mt-2">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      To:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {allocatedMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-1"
                        >
                          <Avatar className="h-4 w-4 sm:h-5 sm:w-5 border border-gray-300 dark:border-gray-600">
                            <AvatarImage
                              src={member.user?.image || undefined}
                            />
                            <AvatarFallback className="text-xs">
                              {member.user?.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-gray-600 dark:text-gray-400 hidden sm:inline">
                            {member.user?.name?.split(" ")[0]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bill Summary */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-4">
        <h3 className="font-medium text-sm mb-2 text-gray-900 dark:text-gray-100">
          Bill Summary
        </h3>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
            <span className="text-gray-900 dark:text-gray-100">
              {formatCurrency(bill?.subtotal)}
            </span>
          </div>
          {bill?.discounts && bill.discounts.length > 0 && (
            <div className="flex justify-between text-green-600 dark:text-green-400">
              <span>Discount:</span>
              <span>
                -{" "}
                {formatCurrency(
                  bill.discounts.reduce((sum, d) => sum + Number(d.amount), 0)
                )}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Tax:</span>
            <span className="text-gray-900 dark:text-gray-100">
              {formatCurrency(bill.tax)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              Service Charge:
            </span>
            <span className="text-gray-900 dark:text-gray-100">
              {formatCurrency(bill.serviceCharge)}
            </span>
          </div>
          {bill?.additionalFees && bill.additionalFees.length > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Additional Fees:
              </span>
              <span className="text-gray-900 dark:text-gray-100">
                {formatCurrency(
                  bill.additionalFees.reduce((sum, f) => sum + f.amount, 0)
                )}
              </span>
            </div>
          )}
          <div className="border-t border-gray-200 dark:border-gray-600 pt-1 flex justify-between font-semibold text-primary">
            <span>Total:</span>
            <span>{formatCurrency(bill?.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Payment Receiver Selector */}
      {!effectiveReadOnly && showReceiverSelector && (
        <PaymentReceiverSelector
          members={members}
          selectedReceiver={paymentReceiver}
          onReceiverSelect={setPaymentReceiver}
          onConfirm={() => {
            if (paymentReceiver) {
              setShowReceiverSelector(false);
            }
          }}
        />
      )}

      {/* Allocation Status Warning */}
      {!effectiveReadOnly && !showReceiverSelector && !hasAllocations && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            ⚠️ No items have been allocated yet. Please select a member and
            assign items to them.
          </p>
        </div>
      )}

      {/* Send Button */}
      {!effectiveReadOnly && !showReceiverSelector && (
        <>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-green-700 dark:text-green-300">
                Payment Receiver:
              </span>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={
                      members.find((m) => m.id === paymentReceiver)?.user
                        ?.image || undefined
                    }
                  />
                  <AvatarFallback className="text-xs">
                    {members
                      .find((m) => m.id === paymentReceiver)
                      ?.user?.name?.charAt(0)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  {members.find((m) => m.id === paymentReceiver)?.user?.name}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReceiverSelector(true)}
                className="text-xs text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
              >
                Change
              </Button>
            </div>
          </div>

          <Button
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-full text-base font-medium"
            onClick={() => handleSaveAndSend(paymentReceiver)}
            disabled={isLoading || !paymentReceiver || !hasAllocations}
          >
            {isLoading ? "Saving..." : "Send to members"}
          </Button>

          {!hasAllocations && (
            <p className="text-center text-sm text-red-600 dark:text-red-400 mt-2">
              Please allocate at least one item to a member before sending
            </p>
          )}
        </>
      )}

      {isAllocated && (
        <div className="text-center py-4 text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          ✅ This group has been allocated. Items are shown for reference only.
        </div>
      )}
    </div>
  );
}
