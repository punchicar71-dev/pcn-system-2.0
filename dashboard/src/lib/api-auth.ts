/**
 * API Route Authentication Helper
 * 
 * This module provides authentication helpers for Next.js API routes.
 * Use these functions to protect sensitive endpoints like SMS sending.
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseAdmin } from './supabase-db'

export interface AuthenticatedUser {
  id: string
  email: string
  role: string
  accessLevel: string
  firstName?: string
  lastName?: string
}

export interface AuthResult {
  authenticated: boolean
  user: AuthenticatedUser | null
  error?: string
}

/**
 * Validate session and get user from API route
 * Call this at the start of protected API routes
 */
export async function validateApiSession(request: NextRequest): Promise<AuthResult> {
  try {
    // Get session token from cookies
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('pcn-dashboard.session_token')?.value

    if (!sessionToken) {
      return {
        authenticated: false,
        user: null,
        error: 'No session token found'
      }
    }

    // Look up the session in database
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('sessions')
      .select('user_id, expires_at')
      .eq('session_token', sessionToken)
      .single()

    if (sessionError || !session) {
      return {
        authenticated: false,
        user: null,
        error: 'Invalid or expired session'
      }
    }

    // Check if session has expired
    if (new Date(session.expires_at) < new Date()) {
      return {
        authenticated: false,
        user: null,
        error: 'Session has expired'
      }
    }

    // Get user details
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, role, access_level, first_name, last_name')
      .eq('id', session.user_id)
      .single()

    if (userError || !user) {
      return {
        authenticated: false,
        user: null,
        error: 'User not found'
      }
    }

    return {
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        accessLevel: user.access_level,
        firstName: user.first_name,
        lastName: user.last_name
      }
    }
  } catch (error) {
    console.error('API auth validation error:', error)
    return {
      authenticated: false,
      user: null,
      error: 'Authentication error'
    }
  }
}

/**
 * Check if user has required role
 */
export function hasRole(user: AuthenticatedUser | null, requiredRoles: string[]): boolean {
  if (!user) return false
  return requiredRoles.includes(user.role)
}

/**
 * Check if user has required access level
 */
export function hasAccessLevel(user: AuthenticatedUser | null, requiredLevels: string[]): boolean {
  if (!user) return false
  return requiredLevels.includes(user.accessLevel)
}

/**
 * Return unauthorized response
 */
export function unauthorizedResponse(message: string = 'Unauthorized'): NextResponse {
  return NextResponse.json(
    { error: message },
    { status: 401 }
  )
}

/**
 * Return forbidden response
 */
export function forbiddenResponse(message: string = 'Forbidden - Insufficient permissions'): NextResponse {
  return NextResponse.json(
    { error: message },
    { status: 403 }
  )
}

/**
 * Higher-order function to wrap API routes with authentication
 * Usage:
 *   export const POST = withAuth(async (request, user) => {
 *     // user is guaranteed to be authenticated here
 *   })
 */
export function withAuth(
  handler: (request: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>,
  options?: {
    requiredRoles?: string[]
    requiredAccessLevels?: string[]
  }
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const authResult = await validateApiSession(request)

    if (!authResult.authenticated || !authResult.user) {
      console.warn('Unauthorized API access attempt:', authResult.error)
      return unauthorizedResponse(authResult.error)
    }

    // Check role requirements
    if (options?.requiredRoles && !hasRole(authResult.user, options.requiredRoles)) {
      console.warn('Forbidden API access - insufficient role:', authResult.user.role)
      return forbiddenResponse('Insufficient role permissions')
    }

    // Check access level requirements
    if (options?.requiredAccessLevels && !hasAccessLevel(authResult.user, options.requiredAccessLevels)) {
      console.warn('Forbidden API access - insufficient access level:', authResult.user.accessLevel)
      return forbiddenResponse('Insufficient access level')
    }

    return handler(request, authResult.user)
  }
}
