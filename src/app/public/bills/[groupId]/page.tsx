"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Share2, Receipt, Users } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/shared/lib/currency";

interface PublicBillData {
  group: {
    id: string;
    name: string;
    description?: string;
    status: string;
    createdAt: string;
    createdBy: string;
  };
  bill: {
    id: string;
    merchantName: string;
    receiptNumber?: string;
    date: string;
    subtotal: number;
    tax: number;
    serviceCharge: number;
    totalAmount: number;
    items: Array<{
      id: string;
      name: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
    discounts: Array<{
      id: string;
      name: string;
      amount: number;
    }>;
    additionalFees: Array<{
      id: string;
      name: string;
      amount: number;
    }>;
  };
  members: Array<{
    id: string;
    name: string;
    user?: {
      image?: string;
    };
  }>;
  allocation?: {
    allocations: Array<{
      memberId: string;
      memberName: string;
      breakdown: {
        subtotal: number;
        discount: number;
        tax: number;
        serviceCharge: number;
        additionalFees: number;
        total: number;
      };
      items: Array<{
        itemName: string;
        quantity: number;
        totalPrice: number;
      }>;
    }>;
  };
}

export default function PublicBillPage() {
  const params = useParams();
  const [data, setData] = useState<PublicBillData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBill = async () => {
      try {
        const response = await fetch(`/api/public/bills/${params.groupId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch bill data");
        }

        const result = await response.json();
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    if (params.groupId) {
      fetchBill();
    }
  }, [params.groupId]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${data?.group.name} - Bill Split`,
          text: `Check out the bill breakdown for ${data?.group.name}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading bill details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">
              ❌ {error || "Bill not found"}
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              This bill link may be invalid or the group doesn&apos;t exist.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { group, bill, members, allocation } = data;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Receipt className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {group.name}
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            {bill.merchantName} •{" "}
            {new Date(bill.date).toLocaleDateString("id-ID")}
          </p>
          <div className="flex items-center justify-center gap-4">
            <Badge
              variant={group.status === "allocated" ? "default" : "secondary"}
            >
              {group.status}
            </Badge>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Receipt Style Bill */}
          <div className="lg:col-span-1">
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

              {/* Receipt Footer */}
              <div className="text-center mt-4 pt-3 border-t dark:border-gray-600 text-xs text-gray-500 dark:text-gray-400">
                <p>Thank you for your visit!</p>
                <p className="mt-2">Split Bill - {group.name}</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            {/* Group Info */}
            <Card>
              <CardHeader>
                <CardTitle>Group Info</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div>
                  <span className="text-gray-600">Created by:</span>
                  <p className="font-medium">{group.createdBy}</p>
                </div>
                <div>
                  <span className="text-gray-600">Created:</span>
                  <p>{new Date(group.createdAt).toLocaleDateString("id-ID")}</p>
                </div>
                {group.description && (
                  <div>
                    <span className="text-gray-600">Description:</span>
                    <p>{group.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Members */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Members ({members.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2">
                  {members.map((member) => {
                    const memberAllocation = allocation?.allocations.find(
                      (a) => a.memberId === member.id
                    );
                    const hasAllocation =
                      memberAllocation && memberAllocation.breakdown.total > 0;

                    return (
                      <div
                        key={member.id}
                        className={`col-span-1 flex items-center gap-3 ${
                          hasAllocation
                            ? "cursor-pointer hover:bg-gray-50 p-1 rounded-lg transition-colors"
                            : "p-1"
                        }`}
                      >
                        {hasAllocation ? (
                          <Link
                            href={`/public/allocations/${group.id}/${member.id}`}
                            className="flex items-center gap-3 w-full"
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={member.user?.image} />
                              <AvatarFallback className="text-xs">
                                {member.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{member.name}</span>
                          </Link>
                        ) : (
                          <>
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={member.user?.image} />
                              <AvatarFallback className="text-xs">
                                {member.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{member.name}</span>
                            <span className="ml-auto text-xs text-gray-400">
                              No allocation
                            </span>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Settlement Summary */}
            {allocation && (
              <Card>
                <CardHeader>
                  <CardTitle>Settlement Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-2">
                    <p className="text-gray-600 mb-3">
                      Who owes what to {group.createdBy}:
                    </p>
                    {allocation.allocations
                      .filter((a) => a.breakdown.total > 0)
                      .map((memberAllocation) => (
                        <div
                          key={memberAllocation.memberId}
                          className="flex justify-between items-center py-1"
                        >
                          <span>{memberAllocation.memberName}</span>
                          <span className="font-medium text-red-600">
                            {formatCurrency(memberAllocation.breakdown.total)}
                          </span>
                        </div>
                      ))}
                    <Separator className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span>Total Outstanding</span>
                      <span className="text-red-600">
                        {formatCurrency(
                          allocation.allocations.reduce(
                            (sum, a) => sum + a.breakdown.total,
                            0
                          )
                        )}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
