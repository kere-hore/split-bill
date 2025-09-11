import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher([
  '/history(.*)',
  '/groups(.*)',
  '/expenses(.*)',
  '/api/groups(.*)',
  '/api/expenses(.*)',
  '/api/settlements(.*)',
  '/bill(.*)',
  '/dashboard(.*)'
])

const isAuthRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)'
])

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl
  
  // Skip middleware for static files and API routes that don't need auth
  if (pathname.startsWith('/api/public') || pathname.startsWith('/_next')) {
    return NextResponse.next()
  }

  try {
    const session = await auth()
    const isAuthenticated = !!session.userId
    
    // Handle root path
    if (pathname === '/') {
      if (isAuthenticated) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      } else {
        return NextResponse.redirect(new URL('/sign-up', req.url))
      }
    }

    // Redirect authenticated users away from auth pages
    if (isAuthRoute(req) && isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Protect routes that require authentication
    if (isProtectedRoute(req) && !isAuthenticated) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Clerk middleware error:', error)
    // On auth errors, redirect to sign-in for protected routes
    if (isProtectedRoute(req)) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }
    return NextResponse.next()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}