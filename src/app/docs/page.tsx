'use client'

import { useEffect, useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import 'swagger-ui-react/swagger-ui.css'

interface SwaggerSpec {
  openapi: string;
  info: object;
  paths: object;
  components?: object;
}

interface SwaggerRequest {
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: string;
}

// Dynamically import SwaggerUI to avoid SSR issues and suppress warnings
const SwaggerUI = dynamic(() => import('swagger-ui-react').then(mod => ({ default: mod.default })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )
})

export default function ApiDocsPage() {
  const [swaggerSpec, setSwaggerSpec] = useState<SwaggerSpec | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Suppress React warnings from Swagger UI components
    const originalError = console.error
    console.error = (...args) => {
      if (args[0]?.includes?.('UNSAFE_componentWillReceiveProps')) return
      originalError(...args)
    }

    fetch('/api/docs')
      .then(res => res.json())
      .then(spec => {
        setSwaggerSpec(spec)
        setLoading(false)
      })
      .catch(() => setLoading(false))

    return () => {
      console.error = originalError
    }
  }, [])

  const swaggerConfig = useMemo(() => ({
    docExpansion: "list" as const,
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 2,
    tryItOutEnabled: true,
    filter: true,
    requestInterceptor: (request: SwaggerRequest) => request
  }), [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading API documentation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Split Bill API Documentation</h1>
          <p className="text-blue-100 text-lg">Interactive API reference with live testing capabilities</p>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto">
        {swaggerSpec && (
          <SwaggerUI 
            spec={swaggerSpec}
            {...swaggerConfig}
          />
        )}
      </div>
    </div>
  )
}