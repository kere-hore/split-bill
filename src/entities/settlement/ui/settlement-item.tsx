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
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        {/* Mobile Layout */}
        <div className="flex flex-col gap-3 sm:hidden">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="font-medium text-base truncate mb-1">
                {settlement.payer.name}
              </div>
              <div className="font-semibold text-lg text-primary">
                Rp {Number(settlement.amount).toLocaleString()}
              </div>
            </div>
            <Badge
              variant={settlement.status === "paid" ? "default" : "secondary"}
              className={`ml-2 flex-shrink-0 ${
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
                  ? "bg-green-600 hover:bg-green-700 w-full h-9"
                  : "border-orange-200 text-orange-600 hover:bg-orange-50 w-full h-9"
              }
              variant={settlement.status === "pending" ? "default" : "outline"}
            >
              {settlement.status === "pending" ? (
                <>
                  <Check className="w-4 h-4 mr-2" /> Mark as Paid
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 mr-2" /> Mark as Pending
                </>
              )}
            </Button>
          )}
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="font-medium text-base">
                {settlement.payer.name}
              </span>
              <span className="font-semibold text-lg text-primary">
                Rp {Number(settlement.amount).toLocaleString()}
              </span>
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
                  <Check className="w-4 h-4 mr-1" /> Paid
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 mr-1" /> Pending
                </>
              )}
            </Badge>
          </div>
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
              variant={settlement.status === "pending" ? "default" : "outline"}
            >
              {settlement.status === "pending" ? (
                <>
                  <Check className="w-4 h-4 mr-2" /> Mark as Paid
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 mr-2" /> Mark as Pending
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
