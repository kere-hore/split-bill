"use client";

import { useSlackConfigs } from "@/entities/slack-config";
import { useShareToSlack } from "@/entities/slack-user-mapping";

export function useSlackShare(groupId: string) {
  const { data: configs = [], isLoading } = useSlackConfigs();
  const shareToSlack = useShareToSlack(groupId);

  return {
    configs,
    isLoading,
    shareToSlack,
  };
}