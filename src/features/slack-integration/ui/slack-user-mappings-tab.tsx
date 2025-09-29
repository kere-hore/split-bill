"use client";

import { useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Users, Settings2, Save, Plus, Trash2, Search } from "lucide-react";
import { useSlackSettings } from "@/features/slack-integration/model/use-slack-settings";
import { useSearchUsers } from "@/entities/user";
import {
  useConfigMappings,
  useUpdateConfigMappings,
} from "@/entities/slack-user-mapping";
import { toast } from "sonner";

interface UserMapping {
  id?: string;
  userId: string;
  userName: string;
  userEmail: string;
  userImage?: string;
  slackUsername?: string;
}

export function SlackUserMappingsTab() {
  const [selectedConfigId, setSelectedConfigId] = useState<string>("");
  const [mappings, setMappings] = useState<UserMapping[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserSearch, setShowUserSearch] = useState(false);

  const { configs, isLoading: configsLoading } = useSlackSettings();

  // Get users for search
  const { data: searchUsers = [], isLoading: usersLoading } =
    useSearchUsers(searchQuery);

  // Get mappings for selected config
  const { data: configMappings = [], isLoading: mappingsLoading } =
    useConfigMappings(selectedConfigId);

  // Update mappings mutation
  const updateMappingsMutation = useUpdateConfigMappings(selectedConfigId);

  const handleSelectConfig = (configId: string) => {
    setSelectedConfigId(configId);
    setMappings([]);
    setShowUserSearch(false);
  };

  const handleAddUser = (user: any) => {
    // Check if user already added
    if (mappings.some((m) => m.userId === user.id)) {
      toast.error("User already added to this configuration");
      return;
    }

    const newMapping: UserMapping = {
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userImage: user.image,
      slackUsername: "",
    };

    setMappings((prev) => [...prev, newMapping]);
    setShowUserSearch(false);
    setSearchQuery("");
  };

  const handleUpdateSlackUsername = (index: number, slackUsername: string) => {
    setMappings((prev) =>
      prev.map((mapping, i) =>
        i === index ? { ...mapping, slackUsername } : mapping
      )
    );
  };

  const handleRemoveMapping = (index: number) => {
    setMappings((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveMappings = async () => {
    if (!selectedConfigId) return;

    try {
      // Convert mappings to API format
      const mappingUpdates = mappings.map((mapping) => ({
        userId: mapping.userId,
        slackUsername: mapping.slackUsername || undefined,
      }));

      await updateMappingsMutation.mutateAsync(mappingUpdates);
      toast.success("User mappings saved successfully");
    } catch (error) {
      toast.error("Failed to save user mappings");
    }
  };

  // Initialize mappings when config mappings load
  useEffect(() => {
    if (!selectedConfigId) {
      setMappings([]);
      return;
    }

    if (configMappings.length > 0) {
      // Transform config mappings to local format
      const transformedMappings: UserMapping[] = configMappings.map(
        (mapping: any) => ({
          id: mapping.id,
          userId: mapping.userId,
          userName: mapping.User?.name || "Unknown User",
          userEmail: mapping.User?.email || "",
          userImage: mapping.User?.image,
          slackUsername: mapping.slackUsername || "",
        })
      );
      setMappings(transformedMappings);
    } else {
      setMappings([]);
    }
  }, [selectedConfigId, configMappings.length]);

  // Filter users based on search
  const filteredUsers = searchUsers.filter((user) => {
    return user.isRegistered;
  });
  if (configsLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse p-3 border rounded-lg">
            <div className="h-4 bg-muted rounded w-1/2 mb-2" />
            <div className="h-3 bg-muted rounded w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  if (configs.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed rounded-lg">
        <Settings2 className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground mb-3">
          No Slack configurations found
        </p>
        <p className="text-xs text-muted-foreground">
          Add a webhook configuration first to manage user mappings
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Add users manually to each Slack configuration and map them to Slack
        User IDs.
      </div>

      {/* Config Selection */}
      <div className="space-y-3">
        <div className="text-sm font-medium">Select Webhook Configuration:</div>
        {configs.map((config) => {
          const isSelected = selectedConfigId === config.id;
          const mappingCount = mappings.length;

          return (
            <div
              key={config.id}
              className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50 ${
                isSelected ? "border-primary bg-primary/5" : ""
              }`}
              onClick={() => handleSelectConfig(config.id)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{config.name}</span>
                  <Badge variant="outline">{config.channelName}</Badge>
                  {isSelected && mappingCount > 0 && (
                    <Badge variant="default">{mappingCount} users</Badge>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* User Mappings for Selected Config */}
      {selectedConfigId && (
        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">User Mappings:</div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowUserSearch(!showUserSearch)}
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add User
              </Button>
              <Button
                onClick={handleSaveMappings}
                size="sm"
                disabled={updateMappingsMutation.isPending}
              >
                <Save className="h-4 w-4 mr-1" />
                {updateMappingsMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>

          {/* User Search */}
          {showUserSearch && (
            <div className="border rounded-lg p-4 bg-muted/20">
              <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users by name, email, or username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowUserSearch(false)}
                >
                  Cancel
                </Button>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2">
                {searchQuery.length >= 2 ? (
                  filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-2 p-2 hover:bg-background rounded cursor-pointer"
                        onClick={() => handleAddUser(user)}
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={user.image} />
                          <AvatarFallback className="text-xs">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {user.name}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            @{user.username} • {user.email}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      No users found for &quot;{searchQuery}&quot;
                    </div>
                  )
                ) : (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    Type at least 2 characters to search users
                  </div>
                )}
              </div>
            </div>
          )}

          {mappingsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse flex gap-2 items-center p-2 border rounded"
                >
                  <div className="h-8 w-8 bg-muted rounded-full" />
                  <div className="flex-1 h-4 bg-muted rounded" />
                  <div className="w-48 h-8 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {mappings.map((mapping, index) => (
                <div
                  key={mapping.userId}
                  className="flex gap-2 items-center p-2 border rounded"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={mapping.userImage} />
                    <AvatarFallback>
                      {mapping.userName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="font-medium">{mapping.userName}</div>
                    <div className="text-sm text-muted-foreground">
                      {mapping.userEmail}
                    </div>
                  </div>

                  <Input
                    placeholder="U1234567890 (Slack User ID)"
                    value={mapping.slackUsername || ""}
                    onChange={(e) =>
                      handleUpdateSlackUsername(index, e.target.value)
                    }
                    className="w-48"
                  />

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMapping(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {mappings.length === 0 && !mappingsLoading && (
            <div className="text-center py-6 border-2 border-dashed rounded-lg">
              <Users className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No users added yet. Click &quot;Add User&quot; to start mapping.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
