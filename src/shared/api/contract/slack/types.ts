export interface SlackConfig {
  id: string;
  groupId: string;
  webhookUrl: string;
  defaultChannel?: string;
  enabledEvents: string[];
  messageFormat: "simple" | "rich";
  rateLimitPerMinute: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SlackConfigInput {
  webhookUrl: string;
  defaultChannel?: string;
  enabledEvents?: string[];
  messageFormat?: "simple" | "rich";
  rateLimitPerMinute?: number;
}

export interface SlackConfigResponse {
  success: boolean;
  message: string;
  data: SlackConfig;
  timestamp: string;
}

export interface SlackTestResponse {
  success: boolean;
  message: string;
  data: {
    success: boolean;
    message: string;
    error?: string;
  };
  timestamp: string;
}
