import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { PublicAllocation } from "@/shared/api/contract/public-bills";
import { formatCurrency } from "@/shared/lib/currency";

interface PublicBillAllocationDetailsProps {
  allocations: PublicAllocation[];
}

export function PublicBillAllocationDetails({ allocations }: PublicBillAllocationDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bill Allocation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {allocations.map((alloc) => (
            <div
              key={alloc.memberId}
              className="border rounded-lg p-4 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">{alloc.memberName}</h4>
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(alloc.breakdown.total)}
                </span>
              </div>

              {/* Items */}
              {alloc.items.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-medium mb-2">Items:</p>
                  <div className="space-y-1">
                    {alloc.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between text-sm text-gray-600 dark:text-gray-400"
                      >
                        <span>
                          {item.itemName} x{item.quantity}
                        </span>
                        <span>{formatCurrency(item.totalPrice)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Breakdown */}
              <div className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(alloc.breakdown.subtotal)}</span>
                </div>
                {alloc.breakdown.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-{formatCurrency(alloc.breakdown.discount)}</span>
                  </div>
                )}
                {alloc.breakdown.tax > 0 && (
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>{formatCurrency(alloc.breakdown.tax)}</span>
                  </div>
                )}
                {alloc.breakdown.serviceCharge > 0 && (
                  <div className="flex justify-between">
                    <span>Service:</span>
                    <span>{formatCurrency(alloc.breakdown.serviceCharge)}</span>
                  </div>
                )}
                {alloc.breakdown.additionalFees > 0 && (
                  <div className="flex justify-between">
                    <span>Additional Fees:</span>
                    <span>{formatCurrency(alloc.breakdown.additionalFees)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}