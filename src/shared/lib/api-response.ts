import { NextResponse } from 'next/server'
import { ApiSuccessResponse, ApiErrorResponse } from '@/shared/types/api-response'

export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message
    },
    { status }
  )
}

export function createErrorResponse(
  userMessage: string,
  status: number = 400,
  technicalDetails?: string,
  endpoint?: string
): NextResponse<ApiErrorResponse> {
  const response: ApiErrorResponse = {
    success: false,
    error: {
      message: userMessage,
      details: technicalDetails
    }
  }

  // Add debug info in development
  if (process.env.NODE_ENV === 'development') {
    response.debug = {
      timestamp: new Date().toISOString(),
      endpoint: endpoint || 'unknown',
      stack: technicalDetails
    }
  }

  return NextResponse.json(response, { status })
}