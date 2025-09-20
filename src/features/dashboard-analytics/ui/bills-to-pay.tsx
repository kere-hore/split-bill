"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { CreditCard } from "lucide-react";
import Link from "next/link";
import type { BillsToPay } from "@/shared/api/contract/dashboard/types";

interface BillsToPayProps {
  bills: BillsToPay[];
  upcomingPayments: number;
}

export function BillsToPayCard({ bills, upcomingPayments }: BillsToPayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Bills to Pay
          {upcomingPayments > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {upcomingPayments}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {bills.length ? (
            bills.slice(0, 3).map((bill) => (
              <div key={bill.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium">{bill.merchantName}</p>
                  <p className="text-xs text-muted-foreground">{bill.billDate}</p>
                </div>
                <Badge variant="outline" className="text-orange-600">
                  Rp {bill.amount.toLocaleString()}
                </Badge>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No pending payments</p>
          )}
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href="/bills-to-pay">View All Bills</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}