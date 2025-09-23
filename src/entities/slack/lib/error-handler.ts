/**
 * Slack-specific error handling utilities
 * Implements graceful degradation for webhook failures
 */

export interface SlackError {
  type: "webhook_failure" | "rate_limit" | "invalid_config" | "network_error";
  message: string;
  groupId?: string;
  eventType?: string;
  timestamp: Date;
  retryable: boolean;
}

export class SlackErrorHandler {
  private static errorLog: SlackError[] = [];
  private static maxLogSize = 1000;

  /**
   * Handle Slack webhook errors with graceful degradation
   */
  static handleWebhookError(
    error: Error,
    groupId: string,
    eventType: string,
    context?: Record<string, any>
  ): void {
    const slackError: SlackError = {
      type: this.classifyError(error),
      message: error.message,
      groupId,
      eventType,
      timestamp: new Date(),
      retryable: this.isRetryableError(error),
    };

    // Log the error
    this.logError(slackError, context);

    // Don't throw - implement graceful degradation
    console.warn(
      `Slack notification failed for group ${groupId}, event ${eventType}:`,
      error.message
    );

    // Optionally, could implement fallback mechanisms here
    // e.g., store failed notifications for retry, send email alerts, etc.
  }

  /**
   * Handle configuration errors
   */
  static handleConfigError(
    error: Error,
    groupId: string,
    operation: string
  ): void {
    const slackError: SlackError = {
      type: "invalid_config",
      message: `Configuration error during ${operation}: ${error.message}`,
      groupId,
      timestamp: new Date(),
      retryable: false,
    };

    this.logError(slackError);
    console.error(
      `Slack configuration error for group ${groupId}:`,
      error.message
    );
  }

  /**
   * Handle rate limiting
   */
  static handleRateLimit(groupId: string, eventType: string): void {
    const slackError: SlackError = {
      type: "rate_limit",
      message: "Rate limit exceeded for Slack notifications",
      groupId,
      eventType,
      timestamp: new Date(),
      retryable: true,
    };

    this.logError(slackError);
    console.warn(
      `Slack rate limit exceeded for group ${groupId}, event ${eventType}`
    );
  }

  /**
   * Get recent errors for monitoring
   */
  static getRecentErrors(limit: number = 50): SlackError[] {
    return this.errorLog.slice(-limit);
  }

  /**
   * Get errors for a specific group
   */
  static getGroupErrors(groupId: string, limit: number = 20): SlackError[] {
    return this.errorLog
      .filter((error) => error.groupId === groupId)
      .slice(-limit);
  }

  /**
   * Clear error log
   */
  static clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Get error statistics
   */
  static getErrorStats(): {
    total: number;
    byType: Record<string, number>;
    retryable: number;
    recent24h: number;
  } {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const byType: Record<string, number> = {};
    let retryable = 0;
    let recent24h = 0;

    this.errorLog.forEach((error) => {
      byType[error.type] = (byType[error.type] || 0) + 1;
      if (error.retryable) retryable++;
      if (error.timestamp > yesterday) recent24h++;
    });

    return {
      total: this.errorLog.length,
      byType,
      retryable,
      recent24h,
    };
  }

  private static logError(
    error: SlackError,
    context?: Record<string, any>
  ): void {
    // Add to in-memory log
    this.errorLog.push(error);

    // Trim log if it gets too large
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }

    // Log to console with context
    console.error("Slack Error:", {
      ...error,
      context,
    });
  }

  private static classifyError(error: Error): SlackError["type"] {
    const message = error.message.toLowerCase();

    if (
      message.includes("rate limit") ||
      message.includes("too many requests")
    ) {
      return "rate_limit";
    }

    if (message.includes("invalid") || message.includes("webhook")) {
      return "invalid_config";
    }

    if (
      message.includes("network") ||
      message.includes("timeout") ||
      message.includes("fetch")
    ) {
      return "network_error";
    }

    return "webhook_failure";
  }

  private static isRetryableError(error: Error): boolean {
    const message = error.message.toLowerCase();

    // Network errors and rate limits are typically retryable
    return (
      message.includes("network") ||
      message.includes("timeout") ||
      message.includes("rate limit") ||
      message.includes("503") ||
      message.includes("502") ||
      message.includes("500")
    );
  }
}
