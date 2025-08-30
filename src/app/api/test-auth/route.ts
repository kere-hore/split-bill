import { getCurrentUser } from '@/shared/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const user = await getCurrentUser()
    return NextResponse.json({ user, success: true })
  } catch (error) {
    return NextResponse.json({ error: String(error), success: false }, { status: 500 })
  }
}