"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { Loader2, Plus, Minus } from "lucide-react";
import { useRemoveMember, GroupMember } from "@/entities/group";
import { ItemAllocationPanel } from "./item-allocation-panel";
import { AddMemberModal } from "./add-member-modal";
import { useGroupMember } from "../model/use-group-member";
import { toast } from "sonner";

interface AllocationMemberProps {
  groupId: string;
}

export function AllocationMember({ groupId }: AllocationMemberProps) {
  const { group, loading, error, refetch } = useGroupMember(groupId);
  const [showAddModal, setShowAddModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<GroupMember | null>(
    null
  );

  const { mutate: removeMember, isPending: isRemoving } =
    useRemoveMember(groupId);

  const handleRemoveMember = () => {
    if (!memberToRemove) return;

    removeMember(memberToRemove.id, {
      onSuccess: () => {
        toast.success("Member removed successfully!");
        setMemberToRemove(null);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to remove member");
      },
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const canRemoveMember = (_: GroupMember) => {
    if (!group?.isCurrentUserAdmin) return false;
    if (group?.status === "allocated") return false; // Cannot modify allocated groups
    return true; // Admin can remove anyone including themselves
  };

  const isGroupAllocated = group?.status === "allocated";

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
    <div className="max-w-2xl mx-auto">
      {/* Compact Single Column Layout */}
      <div className="bg-card rounded-lg border p-6">
        {/* Compact Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-semibold">{group.name}</h1>
            <p className="text-sm text-muted-foreground">
              {new Date(group.createdAt).toLocaleDateString("id-ID")} •{" "}
              {group.memberCount} members
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold">
              Rp{" "}
              {group.bill?.items
                .reduce((sum, item) => sum + item.totalPrice, 0)
                .toLocaleString() || "0"}
            </div>
            <div
              className={`text-xs ${
                group.status === "allocated"
                  ? "text-green-600"
                  : "text-orange-600"
              }`}
            >
              {group.status === "allocated" ? "Allocated" : "Outstanding"}
            </div>
          </div>
        </div>

        {/* Members with Add Button */}
        <div className="mb-6 pb-4 border-b">
          <div className="flex flex-wrap justify-center gap-2">
            {group.members.map((member) => (
              <div key={member.id} className="flex flex-col items-center gap-2">
                <div className="relative">
                  <Avatar className="h-12 w-12 border-2 border-gray-200">
                    <AvatarImage src={member.user.image || undefined} />
                    <AvatarFallback className="text-sm font-medium">
                      {member.user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {group.isCurrentUserAdmin && canRemoveMember(member) && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 hover:scale-110 transition-transform"
                      onClick={() => setMemberToRemove(member)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <span className="text-xs text-center max-w-[60px] truncate">
                  {member.user.name.split(" ")[0]}
                </span>
              </div>
            ))}

            {/* Add Member Avatar */}
            {group.isCurrentUserAdmin && !isGroupAllocated && (
              <div className="flex flex-col items-center gap-2">
                <Avatar
                  className="h-12 w-12 border-2 border-dashed border-gray-300 cursor-pointer hover:border-primary transition-colors"
                  onClick={() => setShowAddModal(true)}
                >
                  <AvatarFallback className="bg-gray-50 hover:bg-gray-100">
                    <Plus className="h-5 w-5 text-gray-400" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-center text-gray-400">Add</span>
              </div>
            )}
          </div>
        </div>

        {/* Item Allocation */}
        {group.bill && (
          <>
            {isGroupAllocated && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 font-medium">
                  ✅ This group has been allocated and shared. No further
                  changes allowed.
                </p>
                <p className="text-xs text-green-600 mt-1">
                  View the public breakdown:{" "}
                  <a
                    href={`/public/bills/${groupId}`}
                    target="_blank"
                    className="underline"
                  >
                    Public Link
                  </a>
                </p>
              </div>
            )}
            <ItemAllocationPanel
              bill={group.bill}
              members={group.members}
              groupId={groupId}
              isReadOnly={isGroupAllocated}
            />
          </>
        )}
      </div>

      {/* Add Member Modal */}
      <AddMemberModal
        groupId={groupId}
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        existingMembers={group.members}
      />

      {/* Remove Member Confirmation */}
      <AlertDialog
        open={!!memberToRemove}
        onOpenChange={() => setMemberToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {memberToRemove?.user.name} from
              this group? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              disabled={isRemoving}
              className="bg-red-600 hover:bg-red-700"
            >
              {isRemoving ? "Removing..." : "Remove Member"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
