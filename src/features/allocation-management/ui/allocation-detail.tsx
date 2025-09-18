"use client";

import { Button } from "@/shared/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { GroupSummary, MembersList, BillItems } from "@/entities/group";
import { useGroupDetail } from "../model/use-group-detail";

interface AllocationDetailProps {
  groupId: string;
}

export function AllocationDetail({ groupId }: AllocationDetailProps) {
  const { group, loading, error, refetch } = useGroupDetail(groupId);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading group details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-12">
        d<p className="text-muted-foreground">Group not found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Group Summary */}
      <div className="space-y-6">
        <GroupSummary group={group} />

        {/* Bill Items */}
        {group.bill ? (
          <BillItems bill={group.bill} />
        ) : (
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Receipt Details</h3>
            <p className="text-muted-foreground text-sm">
              No bill associated with this group.
            </p>
          </div>
        )}
      </div>

      {/* Member Management */}
      <div className="space-y-6">
        <div className="bg-card rounded-lg border p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Group Members</h2>
          </div>

          <MembersList
            groupId={groupId}
            members={group.members}
            currentUserId={group.current_user_id}
            isAdmin={group.is_current_user_admin}
          />
        </div>

        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Allocation Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Total Members:</span>
              <span>{group.member_count}</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span
                className={
                  group.status === "allocated"
                    ? "text-green-600"
                    : "text-orange-600"
                }
              >
                {group.status === "allocated" ? "Allocated" : "Outstanding"}
              </span>
            </div>
            {group.status === "allocated" && (
              <div className="pt-2 border-t">
                <Button className="w-full">View Settlement</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
