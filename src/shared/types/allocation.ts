export interface MemberAllocation {
  memberId: string;
  memberName: string;
  items: {
    itemId: string;
    itemName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  breakdown: {
    subtotal: number;
    discount: number;
    tax: number;
    serviceCharge: number;
    additionalFees: number;
    total: number;
  };
  splitConfig: {
    discount: 'proportional' | 'equal';
    tax: 'proportional' | 'equal';
    serviceCharge: 'proportional' | 'equal';
    additionalFees: 'proportional' | 'equal';
  };
}

export interface GroupAllocation {
  groupId: string;
  billId: string;
  allocations: MemberAllocation[];
  createdAt: string;
  updatedAt: string;
}