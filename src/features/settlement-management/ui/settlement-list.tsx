"use client";

import { SettlementItem } from "@/entities/settlement";
import { Settlement } from "@/shared/api/contract/settlements/types";

interface SettlementListProps {
  settlements: Settlement[];
  onStatusUpdate: (settlementId: string, status: string) => void;
  isUpdating: boolean;
}

export function SettlementList({ settlements, onStatusUpdate, isUpdating }: SettlementListProps) {
  if (settlements.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No settlements found for this group.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {settlements.map((settlement) => (
        <SettlementItem
          key={settlement.id}
          settlement={settlement}
          onUpdateStatus={onStatusUpdate}
          isUpdating={isUpdating}
        />
      ))}
    </div>
  );
}