"use client";

import { useGroups } from "@/entities/group";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Plus, Users, Receipt, Share2, Loader2 } from "lucide-react";
import Link from "next/link";
import { SlackShareWidget } from "@/widgets/slack-share";

export function SettlementListWidget() {
  const {
    data: groups = [],
    isLoading: loading,
    error,
  } = useGroups("allocated");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            <span>Loading settlements...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">
              ❌ {error.message || "Failed to load groups"}
            </p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Settlement List
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage your bill settlements and share with friends
          </p>
        </div>

        <div className="grid gap-4">
          {groups.map((group) => (
            <Card key={group.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">
                      {group.bill?.merchantName || group.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {group.bill?.date
                        ? new Date(group.bill.date).toLocaleDateString("id-ID")
                        : new Date(group.createdAt).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                  <Badge
                    variant={
                      group.status === "allocated" ? "default" : "secondary"
                    }
                    className="self-start sm:self-auto"
                  >
                    {group.status === "allocated" ? "Allocated" : "Outstanding"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Mobile Layout */}
                <div className="flex flex-col gap-3 sm:hidden">
                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Receipt className="w-4 h-4" />
                      {group.bill?.totalAmount
                        ? formatCurrency(group.bill.totalAmount)
                        : "No bill"}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {group.memberCount} members
                    </div>
                    {group.paymentStats && (
                      <div className="text-xs px-2 py-1 bg-muted rounded">
                        {group.paymentStats.paidMembers} of{" "}
                        {group.paymentStats.totalMembers} paid
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button asChild size="sm" className="w-full">
                      <Link
                        href={
                          group.status === "allocated"
                            ? `/settlement/${group.id}`
                            : `/allocations/${group.id}`
                        }
                      >
                        {group.status === "outstanding"
                          ? "Manage Group"
                          : "View Settlement"}
                      </Link>
                    </Button>
                    {group.status === "allocated" && (
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <SlackShareWidget groupId={group.id} />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="flex-1"
                        >
                          <Link
                            href={`/public/bills/${group.id}`}
                            target="_blank"
                          >
                            <Share2 className="w-4 h-4 mr-1" />
                            Public
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:block space-y-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Receipt className="w-4 h-4" />
                      {group.bill?.totalAmount
                        ? formatCurrency(group.bill.totalAmount)
                        : "No bill"}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {group.memberCount} members
                    </div>
                    {group.paymentStats && (
                      <div className="text-xs px-2 py-1 bg-muted rounded">
                        {group.paymentStats.paidMembers} of{" "}
                        {group.paymentStats.totalMembers} paid
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 items-center justify-end">
                    {group.status === "allocated" && (
                      <>
                        <SlackShareWidget groupId={group.id} />
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="cursor-pointer"
                        >
                          <Link
                            href={`/public/bills/${group.id}`}
                            target="_blank"
                          >
                            <Share2 className="w-4 h-4 mr-1" />
                            View Public
                          </Link>
                        </Button>
                      </>
                    )}
                    <Button asChild size="sm">
                      <Link
                        href={
                          group.status === "allocated"
                            ? `/settlement/${group.id}`
                            : `/allocations/${group.id}`
                        }
                      >
                        {group.status === "outstanding"
                          ? "Manage Group"
                          : "View Settlement"}
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {groups.length === 0 && (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No allocated groups yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Complete bill allocation first to see settlements here
            </p>
            <Button asChild>
              <Link href="/groups">
                <Plus className="w-4 h-4 mr-2" />
                View Groups
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
