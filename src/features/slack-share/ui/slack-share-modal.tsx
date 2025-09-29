"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Badge } from "@/shared/components/ui/badge";
import { MessageSquare, Settings } from "lucide-react";
import { SlackConfig } from "@/entities/slack-config";

interface SlackShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  configs: SlackConfig[];
  onShare: (configId: string) => void;
  isSharing?: boolean;
}

export function SlackShareModal({
  isOpen,
  onClose,
  configs,
  onShare,
  isSharing,
}: SlackShareModalProps) {
  const [selectedConfigId, setSelectedConfigId] = useState<string>("");

  const handleShare = () => {
    if (!selectedConfigId) return;
    onShare(selectedConfigId);
  };

  const handleConfigSelect = (configId: string) => {
    setSelectedConfigId(configId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Share to Slack
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Choose which Slack channel to share this bill summary to:
          </p>

          {configs.length === 0 ? (
            <div className="text-center py-6 border-2 border-dashed rounded-lg">
              <Settings className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-3">
                No Slack configurations found
              </p>
              <p className="text-xs text-muted-foreground">
                Set up Slack integration in Settings first
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {configs.map((config) => (
                <div
                  key={config.id}
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50 ${
                    selectedConfigId === config.id
                      ? "border-primary bg-primary/5"
                      : ""
                  }`}
                  onClick={() => handleConfigSelect(config.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{config.name}</span>
                      <Badge variant="outline">{config.channelName}</Badge>
                      {config.isActive && (
                        <Badge variant="default" className="text-xs">
                          Active
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="ml-2">
                    {selectedConfigId === config.id && (
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              className="cursor-pointer"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              className="cursor-pointer"
              onClick={handleShare}
              disabled={!selectedConfigId || isSharing || configs.length === 0}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              {isSharing ? "Sharing..." : "Share to Slack"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
