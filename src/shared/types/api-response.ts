/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ApiSuccessResponse<T = any> {
  success: true
  data: T
  message?: string
}

export interface ApiErrorResponse {
  success: false
  error: {
    message: string      // User-friendly message
    details?: string    // Technical details for debugging
  }
  debug?: {
    timestamp: string
    endpoint: string
    stack?: string
  }
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse

