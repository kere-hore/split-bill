"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Loader2, Search, UserPlus, X } from "lucide-react";
import { useSearchUsers, SearchUser } from "@/entities/user";
import { useAddMember, GroupMember } from "@/entities/group";
import { toast } from "sonner";

interface AddMemberModalProps {
  groupId: string;
  isOpen: boolean;
  onClose: () => void;
  existingMembers?: GroupMember[];
}

export function AddMemberModal({
  groupId,
  isOpen,
  onClose,
  existingMembers = [],
}: AddMemberModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<SearchUser[]>([]);

  const { data: allUsers = [], isLoading: isSearching } =
    useSearchUsers(searchQuery);

  // Filter out existing members
  const existingUserIds = existingMembers
    .map((member) => member.user?.id)
    .filter(Boolean);
  const existingUserNames = existingMembers
    .map((member) => member.user?.name?.toLowerCase())
    .filter(Boolean);
  const existingUserEmails = existingMembers
    .map((member) => member.user?.email?.toLowerCase())
    .filter(Boolean);

  const users = allUsers.filter((user) => {
    // Skip if user ID already exists
    if (user.isRegistered && existingUserIds.includes(user.id)) {
      return false;
    }
    // Skip if username already exists (case insensitive)
    if (existingUserNames.includes(user.username.toLowerCase())) {
      return false;
    }
    // Skip if email already exists (case insensitive)
    if (user.email && existingUserEmails.includes(user.email.toLowerCase())) {
      return false;
    }
    return true;
  });
  const { mutate: addMember, isPending: isAdding } = useAddMember(groupId);

  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) return;

    let successCount = 0;
    let errorCount = 0;

    for (const user of selectedUsers) {
      try {
        await new Promise((resolve, reject) => {
          addMember(
            {
              userId: user.isRegistered ? user.id : null,
              name: user.username,
            },
            {
              onSuccess: () => {
                successCount++;
                resolve(true);
              },
              onError: (error) => {
                errorCount++;
                console.error(`Failed to add ${user.username}:`, error);
                reject(error);
              },
            }
          );
        });
      } catch (error) {
        // Error already counted above
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} member(s) added successfully!`);
    }
    if (errorCount > 0) {
      toast.error(`Failed to add ${errorCount} member(s)`);
    }

    handleClose();
  };

  const toggleUserSelection = (user: SearchUser) => {
    setSelectedUsers((prev) => {
      const isSelected = prev.some((u) => u.username === user.username);
      if (isSelected) {
        return prev.filter((u) => u.username !== user.username);
      } else {
        return [...prev, user];
      }
    });
  };

  const removeSelectedUser = (user: SearchUser) => {
    setSelectedUsers((prev) =>
      prev.filter((u) => u.username !== user.username)
    );
  };

  const handleClose = () => {
    setSearchQuery("");
    setSelectedUsers([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Members to Group</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Selected Members */}
          {selectedUsers.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Selected Members ({selectedUsers.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((user, index) => (
                  <div
                    key={user.id || `selected-${index}`}
                    className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                  >
                    <span>{user.username}</span>
                    <button
                      onClick={() => removeSelectedUser(user)}
                      className="hover:bg-primary/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {searchQuery.length >= 2 && (
            <div className="max-h-60 overflow-y-auto space-y-2">
              {isSearching ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : users.length > 0 ? (
                users.map((user, index) => {
                  const isSelected = selectedUsers.some(
                    (u) => u.username === user.username
                  );
                  return (
                    <div
                      key={user.id || `custom-${index}`}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 ${
                        isSelected ? "bg-muted border-primary" : ""
                      }`}
                      onClick={() => toggleUserSelection(user)}
                    >
                      <Checkbox
                        checked={isSelected}
                        className="pointer-none:"
                      />
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.image} />
                        <AvatarFallback>
                          {user.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">
                            {user.username}
                          </p>
                          {!user.isRegistered && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                              New
                            </span>
                          )}
                        </div>
                        {user.email && (
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-sm text-muted-foreground py-4">
                  No users found
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleAddMembers}
              disabled={selectedUsers.length === 0 || isAdding}
              className="flex-1"
            >
              {isAdding ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <UserPlus className="h-4 w-4 mr-2" />
              )}
              Add {selectedUsers.length > 0 ? `${selectedUsers.length} ` : ""}
              Member{selectedUsers.length !== 1 ? "s" : ""}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
