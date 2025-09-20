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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bill details...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600 mb-4">❌ {error || "Bill not found"}</p>
            <p className="text-gray-600 text-sm">
              This bill link may be invalid or the group doesn't exist.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { group, bill, members, allocation } = data;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Receipt className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
          </div>
          <p className="text-gray-600 mb-2">
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
          {/* Bill Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Bill Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bill.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity}x @ Rp{" "}
                          {item.unitPrice.toLocaleString()}
                        </p>
                      </div>
                      <p className="font-semibold">
                        Rp {item.totalPrice.toLocaleString()}
                      </p>
                    </div>
                  ))}
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>Rp {bill.subtotal.toLocaleString()}</span>
                    </div>
                    {bill.discounts.map((discount) => (
                      <div
                        key={discount.id}
                        className="flex justify-between text-green-600"
                      >
                        <span>{discount.name}</span>
                        <span>-Rp {discount.amount.toLocaleString()}</span>
                      </div>
                    ))}
                    {bill.tax > 0 && (
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span>Rp {bill.tax.toLocaleString()}</span>
                      </div>
                    )}
                    {bill.serviceCharge > 0 && (
                      <div className="flex justify-between">
                        <span>Service Charge</span>
                        <span>Rp {bill.serviceCharge.toLocaleString()}</span>
                      </div>
                    )}
                    {bill.additionalFees.map((fee) => (
                      <div key={fee.id} className="flex justify-between">
                        <span>{fee.name}</span>
                        <span>Rp {fee.amount.toLocaleString()}</span>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">
                        Rp {bill.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Members */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Members ({members.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {members.map((member) => {
                    const memberAllocation = allocation?.allocations.find(
                      (a) => a.memberId === member.id
                    );
                    const hasAllocation =
                      memberAllocation && memberAllocation.breakdown.total > 0;

                    return (
                      <div
                        key={member.id}
                        className={`flex items-center gap-3 ${
                          hasAllocation
                            ? "cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                            : "p-2"
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
                            <span className="ml-auto text-xs font-medium text-primary">
                              Rp{" "}
                              {memberAllocation.breakdown.total.toLocaleString()}
                            </span>
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
                            Rp{" "}
                            {memberAllocation.breakdown.total.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    <Separator className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span>Total Outstanding</span>
                      <span className="text-red-600">
                        Rp{" "}
                        {allocation.allocations
                          .reduce((sum, a) => sum + a.breakdown.total, 0)
                          .toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

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
          </div>
        </div>
      </div>
    </div>
  );
}
