"use client";

import { useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { SlackUserMapping } from "@/entities/slack-user-mapping";

interface SlackMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  mappings: SlackUserMapping[];
  onSubmit: (
    updates: Record<
      string,
      {
        slackUsername?: string;
        mappingStatus?: "pending" | "active" | "skipped";
      }
    >
  ) => void;
  isLoading?: boolean;
}

export function SlackMappingModal({
  isOpen,
  onClose,
  mappings,
  onSubmit,
  isLoading,
}: SlackMappingModalProps) {
  const [updates, setUpdates] = useState<Record<string, string>>({});

  useEffect(() => {
    // Initialize with existing mappings
    const initialUpdates: Record<string, string> = {};
    mappings.forEach((mapping) => {
      if (mapping.slackUsername) {
        initialUpdates[mapping.id] = mapping.slackUsername;
      }
    });
    setUpdates(initialUpdates);
  }, [mappings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const mappingUpdates: Record<
      string,
      {
        slackUsername?: string;
        mappingStatus?: "pending" | "active" | "skipped";
      }
    > = {};

    Object.entries(updates).forEach(([mappingId, slackUsername]) => {
      mappingUpdates[mappingId] = {
        slackUsername: slackUsername || undefined,
        mappingStatus: slackUsername ? "active" : "skipped",
      };
    });

    onSubmit(mappingUpdates);
  };

  const handleInputChange = (mappingId: string, value: string) => {
    setUpdates((prev) => ({
      ...prev,
      [mappingId]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Map Users to Slack</DialogTitle>
          <div className="text-sm text-muted-foreground mt-2 space-y-2">
            <div className="p-3 bg-blue-50 rounded-lg border">
              <p className="font-medium text-blue-900 mb-2">
                💬 Want proper @mentions in Slack?
              </p>
              <div className="text-xs text-blue-700 space-y-1">
                <p>
                  <strong>Step 1:</strong> Open Slack → Right-click user →
                  &quot;Copy member ID&quot;
                </p>
                <p>
                  <strong>Step 2:</strong> Paste the ID here (starts with U,
                  like U1234567890)
                </p>
                <p>
                  <strong>Optional:</strong> Leave empty for name-only display
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            {mappings.map((mapping) => (
              <div key={mapping.id} className="space-y-2">
                <Label htmlFor={mapping.id}>
                  {mapping.memberName}
                  {mapping.memberEmail && (
                    <span className="text-sm text-muted-foreground ml-1">
                      ({mapping.memberEmail})
                    </span>
                  )}
                </Label>
                <Input
                  id={mapping.id}
                  placeholder="U1234567890 (optional - for @mentions)"
                  value={updates[mapping.id] || ""}
                  onChange={(e) =>
                    handleInputChange(mapping.id, e.target.value)
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  ✨ <strong>Optional:</strong> Slack User ID for clickable
                  @mentions, or leave empty
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Mappings"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
