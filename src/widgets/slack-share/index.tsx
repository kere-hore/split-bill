"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { MessageSquare } from "lucide-react";
import { useSlackShare, SlackShareModal } from "@/features/slack-share";
import { toast } from "sonner";

interface SlackShareWidgetProps {
  groupId: string;
}

export function SlackShareWidget({ groupId }: SlackShareWidgetProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { configs, isLoading, shareToSlack } = useSlackShare(groupId);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleShare = (configId: string) => {
    shareToSlack.mutate(
      { configId },
      {
        onSuccess: () => {
          toast.success("Bill shared to Slack successfully!");
          setIsModalOpen(false);
        },
        onError: () => {
          toast.error("Failed to share to Slack");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-9 w-32 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (configs.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        <span>No Slack configured. </span>
        <a href="/settings" className="text-primary hover:underline">
          Setup in Settings
        </a>
      </div>
    );
  }

  return (
    <>
      <Button
        onClick={handleOpenModal}
        disabled={isLoading}
        size="sm"
        variant="outline"
        className="cursor-pointer"
      >
        <MessageSquare className="h-4 w-4 mr-1" />
        Share to Slack
      </Button>

      <SlackShareModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        configs={configs}
        onShare={handleShare}
        isSharing={shareToSlack.isPending}
      />
    </>
  );
}
