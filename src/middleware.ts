import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/groups(.*)',
  '/expenses(.*)',
  '/api/groups(.*)',
  '/api/expenses(.*)',
  '/api/settlements(.*)'
])

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)'
])

export default clerkMiddleware(async (auth, req) => {
  const session = await auth()
  const { pathname } = req.nextUrl

  // Redirect authenticated users from root to dashboard
  if (pathname === '/' && session.userId) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Redirect unauthenticated users from root to sign-up
  if (pathname === '/' && !session.userId) {
    return NextResponse.redirect(new URL('/sign-up', req.url))
  }

  // Redirect authenticated users away from auth pages
  if (isPublicRoute(req) && session.userId) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Protect routes that require authentication
  if (isProtectedRoute(req) && !session.userId) {
    return NextResponse.redirect(new URL('/sign-in', req.url))
  }
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}