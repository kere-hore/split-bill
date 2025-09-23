import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSlackConfig,
  updateSlackConfig,
  deleteSlackConfig,
  testSlackConfig,
} from "@/shared/api/contract/slack";
import { SlackConfig, SlackConfigInput } from "./types";

// Query Keys
export const slackKeys = {
  all: ["slack"] as const,
  configs: () => [...slackKeys.all, "config"] as const,
  config: (groupId: string) => [...slackKeys.configs(), groupId] as const,
};

export function useSlackConfig(groupId: string) {
  return useQuery({
    queryKey: slackKeys.config(groupId),
    queryFn: async () => {
      const response = await getSlackConfig(groupId);
      return response.data;
    },
    enabled: !!groupId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 404 (config not found)
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useUpdateSlackConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      groupId,
      config,
    }: {
      groupId: string;
      config: SlackConfigInput;
    }) => {
      const response = await updateSlackConfig(groupId, config);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Update the cache with new data
      queryClient.setQueryData(slackKeys.config(variables.groupId), data);
      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: slackKeys.config(variables.groupId),
      });
    },
  });
}

export function useDeleteSlackConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (groupId: string) => {
      await deleteSlackConfig(groupId);
    },
    onSuccess: (_, groupId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: slackKeys.config(groupId) });
    },
  });
}

export function useTestSlackConfig() {
  return useMutation({
    mutationFn: async (groupId: string) => {
      const response = await testSlackConfig(groupId);
      return response.data;
    },
  });
}

export function useShareToSlack() {
  return useMutation({
    mutationFn: async ({
      groupId,
      shareData,
    }: {
      groupId: string;
      shareData: {
        webhookUrl: string;
        channel?: string;
        messageType?: "summary" | "detailed";
        includeMembers?: boolean;
        customMessage?: string;
      };
    }) => {
      const { shareToSlack } = await import("@/shared/api/contract/slack");
      const response = await shareToSlack(groupId, shareData);
      return response.data;
    },
  });
}

// Utility function for webhook URL validation
export function validateWebhookUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return (
      parsedUrl.hostname === "hooks.slack.com" &&
      parsedUrl.pathname.startsWith("/services/")
    );
  } catch {
    return false;
  }
}

// Cache invalidation helper
export function useInvalidateSlackConfig() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () =>
      queryClient.invalidateQueries({ queryKey: slackKeys.all }),
    invalidateConfig: (groupId: string) =>
      queryClient.invalidateQueries({ queryKey: slackKeys.config(groupId) }),
  };
}
