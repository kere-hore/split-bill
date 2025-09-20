import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

interface PaymentSummaryProps {
  totalAmount: number;
  pendingAmount: number;
  paidAmount: number;
}

export function PaymentSummary({ totalAmount, pendingAmount, paidAmount }: PaymentSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total Amount</span>
          <span className="font-semibold">Rp {totalAmount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-orange-600">Pending</span>
          <span className="font-semibold text-orange-600">Rp {pendingAmount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-green-600">Paid</span>
          <span className="font-semibold text-green-600">Rp {paidAmount.toLocaleString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}