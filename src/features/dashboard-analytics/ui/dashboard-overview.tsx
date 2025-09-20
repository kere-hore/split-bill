"use client";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Plus, Receipt, Users, TrendingUp, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useDashboardData, type DashboardData } from "@/entities/dashboard";
import { DashboardStatsCards, RecentActivitiesCard, BillsToPayCard } from "@/features/dashboard-analytics";

export function DashboardOverview() {
  const { data: dashboardData, isLoading } = useDashboardData();
  const data: DashboardData | null = dashboardData?.success ? dashboardData.data : null;

  if (isLoading) {
    return (
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
    );
  }

  return (
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
      {data?.stats && <DashboardStatsCards stats={data.stats} />}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        {data?.recentActivities && (
          <RecentActivitiesCard activities={data.recentActivities} />
        )}

        {/* Bills to Pay */}
        {data?.billsToPay && (
          <BillsToPayCard 
            bills={data.billsToPay} 
            upcomingPayments={data.upcomingPayments} 
          />
        )}

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
              {data?.stats?.outstandingGroups && data.stats.outstandingGroups > 0 && (
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
  );
}