import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

// Create or update user session
export async function createUserSession(userId: string, authId: string, sessionToken: string) {
  try {
    // Check if session already exists
    const { data: existingSession } = await supabase
      .from('user_sessions')
      .select('id')
      .eq('auth_id', authId)
      .eq('is_active', true)
      .single()

    if (existingSession) {
      // Update existing session
      const { error } = await supabase
        .from('user_sessions')
        .update({
          last_activity: new Date().toISOString(),
          session_token: sessionToken
        })
        .eq('id', existingSession.id)

      if (error) {
        console.error('Error updating session:', error)
        return false
      }
    } else {
      // Create new session
      const { error } = await supabase
        .from('user_sessions')
        .insert({
          user_id: userId,
          auth_id: authId,
          session_token: sessionToken,
          is_active: true,
          last_activity: new Date().toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        })

      if (error) {
        console.error('Error creating session:', error)
        return false
      }
    }

    return true
  } catch (error) {
    console.error('Session creation error:', error)
    return false
  }
}

// Update session activity (heartbeat)
export async function updateSessionActivity(authId: string) {
  try {
    const { error } = await supabase
      .from('user_sessions')
      .update({
        last_activity: new Date().toISOString()
      })
      .eq('auth_id', authId)
      .eq('is_active', true)

    if (error) {
      console.error('Error updating session activity:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Session activity update error:', error)
    return false
  }
}

// End user session
export async function endUserSession(authId: string) {
  try {
    const { error } = await supabase
      .from('user_sessions')
      .update({
        is_active: false,
        last_activity: new Date().toISOString()
      })
      .eq('auth_id', authId)
      .eq('is_active', true)

    if (error) {
      console.error('Error ending session:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Session end error:', error)
    return false
  }
}

// Check if user is online
export async function isUserOnline(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('last_activity')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('last_activity', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      return false
    }

    // Consider user online if activity within last 5 minutes
    const lastActivity = new Date(data.last_activity).getTime()
    const now = new Date().getTime()
    const fiveMinutes = 5 * 60 * 1000

    return (now - lastActivity) < fiveMinutes
  } catch (error) {
    return false
  }
}

// Get all active users
export async function getActiveUsers(): Promise<string[]> {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from('user_sessions')
      .select('user_id')
      .eq('is_active', true)
      .gte('last_activity', fiveMinutesAgo)

    if (error || !data) {
      return []
    }

    return data.map(session => session.user_id)
  } catch (error) {
    console.error('Error getting active users:', error)
    return []
  }
}
