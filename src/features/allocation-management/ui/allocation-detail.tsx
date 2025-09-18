"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";

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
import { ItemAllocationPanel, AddMemberModal, useRemoveMember } from "@/entities/group";
import { useGroupDetail } from "../model/use-group-detail";
import { toast } from "sonner";

interface AllocationDetailProps {
  groupId: string;
}

export function AllocationDetail({ groupId }: AllocationDetailProps) {
  const { group, loading, error, refetch } = useGroupDetail(groupId);
  const [showAddModal, setShowAddModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<any>(null);
  
  const { mutate: removeMember, isPending: isRemoving } = useRemoveMember(groupId);

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

  const canRemoveMember = (member: any) => {
    if (!group?.is_current_user_admin) return false;
    return true; // Admin can remove anyone including themselves
  };

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
              {new Date(group.created_at).toLocaleDateString("id-ID")} • {group.member_count} members
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold">
              Rp {group.bill?.items.reduce((sum, item) => sum + item.total_price, 0).toLocaleString() || '0'}
            </div>
            <div className={`text-xs ${
              group.status === "allocated" ? "text-green-600" : "text-orange-600"
            }`}>
              {group.status === "allocated" ? "Allocated" : "Outstanding"}
            </div>
          </div>
        </div>

        {/* Members with Add Button */}
        <div className="mb-6 pb-4 border-b">
          <div className="flex justify-center gap-4">
            {group.members.map((member) => (
              <div key={member.id} className="flex flex-col items-center gap-2">
                <div className="relative">
                  <Avatar className="h-12 w-12 border-2 border-gray-200">
                    <AvatarImage src={member.user.image || undefined} />
                    <AvatarFallback className="text-sm font-medium">
                      {member.user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {group.is_current_user_admin && canRemoveMember(member) && (
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
                  {member.user.name.split(' ')[0]}
                </span>
              </div>
            ))}
            
            {/* Add Member Avatar */}
            {group.is_current_user_admin && (
              <div className="flex flex-col items-center gap-2">
                <Avatar 
                  className="h-12 w-12 border-2 border-dashed border-gray-300 cursor-pointer hover:border-primary transition-colors"
                  onClick={() => setShowAddModal(true)}
                >
                  <AvatarFallback className="bg-gray-50 hover:bg-gray-100">
                    <Plus className="h-5 w-5 text-gray-400" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-center text-gray-400">
                  Add
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Item Allocation */}
        {group.bill && group.members.length > 0 ? (
          <ItemAllocationPanel 
            billItems={group.bill.items}
            members={group.members}
            groupId={groupId}
          />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {!group.bill ? "No bill items to allocate" : "Add members first to start allocation"}
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      <AddMemberModal
        groupId={groupId}
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      {/* Remove Member Confirmation */}
      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {memberToRemove?.user.name} from this group?
              This action cannot be undone.
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
