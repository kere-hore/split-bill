import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Check, Clock } from "lucide-react";
import { Settlement } from "@/shared/api/contract/settlements/types";

interface SettlementItemProps {
  settlement: Settlement;
  onUpdateStatus?: (settlementId: string, status: string) => void;
  isUpdating?: boolean;
}

export function SettlementItem({
  settlement,
  onUpdateStatus,
  isUpdating,
}: SettlementItemProps) {
  return (
    <Card className="hover:shadow-sm transition-shadow p-3">
      <CardContent className="p-1 sm:p-2">
        {/* Mobile Layout */}
        <div className="flex flex-col gap-2 sm:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="font-medium text-sm truncate">
                {settlement.payer.name}
              </span>
            </div>
            <Badge
              variant={settlement.status === "paid" ? "default" : "secondary"}
              className={`text-xs flex-shrink-0 ${
                settlement.status === "paid"
                  ? "bg-green-100 text-green-800 border-green-200"
                  : "bg-orange-100 text-orange-800 border-orange-200"
              }`}
            >
              {settlement.status === "paid" ? (
                <>
                  <Check className="w-3 h-3 mr-1" /> Paid
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3 mr-1" /> Pending
                </>
              )}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm">
              Rp {Number(settlement.amount).toLocaleString()}
            </span>
            {onUpdateStatus && (
              <Button
                size="sm"
                onClick={() =>
                  onUpdateStatus(
                    settlement.id,
                    settlement.status === "pending" ? "paid" : "pending"
                  )
                }
                disabled={isUpdating}
                className={
                  settlement.status === "pending"
                    ? "bg-green-600 hover:bg-green-700 h-7 px-2 text-xs"
                    : "border-orange-200 text-orange-600 hover:bg-orange-50 h-7 px-2 text-xs"
                }
                variant={
                  settlement.status === "pending" ? "default" : "outline"
                }
              >
                {settlement.status === "pending" ? (
                  <>
                    <Check className="w-3 h-3 mr-1" /> Mark Paid
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3 mr-1" /> Mark Pending
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:block">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">{settlement.payer.name}</span>
            </div>
            <Badge
              variant={settlement.status === "paid" ? "default" : "secondary"}
              className={
                settlement.status === "paid"
                  ? "bg-green-100 text-green-800 border-green-200"
                  : "bg-orange-100 text-orange-800 border-orange-200"
              }
            >
              {settlement.status === "paid" ? (
                <>
                  <Check className="w-3 h-3 mr-1" /> Paid
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3 mr-1" /> Pending
                </>
              )}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold">
              Rp {Number(settlement.amount).toLocaleString()}
            </span>
            {onUpdateStatus && (
              <Button
                size="sm"
                onClick={() =>
                  onUpdateStatus(
                    settlement.id,
                    settlement.status === "pending" ? "paid" : "pending"
                  )
                }
                disabled={isUpdating}
                className={
                  settlement.status === "pending"
                    ? "bg-green-600 hover:bg-green-700"
                    : "border-orange-200 text-orange-600 hover:bg-orange-50"
                }
                variant={
                  settlement.status === "pending" ? "default" : "outline"
                }
              >
                {settlement.status === "pending" ? (
                  <>
                    <Check className="w-4 h-4 mr-1" /> Mark Paid
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 mr-1" /> Mark Pending
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
