"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Users, Calculator, Send } from "lucide-react";
import { BillItemAllocation } from "@/entities/bill";

interface BillItem {
  id: string;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface BillDiscount {
  id: string;
  name: string;
  amount: number;
  type: string;
}

interface BillFee {
  id: string;
  name: string;
  amount: number;
}

interface GroupMember {
  id: string;
  name: string;
  role: string;
}

interface BillData {
  id: string;
  merchant_name: string;
  date: string;
  items: BillItem[];
  discounts: BillDiscount[];
  service_charge: number;
  tax: number;
  additional_fees: BillFee[];
  subtotal: number;
  total_amount: number;
}

interface ItemAllocation {
  [itemId: string]: {
    [memberId: string]: number;
  };
}

interface BillAllocationProps {
  billData: BillData;
  members: GroupMember[];
  onSendToMembers: (allocations: ItemAllocation) => void;
  isLoading?: boolean;
}

export function BillAllocation({
  billData,
  members,
  onSendToMembers,
  isLoading = false,
}: BillAllocationProps) {
  const [allocations, setAllocations] = useState<ItemAllocation>({});

  useEffect(() => {
    const initialAllocations: ItemAllocation = {};
    billData.items.forEach(item => {
      initialAllocations[item.id] = {};
      members.forEach(member => {
        initialAllocations[item.id][member.id] = 0;
      });
    });
    setAllocations(initialAllocations);
  }, [billData.items, members]);

  const updateAllocation = (itemId: string, memberId: string, quantity: number) => {
    setAllocations(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [memberId]: Math.max(0, quantity),
      },
    }));
  };

  const memberTotals = useMemo(() => {
    const totals: { [memberId: string]: number } = {};
    
    members.forEach(member => {
      let memberTotal = 0;
      
      billData.items.forEach(item => {
        const memberQuantity = allocations[item.id]?.[member.id] || 0;
        memberTotal += memberQuantity * item.unit_price;
      });
      
      const itemsSubtotal = billData.items.reduce((sum, item) => sum + item.total_price, 0);
      if (itemsSubtotal > 0) {
        const memberItemsTotal = billData.items.reduce((sum, item) => {
          const memberQuantity = allocations[item.id]?.[member.id] || 0;
          return sum + (memberQuantity * item.unit_price);
        }, 0);
        
        const memberRatio = memberItemsTotal / itemsSubtotal;
        
        const totalDiscounts = billData.discounts.reduce((sum, d) => sum + d.amount, 0);
        memberTotal -= totalDiscounts * memberRatio;
        
        memberTotal += billData.service_charge * memberRatio;
        memberTotal += billData.tax * memberRatio;
        
        const totalFees = billData.additional_fees.reduce((sum, f) => sum + f.amount, 0);
        memberTotal += totalFees * memberRatio;
      }
      
      totals[member.id] = Math.max(0, memberTotal);
    });
    
    return totals;
  }, [allocations, billData, members]);

  const isFullyAllocated = useMemo(() => {
    return billData.items.every(item => {
      const totalAllocated = Object.values(allocations[item.id] || {}).reduce((sum, qty) => sum + qty, 0);
      return totalAllocated === item.quantity;
    });
  }, [allocations, billData.items]);

  const handleSendToMembers = () => {
    onSendToMembers(allocations);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Cost Allocation - {billData.merchant_name}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Allocate items to group members before sending
          </p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bill Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <div className="font-medium">{billData.merchant_name}</div>
              <div className="text-muted-foreground">{billData.date}</div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <div className="font-medium text-sm">Items:</div>
              {billData.items.map(item => (
                <div key={item.id} className="text-xs space-y-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-muted-foreground">
                    {item.quantity}x @ {item.unit_price.toLocaleString()} = {item.total_price.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            
            <Separator />
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{billData.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>{billData.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Service charge</span>
                <span>{billData.service_charge.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Discount</span>
                <span>{billData.discounts.reduce((sum, discount) => sum + discount.amount, 0).toLocaleString()}</span>
              </div>
              {billData.additional_fees.map(fee => (
                <div key={fee.id} className="flex justify-between text-sm">
                  <span>{fee.name}</span>
                  <span>{fee.amount.toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total amount</span>
                <span>{billData.total_amount.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              Members ({members.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {members.map(member => (
              <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium text-sm">{member.name}</div>
                  <Badge variant={member.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                    {member.role}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm">
                    {memberTotals[member.id]?.toLocaleString() || '0'}
                  </div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Item Allocation</CardTitle>
            <p className="text-sm text-muted-foreground">
              Assign quantities to each member
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {billData.items.map(item => (
              <BillItemAllocation
                key={item.id}
                item={item}
                members={members}
                allocations={allocations[item.id] || {}}
                onAllocationChange={updateAllocation}
              />
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={handleSendToMembers}
            disabled={!isFullyAllocated || isLoading}
            className="w-full h-12 text-base"
          >
            <Send className="h-5 w-5 mr-2" />
            {isLoading ? 'Sending...' : 'Send to Members'}
          </Button>
          {!isFullyAllocated && (
            <p className="text-sm text-orange-600 text-center mt-2">
              Please allocate all items before sending
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}