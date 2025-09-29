export interface SlackConfig {
  id: string;
  name: string;
  channelName: string;
  webhookUrl: string;
  isActive: boolean;
}

export interface SlackConfigsResponse {
  success: boolean;
  data: SlackConfig[];
}