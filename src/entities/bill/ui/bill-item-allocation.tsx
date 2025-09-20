import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";

interface BillItem {
  id: string;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface GroupMember {
  id: string;
  name: string;
  role: string;
}

interface BillItemAllocationProps {
  item: BillItem;
  members: GroupMember[];
  allocations: { [memberId: string]: number };
  onAllocationChange: (itemId: string, memberId: string, quantity: number) => void;
}

export function BillItemAllocation({ 
  item, 
  members, 
  allocations, 
  onAllocationChange 
}: BillItemAllocationProps) {
  const totalAllocated = Object.values(allocations).reduce((sum, qty) => sum + qty, 0);
  const remaining = item.quantity - totalAllocated;

  return (
    <div className="space-y-3 p-3 border rounded-lg">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-medium text-sm">{item.name}</div>
          <div className="text-xs text-muted-foreground">
            {item.unit_price.toLocaleString()} each
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium">
            Available: {item.quantity}
          </div>
          <Badge variant={remaining === 0 ? "default" : "secondary"}>
            Remaining: {remaining}
          </Badge>
        </div>
      </div>
      
      <div className="space-y-2">
        {members.map(member => (
          <div key={member.id} className="flex items-center justify-between">
            <span className="text-sm">{member.name}</span>
            <Input
              type="number"
              min="0"
              max={item.quantity}
              value={allocations[member.id] || 0}
              onChange={(e) => onAllocationChange(item.id, member.id, parseInt(e.target.value) || 0)}
              className="w-20 h-8"
            />
          </div>
        ))}
      </div>
    </div>
  );
}