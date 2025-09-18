"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Loader2, Search, UserPlus } from "lucide-react";
import { useSearchUsers, SearchUser } from "@/entities/user/model/search";
import { useAddMember } from "../model/members";
import { toast } from "sonner";

interface AddMemberModalProps {
  groupId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AddMemberModal({ groupId, isOpen, onClose }: AddMemberModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null);

  const { data: users = [], isLoading: isSearching } = useSearchUsers(searchQuery);
  const { mutate: addMember, isPending: isAdding } = useAddMember(groupId);

  const handleAddMember = () => {
    if (!selectedUser) return;

    addMember(
      { 
        userId: selectedUser.isRegistered ? selectedUser.id : null,
        name: selectedUser.name
      },
      {
        onSuccess: () => {
          toast.success("Member added successfully!");
          handleClose();
        },
        onError: (error) => {
          toast.error(error.message || "Failed to add member");
        },
      }
    );
  };

  const handleClose = () => {
    setSearchQuery("");
    setSelectedUser(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Member to Group</DialogTitle>
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

          {/* Search Results */}
          {searchQuery.length >= 2 && (
            <div className="max-h-60 overflow-y-auto space-y-2">
              {isSearching ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : users.length > 0 ? (
                users.map((user, index) => (
                  <div
                    key={user.id || `custom-${index}`}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 ${
                      selectedUser?.name === user.name ? "bg-muted border-primary" : ""
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.image} />
                      <AvatarFallback>
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        {!user.isRegistered && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            New
                          </span>
                        )}
                      </div>
                      {user.email && (
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-muted-foreground py-4">
                  No users found
                </p>
              )}
            </div>
          )}

          {/* Selected User Preview */}
          {selectedUser && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Selected:</p>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={selectedUser.image} />
                  <AvatarFallback>
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{selectedUser.name}</p>
                  {selectedUser.email && (
                    <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleAddMember}
              disabled={!selectedUser || isAdding}
              className="flex-1"
            >
              {isAdding ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <UserPlus className="h-4 w-4 mr-2" />
              )}
              Add Member
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}