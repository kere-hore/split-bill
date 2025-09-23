import {
  SlackWebhookPayload,
  SlackNotificationEvent,
  SlackWebhookResponse,
  SlackConfig,
} from "../model/types";
import { SlackErrorHandler } from "../lib/error-handler";

export class SlackWebhookService {
  private rateLimitMap = new Map<
    string,
    { count: number; resetTime: number }
  >();

  /**
   * Send a notification based on an event
   */
  async sendNotification(
    event: SlackNotificationEvent,
    config: SlackConfig
  ): Promise<void> {
    try {
      // Check if event type is enabled for this group
      if (!this.isNotificationEnabled(event.type, config)) {
        console.log(
          `Slack notification skipped for event ${event.type} - not enabled for group ${config.groupId}`
        );
        return;
      }

      // Check rate limiting
      if (!this.checkRateLimit(config)) {
        SlackErrorHandler.handleRateLimit(config.groupId, event.type);
        return;
      }

      // Format the event into a Slack message
      const payload = this.formatEventMessage(event, config);

      // Send the formatted message
      await this.sendFormattedMessage(payload, config);

      console.log(
        `Slack notification sent successfully for event ${event.type} to group ${config.groupId}`
      );
    } catch (error) {
      // Graceful degradation - log error but don't throw
      SlackErrorHandler.handleWebhookError(
        error instanceof Error ? error : new Error(String(error)),
        config.groupId,
        event.type,
        { eventData: event.data }
      );
    }
  }

  /**
   * Send a formatted message to Slack webhook
   */
  async sendFormattedMessage(
    payload: SlackWebhookPayload,
    config: SlackConfig
  ): Promise<SlackWebhookResponse> {
    try {
      // Validate webhook URL
      if (!this.isValidWebhookUrl(config.webhookUrl)) {
        throw new Error("Invalid Slack webhook URL");
      }

      // Add default channel if not specified in payload
      if (!payload.channel && config.defaultChannel) {
        payload.channel = config.defaultChannel;
      }

      const response = await fetch(config.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Slack webhook failed: ${response.status} - ${errorText}`
        );
      }

      const result = await response.text();

      // Slack returns "ok" for successful webhooks
      if (result === "ok") {
        return { ok: true };
      } else {
        return { ok: false, error: result };
      }
    } catch (error) {
      console.error("Slack webhook request failed:", error);
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Format an event into a Slack message payload
   */
  private formatEventMessage(
    event: SlackNotificationEvent,
    config: SlackConfig
  ): SlackWebhookPayload {
    const basePayload: SlackWebhookPayload = {
      username: "Split Bill Bot",
      icon_emoji: ":money_with_wings:",
    };

    switch (event.type) {
      case "group_created":
        return {
          ...basePayload,
          text: `🎉 New group "${event.data.groupName}" has been created!`,
          attachments: [
            {
              color: "good",
              fields: [
                {
                  title: "Group ID",
                  value: event.data.groupId,
                  short: true,
                },
                {
                  title: "Created by",
                  value: event.data.createdBy || "Unknown",
                  short: true,
                },
              ],
            },
          ],
        };

      case "expense_added":
        return {
          ...basePayload,
          text: `💰 New expense added: ${event.data.description}`,
          attachments: [
            {
              color: "warning",
              fields: [
                {
                  title: "Amount",
                  value: `${event.data.currency || "IDR"} ${
                    event.data.amount?.toLocaleString() || "0"
                  }`,
                  short: true,
                },
                {
                  title: "Added by",
                  value: event.data.addedBy || "Unknown",
                  short: true,
                },
              ],
            },
          ],
        };

      case "settlement_recorded":
        return {
          ...basePayload,
          text: `✅ Payment recorded: ${event.data.payerName} paid ${event.data.receiverName}`,
          attachments: [
            {
              color: "good",
              fields: [
                {
                  title: "Amount",
                  value: `${event.data.currency || "IDR"} ${
                    event.data.amount?.toLocaleString() || "0"
                  }`,
                  short: true,
                },
                {
                  title: "Status",
                  value: event.data.status || "Completed",
                  short: true,
                },
              ],
            },
          ],
        };

      case "ocr_failed":
        return {
          ...basePayload,
          text: `❌ OCR processing failed for receipt`,
          attachments: [
            {
              color: "danger",
              fields: [
                {
                  title: "Error",
                  value: event.data.error || "Unknown error",
                  short: false,
                },
                {
                  title: "File",
                  value: event.data.fileName || "Unknown file",
                  short: true,
                },
              ],
            },
          ],
        };

      case "cache_invalidated":
        return {
          ...basePayload,
          text: `🔄 Cache invalidated`,
          attachments: [
            {
              color: "#36a64f",
              fields: [
                {
                  title: "Reason",
                  value: event.data.reason || "Manual invalidation",
                  short: true,
                },
                {
                  title: "Paths",
                  value: event.data.paths?.join(", ") || "Unknown",
                  short: false,
                },
              ],
            },
          ],
        };

      case "error_occurred":
        return {
          ...basePayload,
          text: `🚨 System error occurred`,
          attachments: [
            {
              color: "danger",
              fields: [
                {
                  title: "Error Type",
                  value: event.data.errorType || "Unknown",
                  short: true,
                },
                {
                  title: "Message",
                  value: event.data.message || "No details available",
                  short: false,
                },
              ],
            },
          ],
        };

      case "manual_share":
        return {
          ...basePayload,
          text: `📊 ${event.data.groupName} - Bill Summary shared by ${event.data.sharedBy}`,
          attachments: [
            {
              color: "good",
              title: `${event.data.groupName} - Bill Summary`,
              title_link: event.data.publicUrl,
              fields: [
                {
                  title: "Total Amount",
                  value: `${event.data.currency} ${
                    event.data.totalAmount?.toLocaleString() || "0"
                  }`,
                  short: true,
                },
                {
                  title: "Members",
                  value: event.data.memberCount?.toString() || "0",
                  short: true,
                },
                {
                  title: "Shared by",
                  value: event.data.sharedBy || "Unknown",
                  short: true,
                },
              ],
              footer: "Split Bill App",
              ts: Math.floor(Date.now() / 1000),
            },
          ],
        };

      default:
        return {
          ...basePayload,
          text: `📢 Event: ${event.type}`,
          attachments: [
            {
              color: "#36a64f",
              fields: [
                {
                  title: "Data",
                  value: JSON.stringify(event.data, null, 2),
                  short: false,
                },
              ],
            },
          ],
        };
    }
  }

  /**
   * Check if notification is enabled for the event type
   */
  private isNotificationEnabled(
    eventType: string,
    config: SlackConfig
  ): boolean {
    return config.isActive && config.enabledEvents.includes(eventType);
  }

  /**
   * Check rate limiting for the webhook
   */
  private checkRateLimit(config: SlackConfig): boolean {
    const now = Date.now();
    const key = config.groupId;
    const limit = config.rateLimitPerMinute;

    const current = this.rateLimitMap.get(key);

    if (!current || now > current.resetTime) {
      // Reset or initialize rate limit window
      this.rateLimitMap.set(key, {
        count: 1,
        resetTime: now + 60000, // 1 minute from now
      });
      return true;
    }

    if (current.count >= limit) {
      return false; // Rate limit exceeded
    }

    // Increment count
    current.count++;
    return true;
  }

  /**
   * Validate Slack webhook URL format
   */
  private isValidWebhookUrl(url: string): boolean {
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

  /**
   * Test webhook connectivity
   */
  async testWebhook(config: SlackConfig): Promise<SlackWebhookResponse> {
    const testPayload: SlackWebhookPayload = {
      text: "🧪 Test message from Split Bill - Slack integration is working!",
      username: "Split Bill Bot",
      icon_emoji: ":white_check_mark:",
    };

    return this.sendFormattedMessage(testPayload, config);
  }
}
