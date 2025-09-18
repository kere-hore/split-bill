"use client";

import { Button } from "@/shared/components/ui/button";
import { Users, Receipt, Loader2 } from "lucide-react";
import Link from "next/link";
import { GroupCard } from "@/entities/group";
import { useGroups } from "../model/use-groups";

export function AllocationsList() {
  const {
    data,
    isLoading: loading,
    error,
    refetch,
  } = useGroups({ status: "all" });
  console.log({ data });
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading allocations...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">
          {error?.message || "An error occurred"}
        </p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  if (data?.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No allocations yet</h3>
        <p className="text-muted-foreground mb-4">
          Upload a receipt first to start allocating costs to group members
        </p>
        <Button asChild>
          <Link href="/receipts/new">
            <Receipt className="w-4 h-4 mr-2" />
            Upload Receipt
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {data?.map((group) => (
        <GroupCard key={group.id} group={group} />
      ))}
    </div>
  );
}
