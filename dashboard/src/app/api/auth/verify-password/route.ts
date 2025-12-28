/**
 * Verify Password API Route
 * 
 * TEMPORARY: This route provides password verification during migration.
 * It will be removed when Better Auth is integrated.
 * 
 * TODO: Remove this route after Better Auth migration.
 */

import { NextRequest, NextResponse } from 'next/server'
import * as crypto from 'crypto'

// Simple password verification using SHA-256 hash
function verifyPassword(password: string, hash: string): boolean {
  const inputHash = crypto.createHash('sha256').update(password).digest('hex')
  return inputHash === hash
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password, hash } = body

    if (!password || !hash) {
      return NextResponse.json(
        { valid: false, error: 'Password and hash are required' },
        { status: 400 }
      )
    }

    const isValid = verifyPassword(password, hash)

    return NextResponse.json({ valid: isValid })
  } catch (error) {
    console.error('Password verification error:', error)
    return NextResponse.json(
      { valid: false, error: 'Verification failed' },
      { status: 500 }
    )
  }
}
