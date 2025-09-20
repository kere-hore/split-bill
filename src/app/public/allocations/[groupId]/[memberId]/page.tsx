"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { MemberAllocation } from "@/shared/types/allocation";

interface AllocationData {
  group: {
    id: string;
    name: string;
    status: string;
  };
  member: MemberAllocation;
  createdAt: string;
  updatedAt: string;
}

export default function PublicAllocationPage() {
  const params = useParams();
  const [data, setData] = useState<AllocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllocation = async () => {
      try {
        const response = await fetch(
          `/api/public/allocations/${params.groupId}/${params.memberId}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch allocation data');
        }
        
        const result = await response.json();
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (params.groupId && params.memberId) {
      fetchAllocation();
    }
  }, [params.groupId, params.memberId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your bill breakdown...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600 mb-4">❌ {error || 'Allocation not found'}</p>
            <p className="text-gray-600 text-sm">
              This allocation link may be invalid or expired.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { group, member } = data;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Bill Breakdown
          </h1>
          <p className="text-gray-600">
            {group.name} • {member.memberName}
          </p>
          <Badge variant="secondary" className="mt-2">
            {group.status}
          </Badge>
        </div>

        {/* Member Items */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Your Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {member.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.itemName}</p>
                    <p className="text-sm text-gray-600">
                      {item.quantity}x @ Rp {item.unitPrice.toLocaleString()}
                    </p>
                  </div>
                  <p className="font-semibold">
                    Rp {item.totalPrice.toLocaleString()}
                  </p>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between items-center font-semibold">
                <span>Items Subtotal</span>
                <span>Rp {member.breakdown.subtotal.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Breakdown */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Items Subtotal</span>
                <span>Rp {member.breakdown.subtotal.toLocaleString()}</span>
              </div>
              
              {member.breakdown.discount > 0 && (
                <div className="flex justify-between items-center text-green-600">
                  <span>
                    Discount ({member.splitConfig.discount})
                  </span>
                  <span>-Rp {member.breakdown.discount.toLocaleString()}</span>
                </div>
              )}
              
              {member.breakdown.tax > 0 && (
                <div className="flex justify-between items-center">
                  <span>
                    Tax ({member.splitConfig.tax})
                  </span>
                  <span>Rp {member.breakdown.tax.toLocaleString()}</span>
                </div>
              )}
              
              {member.breakdown.serviceCharge > 0 && (
                <div className="flex justify-between items-center">
                  <span>
                    Service Charge ({member.splitConfig.serviceCharge})
                  </span>
                  <span>Rp {member.breakdown.serviceCharge.toLocaleString()}</span>
                </div>
              )}
              
              {member.breakdown.additionalFees > 0 && (
                <div className="flex justify-between items-center">
                  <span>
                    Additional Fees ({member.splitConfig.additionalFees})
                  </span>
                  <span>Rp {member.breakdown.additionalFees.toLocaleString()}</span>
                </div>
              )}
              
              <Separator />
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Amount</span>
                <span className="text-primary">
                  Rp {member.breakdown.total.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Split Method Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Split Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• <strong>Proportional:</strong> Split based on your item consumption</p>
              <p>• <strong>Equal:</strong> Split equally among all members</p>
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-gray-500">
                  Generated on {new Date(data.createdAt).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}