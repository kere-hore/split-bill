"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
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
import { MoreVertical, Trash2, Plus } from "lucide-react";
import { GroupMember } from "../model/types";
import { useRemoveMember } from "../model/members";
import { AddMemberModal } from "./add-member-modal";
import { toast } from "sonner";

interface MembersListProps {
  groupId: string;
  members: GroupMember[];
  currentUserId?: string;
  isAdmin?: boolean;
}

export function MembersList({ groupId, members, currentUserId, isAdmin }: MembersListProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<GroupMember | null>(null);
  
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

  const canRemoveMember = (member: GroupMember) => {
    if (!isAdmin) return false; // Only creator can remove members
    return member.user.id !== currentUserId; // Creator cannot remove themselves
  };
  return (
    <>
      <div className="space-y-3">
        {/* Add Member Button */}
        {isAdmin && (
          <Button
            variant="outline"
            onClick={() => setShowAddModal(true)}
            className="w-full border-dashed"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        )}

        {/* Members List */}
        {members.length === 0 ? (
          <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
            <p className="text-muted-foreground">
              No members added yet. Add members to start cost allocation.
            </p>
          </div>
        ) : (
          members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={member.user.image || undefined} />
                  <AvatarFallback>
                    {member.user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{member.user.name}</p>
                  <p className="text-xs text-muted-foreground">{member.user.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {member.role}
                </Badge>

                {/* Member Actions */}
                {isAdmin && canRemoveMember(member) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setMemberToRemove(member)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove Member
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          ))
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
    </>
  );
}