import { Bill } from "../model/types";

interface BillItemsProps {
  bill: Bill;
}

export function BillItems({ bill }: BillItemsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-card rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4">Bill Items</h3>
      {/* Items List */}
      <div className="space-y-2 mb-4">
        {bill.items.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center p-2 border rounded"
          >
            <div>
              <p className="font-medium text-sm">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                {item.quantity}x @ {formatCurrency(item.unit_price)}
              </p>
            </div>
            <span className="font-medium">
              {formatCurrency(item.total_price)}
            </span>
          </div>
        ))}
      </div>

      {/* Bill Summary */}
      <div className="border-t pt-3 space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{formatCurrency(bill.subtotal)}</span>
        </div>
        {bill.service_charge > 0 && (
          <div className="flex justify-between">
            <span>Service Charge:</span>
            <span>{formatCurrency(bill.service_charge)}</span>
          </div>
        )}
        {bill.tax > 0 && (
          <div className="flex justify-between">
            <span>Tax:</span>
            <span>{formatCurrency(bill.tax)}</span>
          </div>
        )}
        <div className="flex justify-between font-semibold border-t pt-1">
          <span>Total:</span>
          <span>{formatCurrency(bill.total_amount)}</span>
        </div>
      </div>
    </div>
  );
}
