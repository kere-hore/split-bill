import { NextResponse } from 'next/server'

export async function GET() {
  const envCheck = {
    clerk: {
      publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.substring(0, 20) + '...',
      secretKey: process.env.CLERK_SECRET_KEY ? 'Set' : 'Missing',
      signInUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
      signUpUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
      afterSignIn: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
      afterSignUp: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,
    },
    database: {
      url: process.env.DATABASE_URL ? 'Set' : 'Missing',
    },
    aws: {
      accessKey: process.env.AWS_ACCESS_KEY_ID ? 'Set' : 'Missing',
      secretKey: process.env.AWS_SECRET_ACCESS_KEY ? 'Set' : 'Missing',
      region: process.env.AWS_REGION,
      bucket: process.env.AWS_S3_BUCKET,
    },
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  }

  return NextResponse.json(envCheck)
}