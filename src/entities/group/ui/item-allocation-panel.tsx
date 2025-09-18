"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Users, DollarSign } from "lucide-react";
import { BillItem, GroupMember } from "../model/types";

interface ItemAllocation {
  itemId: string;
  memberAllocations: Record<string, number>; // memberId -> quantity consumed
}

interface ItemAllocationPanelProps {
  billItems: BillItem[];
  members: GroupMember[];
  groupId: string;
}

export function ItemAllocationPanel({ billItems, members, groupId }: ItemAllocationPanelProps) {
  const [allocations, setAllocations] = useState<Record<string, ItemAllocation>>({});
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  const handleMemberSelect = (memberId: string) => {
    setSelectedMember(selectedMember === memberId ? null : memberId);
  };

  const handleItemToggle = (itemId: string, checked: boolean) => {
    if (!selectedMember) return;
    
    setAllocations(prev => {
      const current = prev[itemId] || {
        itemId,
        memberAllocations: {},
      };

      const newMemberAllocations = { ...current.memberAllocations };
      
      if (checked) {
        // Add 1 quantity for selected member
        newMemberAllocations[selectedMember] = (newMemberAllocations[selectedMember] || 0) + 1;
      } else {
        // Remove allocation for selected member
        delete newMemberAllocations[selectedMember];
      }

      return {
        ...prev,
        [itemId]: {
          ...current,
          memberAllocations: newMemberAllocations,
        },
      };
    });
  };

  const getItem = (itemId: string) => {
    return billItems.find(i => i.id === itemId);
  };

  const isItemAllocatedToMember = (itemId: string, memberId: string) => {
    const allocation = allocations[itemId];
    return allocation?.memberAllocations[memberId] > 0;
  };

  const getTotalAllocatedQuantity = (itemId: string) => {
    const allocation = allocations[itemId];
    if (!allocation) return 0;
    
    return Object.values(allocation.memberAllocations).reduce((sum, qty) => sum + qty, 0);
  };

  const getRemainingQuantity = (itemId: string) => {
    const item = getItem(itemId);
    if (!item) return 0;
    
    return item.quantity - getTotalAllocatedQuantity(itemId);
  };

  const canAllocateItem = (itemId: string) => {
    return getRemainingQuantity(itemId) > 0;
  };

  const getMemberItemCount = (memberId: string) => {
    return billItems.filter(item => isItemAllocatedToMember(item.id, memberId)).length;
  };

  const getMemberTotal = (memberId: string) => {
    return billItems.reduce((total, item) => {
      const allocation = allocations[item.id];
      if (allocation?.memberAllocations[memberId]) {
        return total + (item.unit_price * allocation.memberAllocations[memberId]);
      }
      return total;
    }, 0);
  };

  return (
    <div className="space-y-4">
      {/* Members Row - Clickable */}
      <div className="flex justify-center gap-4 mb-6">
        {members.map((member) => {
          const isSelected = selectedMember === member.id;
          const itemCount = getMemberItemCount(member.id);
          const memberTotal = getMemberTotal(member.id);
          
          return (
            <div 
              key={member.id} 
              className={`flex flex-col items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                isSelected 
                  ? 'bg-primary/10 border-2 border-primary' 
                  : 'hover:bg-gray-50 border-2 border-transparent'
              }`}
              onClick={() => handleMemberSelect(member.id)}
            >
              <Avatar className={`h-12 w-12 border-2 ${
                isSelected ? 'border-primary' : 'border-gray-200'
              }`}>
                <AvatarImage src={member.user.image || undefined} />
                <AvatarFallback className="text-sm font-medium">
                  {member.user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-center max-w-[60px] truncate">
                {member.user.name}
              </span>
              {itemCount > 0 && (
                <div className="text-xs text-center">
                  <div className="text-primary font-medium">{itemCount} items</div>
                  <div className="text-gray-500">Rp {memberTotal.toLocaleString()}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-gray-500 mb-4">
        {selectedMember 
          ? `Select items consumed by ${members.find(m => m.id === selectedMember)?.user.name}`
          : "Select a member above to assign items"
        }
      </div>

      {/* Split All Equally Button */}
      <Button 
        variant="outline" 
        className="w-full mb-4 text-green-600 border-green-200 hover:bg-green-50"
        onClick={() => {
          // Auto-split all items equally among all members
          const newAllocations: Record<string, ItemAllocation> = {};
          billItems.forEach(item => {
            const memberAllocations: Record<string, number> = {};
            members.forEach(member => {
              memberAllocations[member.id] = 1; // Each member gets 1 of each item
            });
            
            newAllocations[item.id] = {
              itemId: item.id,
              memberAllocations,
            };
          });
          
          setAllocations(newAllocations);
        }}
      >
        <span className="mr-2">🌱</span>
        Split all equally
      </Button>

      {/* Items List with Checkboxes */}
      <div className="space-y-1">
        {billItems.map((item) => {
          const totalAllocated = getTotalAllocatedQuantity(item.id);
          const remainingQuantity = getRemainingQuantity(item.id);
          const isAllocatedToSelected = selectedMember ? isItemAllocatedToMember(item.id, selectedMember) : false;
          const canAllocate = canAllocateItem(item.id);
          const isFullyAllocated = totalAllocated >= item.quantity;
          
          return (
            <div key={item.id} className="border-b border-dashed border-gray-200 pb-4 mb-4 last:border-b-0">
              {/* Item with Checkbox */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={isAllocatedToSelected}
                    onCheckedChange={(checked) => {
                      // Allow unchecking even if fully allocated
                      if (!checked || canAllocate || isAllocatedToSelected) {
                        handleItemToggle(item.id, checked as boolean);
                      }
                    }}
                    disabled={!selectedMember || (!canAllocate && !isAllocatedToSelected)}
                    className={`${
                      !selectedMember || (!canAllocate && !isAllocatedToSelected) 
                        ? 'opacity-50' 
                        : ''
                    }`}
                  />
                  <div>
                    <h4 className={`font-medium text-sm ${
                      isFullyAllocated ? 'text-green-600' : ''
                    }`}>
                      {item.name}
                      {isFullyAllocated && <span className="ml-1">✓</span>}
                    </h4>
                    <p className="text-xs text-gray-500">
                      x{item.quantity}
                      {totalAllocated > 0 && (
                        <span className={`ml-2 ${
                          isFullyAllocated ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          ({totalAllocated} allocated{remainingQuantity > 0 ? `, ${remainingQuantity} left` : ''})
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{item.total_price.toLocaleString()}</div>
                  {!canAllocate && !isAllocatedToSelected && (
                    <div className="text-xs text-red-500">
                      Fully allocated
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>{billItems.reduce((sum, item) => sum + item.total_price, 0).toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Tax</span>
          <span>0</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Service charge</span>
          <span>0</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Discount</span>
          <span>0</span>
        </div>
        <div className="border-t pt-2 flex justify-between font-semibold">
          <span>Total amount</span>
          <span>{billItems.reduce((sum, item) => sum + item.total_price, 0).toLocaleString()}</span>
        </div>
      </div>

      {/* Send Button */}
      <Button className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-full text-base font-medium">
        Send to members
      </Button>
    </div>
  );
}