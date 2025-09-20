"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Bill, BillItem, GroupMember } from "@/entities/group/model/types";
import {
  SplitConfig,
  ItemAllocation,
  MemberAllocation,
  useSaveAllocations,
} from "@/entities/allocation";

export function useAllocationLogic(
  bill: Bill,
  members: GroupMember[],
  groupId: string
) {
  const router = useRouter();
  const saveAllocationsMutation = useSaveAllocations(groupId);
  const [allocations, setAllocations] = useState<
    Record<string, ItemAllocation>
  >({});
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [splitConfig, setSplitConfig] = useState<SplitConfig>({
    tax: "proportional",
    serviceCharge: "proportional",
    discount: "proportional",
    additionalFees: "equal",
  });

  const billItems = bill?.items || [];

  const handleMemberSelect = (memberId: string) => {
    setSelectedMember(selectedMember === memberId ? null : memberId);
  };

  const getTotalAllocatedQuantity = (
    itemId: string,
    excludeMemberId?: string
  ) => {
    const allocation = allocations[itemId];
    if (!allocation) return 0;

    return Object.entries(allocation.memberAllocations)
      .filter(([memberId]) => memberId !== excludeMemberId)
      .reduce((total, [, quantity]) => total + quantity, 0);
  };

  const handleItemToggle = (itemId: string, checked: boolean) => {
    if (!selectedMember) return;

    const item = billItems.find((item) => item.id === itemId);
    if (!item) return;

    setAllocations((prev) => {
      const current = prev[itemId] || { itemId, memberAllocations: {} };
      const newMemberAllocations = { ...current.memberAllocations };
      const currentMemberAllocation = newMemberAllocations[selectedMember] || 0;

      if (checked) {
        // Check if adding one more allocation would exceed the item quantity
        const totalAllocated = getTotalAllocatedQuantity(
          itemId,
          selectedMember
        );
        if (totalAllocated + currentMemberAllocation + 1 > item.quantity) {
          toast.error(
            `Cannot allocate more than ${item.quantity} ${item.name}`
          );
          return prev;
        }
        newMemberAllocations[selectedMember] = currentMemberAllocation + 1;
      } else {
        if (currentMemberAllocation > 0) {
          newMemberAllocations[selectedMember] = currentMemberAllocation - 1;
          if (newMemberAllocations[selectedMember] === 0) {
            delete newMemberAllocations[selectedMember];
          }
        }
      }

      return {
        ...prev,
        [itemId]: { ...current, memberAllocations: newMemberAllocations },
      };
    });
  };

  const isItemAllocatedToMember = (itemId: string, memberId: string) => {
    const allocation = allocations[itemId];
    return allocation?.memberAllocations[memberId] > 0;
  };

  const getMemberSubtotal = (memberId: string) => {
    return (
      billItems?.reduce((total: number, item: BillItem) => {
        const allocation = allocations[item.id];
        if (allocation?.memberAllocations[memberId]) {
          return (
            total + item.unitPrice * allocation.memberAllocations[memberId]
          );
        }
        return total;
      }, 0) || 0
    );
  };

  const getMemberBreakdown = (memberId: string) => {
    const memberSubtotal = getMemberSubtotal(memberId);
    const totalSubtotal = bill?.subtotal || 0;

    if (memberSubtotal === 0 || totalSubtotal === 0) {
      return {
        subtotal: 0,
        discount: 0,
        tax: 0,
        serviceCharge: 0,
        additionalFees: 0,
        total: 0,
      };
    }

    const memberRatio = memberSubtotal / totalSubtotal;

    const totalDiscounts =
      bill?.discounts?.reduce((sum, d) => sum + d.amount, 0) || 0;
    const totalFees =
      bill?.additionalFees?.reduce((sum, f) => sum + f.amount, 0) || 0;

    const memberDiscount = totalDiscounts * memberRatio;
    const memberTax = (bill?.tax || 0) * memberRatio;
    const memberServiceCharge = (bill?.serviceCharge || 0) * memberRatio;
    const memberAdditionalFees = totalFees * memberRatio;

    const memberTotal =
      memberSubtotal -
      memberDiscount +
      memberTax +
      memberServiceCharge +
      memberAdditionalFees;

    return {
      subtotal: memberSubtotal,
      discount: memberDiscount,
      tax: memberTax,
      serviceCharge: memberServiceCharge,
      additionalFees: memberAdditionalFees,
      total: Math.max(0, memberTotal),
    };
  };

  const handleSaveAndSend = async () => {
    const allocationData: MemberAllocation[] = members
      .map((member) => {
        const memberSubtotal = getMemberSubtotal(member.id);
        if (memberSubtotal === 0) return null;

        const memberItems = billItems
          .filter((item: BillItem) =>
            isItemAllocatedToMember(item.id, member.id)
          )
          .map((item: BillItem) => ({
            itemId: item.id,
            itemName: item.name,
            quantity: allocations[item.id]?.memberAllocations[member.id] || 0,
            unitPrice: item.unitPrice,
            totalPrice:
              item.unitPrice *
              (allocations[item.id]?.memberAllocations[member.id] || 0),
          }));

        return {
          memberId: member.id,
          memberName: member.user.name,
          items: memberItems,
          breakdown: {
            subtotal: memberSubtotal,
            discount: 0,
            tax: 0,
            serviceCharge: 0,
            additionalFees: 0,
            total: memberSubtotal,
          },
          splitConfig,
        };
      })
      .filter(Boolean) as MemberAllocation[];

    saveAllocationsMutation.mutate(
      {
        allocations: allocationData,
        billId: bill?.id,
      },
      {
        onSuccess: () => {
          toast.success("Allocations saved successfully!");
          router.push(`/public/bills/${groupId}`);
        },
        onError: () => {
          toast.error("Failed to save allocations");
        },
      }
    );
  };

  return {
    allocations,
    selectedMember,
    isLoading: saveAllocationsMutation.isPending,
    splitConfig,
    setSplitConfig,
    handleMemberSelect,
    handleItemToggle,
    isItemAllocatedToMember,
    getMemberSubtotal,
    getMemberBreakdown,
    handleSaveAndSend,
    getTotalAllocatedQuantity,
  };
}
