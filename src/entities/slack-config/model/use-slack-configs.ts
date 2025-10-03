"use client";

import { useQuery } from "@tanstack/react-query";
import { getConfigsSlack, SlackConfig } from "@/shared/api/contract/slack-configs";

export function useSlackConfigs() {
  return useQuery({
    queryKey: ["slack-configs"],
    queryFn: async (): Promise<SlackConfig[]> => {
      const result = await getConfigsSlack();
      return result.success ? result.data : [];
    },
    staleTime: 5 * 60 * 1000,
  });
}