"use client";

import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Bill, BillItem, GroupMember } from "@/entities/group";
import { useAllocationLogic } from "../model/use-allocation-logic";

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
      <div className="flex justify-start sm:justify-center gap-2 sm:gap-4 mb-6 overflow-x-auto pb-2 px-4 -mx-4">
        {members.map((member) => {
          const isSelected = selectedMember === member.id;
          const memberBreakdown = getMemberBreakdown(member.id);

          return (
            <div
              key={member.id}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all min-w-[90px] ${
                effectiveReadOnly 
                  ? "cursor-default border-2 border-transparent" 
                  : "cursor-pointer hover:bg-gray-50 border-2 border-transparent"
              } ${
                isSelected && !effectiveReadOnly
                  ? "bg-primary/10 border-2 border-primary"
                  : ""
              }`}
              onClick={() => !effectiveReadOnly && handleMemberSelect(member.id)}
            >
              <Avatar
                className={`h-10 w-10 border-2 ${
                  isSelected ? "border-primary" : "border-gray-200"
                }`}
              >
                <AvatarImage src={member.user?.image || undefined} />
                <AvatarFallback className="text-sm font-medium">
                  {member.user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-center max-w-[85px] truncate font-medium">
                {member.user?.name?.split(" ")[0]}
              </span>

              {/* Member Breakdown - Compact */}
              {memberBreakdown.subtotal > 0 && (
                <div className="text-xs bg-white rounded-lg p-2 border shadow-sm min-w-[85px] max-w-[100px]">
                  <div className="space-y-0.5">
                    <div className="text-gray-600 leading-tight">
                      <div>
                        Sub: {(memberBreakdown.subtotal / 1000).toFixed(0)}k
                      </div>
                      {memberBreakdown.discount > 0 && (
                        <div className="text-green-600">
                          -{(memberBreakdown.discount / 1000).toFixed(0)}k
                        </div>
                      )}
                      {memberBreakdown.tax > 0 && (
                        <div>
                          Tax: {(memberBreakdown.tax / 1000).toFixed(0)}k
                        </div>
                      )}
                      {memberBreakdown.serviceCharge > 0 && (
                        <div>
                          Svc:{" "}
                          {(memberBreakdown.serviceCharge / 1000).toFixed(0)}k
                        </div>
                      )}
                    </div>
                    <div className="border-t pt-0.5 text-primary font-bold text-sm">
                      {(memberBreakdown.total / 1000).toFixed(0)}k
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-gray-500 mb-4">
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
              className={`border-b border-dashed border-gray-200 pb-2 mb-2 sm:pb-3 sm:mb-3 last:border-b-0 rounded-lg p-2 sm:p-3 ${
                isFullyAllocated ? "bg-gray-50 opacity-75" : "bg-white"
              }`}
            >
              <div className="flex items-start gap-2 sm:gap-3 mb-1 sm:mb-2">
                <Checkbox
                  checked={isAllocatedToSelected}
                  onCheckedChange={(checked) => {
                    handleItemToggle(item.id, checked as boolean);
                  }}
                  disabled={effectiveReadOnly || !selectedMember || (isFullyAllocated && !isAllocatedToSelected)}
                  className="mt-0.5 sm:mt-1 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2 mb-0.5 sm:mb-1">
                    <h4 className="font-medium text-xs sm:text-sm truncate">
                      {item.name}
                    </h4>
                    <div className="text-right flex-shrink-0">
                      <div className="font-semibold text-xs sm:text-sm">
                        Rp {item.totalPrice.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-0.5 sm:gap-y-1 text-xs">
                    <span className="text-gray-600 text-xs">
                      Qty: {item.quantity}
                    </span>
                    <span className="text-orange-600 text-xs">
                      Used: {totalAllocated}
                    </span>
                    <span
                      className={`${
                        remainingQuantity > 0
                          ? "text-green-600"
                          : "text-red-600"
                      } font-medium text-xs`}
                    >
                      Left: {remainingQuantity}
                    </span>
                    {isFullyAllocated && (
                      <span className="text-red-500 font-bold text-xs bg-red-50 px-1.5 py-0.5 rounded">
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
                    <span className="text-xs text-gray-500">To:</span>
                    <div className="flex flex-wrap gap-1">
                      {allocatedMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-1"
                        >
                          <Avatar className="h-4 w-4 sm:h-5 sm:w-5 border border-gray-300">
                            <AvatarImage
                              src={member.user?.image || undefined}
                            />
                            <AvatarFallback className="text-xs">
                              {member.user?.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-gray-600 hidden sm:inline">
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
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <h3 className="font-medium text-sm mb-2">Bill Summary</h3>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal:</span>
            <span>Rp {bill?.subtotal?.toLocaleString() || 0}</span>
          </div>
          {bill?.discounts && bill.discounts.length > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount:</span>
              <span>
                -Rp{" "}
                {bill.discounts
                  .reduce((sum, d) => sum + Number(d.amount), 0)
                  .toLocaleString()}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Tax:</span>
            <span>Rp {bill.tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Service Charge:</span>
            <span>Rp {bill.serviceCharge.toLocaleString()}</span>
          </div>
          {bill?.additionalFees && bill.additionalFees.length > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Additional Fees:</span>
              <span>
                Rp{" "}
                {bill.additionalFees
                  .reduce((sum, f) => sum + f.amount, 0)
                  .toLocaleString()}
              </span>
            </div>
          )}
          <div className="border-t pt-1 flex justify-between font-semibold text-primary">
            <span>Total:</span>
            <span>Rp {bill?.totalAmount?.toLocaleString() || 0}</span>
          </div>
        </div>
      </div>

      {/* Send Button */}
      {!effectiveReadOnly && (
        <Button
          className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-full text-base font-medium"
          onClick={handleSaveAndSend}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Send to members"}
        </Button>
      )}
      
      {isAllocated && (
        <div className="text-center py-4 text-sm text-gray-600 bg-blue-50 rounded-lg">
          ✅ This group has been allocated. Items are shown for reference only.
        </div>
      )}
    </div>
  );
}
