"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Activity } from "lucide-react";
import Link from "next/link";
import type { RecentActivity } from "@/shared/api/contract/dashboard/types";

interface RecentActivitiesProps {
  activities: RecentActivity[];
}

export function RecentActivitiesCard({ activities }: RecentActivitiesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.length ? (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.description}
                  </p>
                </div>
                {activity.amount && (
                  <Badge variant="outline" className="text-xs">
                    Rp {activity.amount.toLocaleString()}
                  </Badge>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No recent activities
            </p>
          )}
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href="/allocations">View All Groups</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
