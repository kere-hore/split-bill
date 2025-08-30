'use client'

import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'

interface LoginWidgetProps {
  callbackUrl?: string
  error?: string | null
}

export function LoginWidget({ error }: LoginWidgetProps) {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Feature Toggle Dashboard</CardTitle>
          <CardDescription>
            Sign in to manage your application feature toggles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
              {error === 'OAuthAccountNotLinked' 
                ? 'This email is already associated with another account. Please use the same sign-in method you used before.'
                : 'An error occurred during sign-in. Please try again.'
              }
            </div>
          )}
          
          <Button
            className="w-full"
            variant="outline"
          >
            Sign in with Google
          </Button>
          
          <Button
            className="w-full"
            variant="outline"
          >
            Sign in with GitHub
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}