"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { 
  Users, 
  Clock,
  CheckCircle,
  DollarSign
} from "lucide-react";
import type { DashboardStats } from "@/entities/dashboard";

interface DashboardStatsProps {
  stats: DashboardStats;
}

export function DashboardStatsCards({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalGroups}</div>
          <p className="text-xs text-muted-foreground">
            {stats.outstandingGroups} outstanding
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
            Rp {stats.pendingAmount.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.pendingSettlements} settlements pending
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
            Rp {stats.paidAmount.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.paidSettlements} settlements completed
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
            Rp {stats.totalAmount.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.allocatedGroups} groups allocated
          </p>
        </CardContent>
      </Card>
    </div>
  );
}