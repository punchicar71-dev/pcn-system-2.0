import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

// Create or update user session - updates last_activity in users table
export async function createUserSession(userId: string, authId: string, sessionToken: string) {
  try {
    // Update last_activity in users table using user's id
    const { error } = await supabase
      .from('users')
      .update({
        last_activity: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      console.error('Error updating user activity:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Session creation error:', error)
    return false
  }
}

// Update session activity (heartbeat) - updates last_activity in users table
export async function updateSessionActivity(userId: string) {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        last_activity: new Date().toISOString()
      })
      .eq('id', userId)

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

// End user session - clears last_activity to mark user as offline
export async function endUserSession(userId: string) {
  try {
    // Set last_activity to null or a past time to mark as offline
    const { error } = await supabase
      .from('users')
      .update({
        last_activity: null
      })
      .eq('id', userId)

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

// Check if user is online based on last_activity
export async function isUserOnline(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('last_activity')
      .eq('id', userId)
      .single()

    if (error || !data || !data.last_activity) {
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

// Get all active users (users with last_activity within 5 minutes)
export async function getActiveUsers(): Promise<string[]> {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from('users')
      .select('id')
      .not('last_activity', 'is', null)
      .gte('last_activity', fiveMinutesAgo)

    if (error || !data) {
      return []
    }

    return data.map(user => user.id)
  } catch (error) {
    console.error('Error getting active users:', error)
    return []
  }
}
