import { ApiResponse } from "@/shared/types/api-response";

export interface SlackConfig {
  id: string;
  name: string;
  channelName: string;
  webhookUrl: string;
  isActive: boolean;
}

export type SlackConfigsResponse = ApiResponse<SlackConfig[]>