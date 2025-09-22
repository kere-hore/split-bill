import { isAxiosError } from "axios";
import { ApiErrorResponse } from "@/shared/types/api-response";

export interface ParsedError {
  message: string;
  details?: string;
  status?: number;
}

/**
 * Parse error from various sources (axios, fetch, generic Error)
 * Returns consistent error format
 */
export function parseError(error: unknown): ParsedError {
  // Handle axios errors
  if (isAxiosError(error)) {
    const apiError = error.response?.data as ApiErrorResponse | undefined;

    if (apiError?.error) {
      return {
        message: apiError.error.message,
        details: apiError.error.details,
        status: error.response?.status,
      };
    }

    return {
      message: error.message || "Network error occurred",
      status: error.response?.status,
    };
  }

  // Handle generic errors
  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  // Handle unknown errors
  return {
    message: "An unexpected error occurred",
  };
}

/**
 * Extract user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  return parseError(error).message;
}

/**
 * Extract technical error details for debugging
 */
export function getErrorDetails(error: unknown): string | undefined {
  return parseError(error).details;
}
