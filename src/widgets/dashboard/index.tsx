"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { 
  Plus, 
  Receipt, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  CreditCard
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function DashboardWidget() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const response = await axios.get("/api/dashboard");
      return response.data;
    },
  });

  const data = dashboardData?.success ? dashboardData.data : null;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of your split bill activities
            </p>
          </div>
          <Button asChild>
            <Link href="/receipts/new">
              <Plus className="w-4 h-4 mr-2" />
              New Receipt
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.stats.totalGroups || 0}</div>
              <p className="text-xs text-muted-foreground">
                {data?.stats.outstandingGroups || 0} outstanding
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                Rp {(data?.stats.pendingAmount || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {data?.stats.pendingSettlements || 0} settlements pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                Rp {(data?.stats.paidAmount || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {data?.stats.paidSettlements || 0} settlements completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Managed</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Rp {(data?.stats.totalAmount || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {data?.stats.allocatedGroups || 0} groups allocated
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data?.recentActivities?.length ? (
                  data.recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.description}</p>
                      </div>
                      {activity.amount && (
                        <Badge variant="outline" className="text-xs">
                          Rp {activity.amount.toLocaleString()}
                        </Badge>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No recent activities</p>
                )}
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/groups">View All Groups</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bills to Pay */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Bills to Pay
                {data?.upcomingPayments > 0 && (
                  <Badge variant="destructive" className="ml-auto">
                    {data.upcomingPayments}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data?.billsToPay?.length ? (
                  data.billsToPay.slice(0, 3).map((bill) => (
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

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button asChild className="w-full" variant="outline">
                  <Link href="/receipts/new">
                    <Receipt className="w-4 h-4 mr-2" />
                    Upload New Receipt
                  </Link>
                </Button>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/allocations">
                    <Users className="w-4 h-4 mr-2" />
                    Manage Allocations
                  </Link>
                </Button>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/settlement">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Settlements
                  </Link>
                </Button>
                {data?.stats.outstandingGroups > 0 && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2 text-sm text-orange-600">
                      <AlertCircle className="w-4 h-4" />
                      {data.stats.outstandingGroups} groups need allocation
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}