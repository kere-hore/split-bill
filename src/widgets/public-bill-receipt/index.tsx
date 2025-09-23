"use client";

import { PublicBill } from "@/shared/api/contract/public-bills";
import { formatCurrency } from "@/shared/lib/currency";

interface PublicBillReceiptProps {
  bill: PublicBill;
}

export function PublicBillReceipt({ bill }: PublicBillReceiptProps) {
  return (
    <div className="max-w-sm mx-auto bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg p-4 font-mono text-sm shadow-lg">
      {/* Receipt Header */}
      <div className="text-center border-b dark:border-gray-700 pb-3 mb-4">
        <h2 className="font-bold text-md dark:text-white">
          {bill.merchantName}
        </h2>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {new Date(bill.date).toLocaleDateString("id-ID")}
        </p>
        {bill.receiptNumber && (
          <p className="text-xs text-gray-600 dark:text-gray-400">
            #{bill.receiptNumber}
          </p>
        )}
      </div>

      {/* Items */}
      <div className="space-y-1 mb-4">
        {bill.items.map((item) => (
          <div key={item.id}>
            <div className="flex justify-between">
              <span className="text-xs dark:text-gray-300">
                {item.name}
              </span>
            </div>
            <div className="flex justify-between text-xs dark:text-gray-300">
              <span>
                {item.quantity} x {formatCurrency(item.unitPrice)}
              </span>
              <span>{formatCurrency(item.totalPrice)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Separator */}
      <div className="border-t border-dashed dark:border-gray-600 my-3"></div>

      {/* Totals */}
      <div className="space-y-1 text-xs dark:text-gray-300">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{formatCurrency(bill.subtotal)}</span>
        </div>

        {bill.discounts.map((discount) => (
          <div
            key={discount.id}
            className="flex justify-between text-green-600 dark:text-green-400"
          >
            <span>{discount.name}:</span>
            <span>-{formatCurrency(discount.amount)}</span>
          </div>
        ))}

        {bill.tax > 0 && (
          <div className="flex justify-between">
            <span>Tax:</span>
            <span>{formatCurrency(bill.tax)}</span>
          </div>
        )}

        {bill.serviceCharge > 0 && (
          <div className="flex justify-between">
            <span>Service:</span>
            <span>{formatCurrency(bill.serviceCharge)}</span>
          </div>
        )}

        {bill.additionalFees.map((fee) => (
          <div key={fee.id} className="flex justify-between">
            <span>{fee.name}:</span>
            <span>{formatCurrency(fee.amount)}</span>
          </div>
        ))}
      </div>

      {/* Final Total */}
      <div className="border-t border-dashed dark:border-gray-600 my-3"></div>
      <div className="flex justify-between text-sm font-bold dark:text-white">
        <span>TOTAL:</span>
        <span>{formatCurrency(bill.totalAmount)}</span>
      </div>
    </div>
  );
}