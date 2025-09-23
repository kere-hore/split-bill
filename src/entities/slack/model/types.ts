export interface SlackWebhookPayload {
  text?: string;
  blocks?: SlackBlock[];
  channel?: string;
  username?: string;
  icon_emoji?: string;
  attachments?: SlackAttachment[];
}

export interface SlackBlock {
  type: string;
  text?: {
    type: string;
    text: string;
  };
  elements?: any[];
  fields?: any[];
}

export interface SlackAttachment {
  color?: string;
  title?: string;
  text?: string;
  fields?: SlackField[];
  footer?: string;
  ts?: number;
}

export interface SlackField {
  title: string;
  value: string;
  short?: boolean;
}

export interface SlackNotificationEvent {
  type:
    | "group_created"
    | "expense_added"
    | "settlement_recorded"
    | "ocr_failed"
    | "cache_invalidated"
    | "error_occurred"
    | "manual_share";
  data: Record<string, any>;
  timestamp: Date;
  userId?: string;
  groupId?: string;
}

export interface SlackConfig {
  id: string;
  groupId: string;
  webhookUrl: string;
  defaultChannel?: string;
  enabledEvents: string[];
  messageFormat: "simple" | "rich";
  rateLimitPerMinute: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SlackWebhookResponse {
  ok: boolean;
  error?: string;
  warning?: string;
}

export interface SlackConfigInput {
  webhookUrl: string;
  defaultChannel?: string;
  enabledEvents?: string[];
  messageFormat?: "simple" | "rich";
  rateLimitPerMinute?: number;
}
