import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Check, Clock } from "lucide-react";
import { BillToPay } from "@/shared/api/contract/bills-to-pay";

interface BillToPayItemProps {
  bill: BillToPay;
  onStatusUpdate: (billId: string, status: string) => void;
  isUpdating: boolean;
}

export function BillToPayItem({
  bill,
  onStatusUpdate,
  isUpdating,
}: BillToPayItemProps) {
  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-3 sm:p-4">
        {/* Mobile Layout */}
        <div className="flex flex-col gap-2 sm:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="font-medium text-sm truncate">
                {bill.merchantName}
              </span>
              <Badge
                variant={bill.status === "paid" ? "default" : "secondary"}
                className={`text-xs flex-shrink-0 ${
                  bill.status === "paid"
                    ? "bg-green-100 text-green-800 border-green-200"
                    : "bg-orange-100 text-orange-800 border-orange-200"
                }`}
              >
                {bill.status === "paid" ? (
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
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Pay to: {bill.receiver.name}
            </div>
            <span className="font-semibold text-sm">
              Rp {bill.amount.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">{bill.billDate}</div>
            {bill.status === "pending" ? (
              <Button
                size="sm"
                onClick={() => onStatusUpdate(bill.id, "paid")}
                disabled={isUpdating}
                className="bg-green-600 hover:bg-green-700 h-7 px-2 text-xs"
              >
                <Check className="w-3 h-3 mr-1" /> Mark Paid
              </Button>
            ) : (
              <Badge className="bg-green-100 text-green-800 border-green-200 h-7 px-2 text-xs">
                <Check className="w-3 h-3 mr-1" /> Paid
              </Badge>
            )}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:block">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">{bill.merchantName}</span>
              <Badge
                variant={bill.status === "paid" ? "default" : "secondary"}
                className={`flex-shrink-0 ${
                  bill.status === "paid"
                    ? "bg-green-100 text-green-800 border-green-200"
                    : "bg-orange-100 text-orange-800 border-orange-200"
                }`}
              >
                {bill.status === "paid" ? (
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
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Pay to: {bill.receiver.name} • {bill.billDate}
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold">
                Rp {bill.amount.toLocaleString()}
              </span>
              {bill.status === "pending" ? (
                <Button
                  size="sm"
                  onClick={() => onStatusUpdate(bill.id, "paid")}
                  disabled={isUpdating}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4 mr-1" /> Mark Paid
                </Button>
              ) : (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <Check className="w-4 h-4 mr-1" /> Paid
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
