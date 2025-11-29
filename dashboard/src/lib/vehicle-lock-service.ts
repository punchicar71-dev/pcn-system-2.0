import { createClient } from '@/lib/supabase-client';
import { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Vehicle Lock Interface
 * Represents a lock on a vehicle in the database
 */
export interface VehicleLock {
  id: string;
  vehicle_id: string;
  locked_by_user_id: string;
  locked_by_name: string;
  lock_type: 'editing' | 'selling' | 'moving_to_soldout';
  locked_at: string;
  expires_at: string;
}

/**
 * Result of lock operations
 */
export interface VehicleLockResult {
  success: boolean;
  lock?: VehicleLock;
  error?: string;
  isLocked?: boolean;
  lockedBy?: string;
}

// Lock configuration
const LOCK_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const LOCK_EXTENSION_INTERVAL = 2 * 60 * 1000; // Extend every 2 minutes

/**
 * Vehicle Lock Service
 * Manages real-time vehicle locking to prevent concurrent edits
 */
export class VehicleLockService {
  private supabase = createClient();
  private lockExtensionInterval: NodeJS.Timeout | null = null;
  private realtimeChannel: RealtimeChannel | null = null;
  private currentLockId: string | null = null;

  /**
   * Attempt to acquire a lock on a vehicle
   * @param vehicleId - The vehicle ID to lock
   * @param lockType - Type of operation (editing, selling, moving_to_soldout)
   * @param userId - Current user's ID
   * @param userName - Current user's display name
   * @returns Promise with lock result
   */
  async acquireLock(
    vehicleId: string,
    lockType: VehicleLock['lock_type'],
    userId: string,
    userName: string
  ): Promise<VehicleLockResult> {
    try {
      // First, clean up any expired locks
      await this.cleanupExpiredLocks();

      // Check if vehicle is already locked
      const existingLock = await this.checkLock(vehicleId);
      if (existingLock.isLocked && existingLock.lock?.locked_by_user_id !== userId) {
        return {
          success: false,
          isLocked: true,
          lockedBy: existingLock.lock?.locked_by_name,
          error: `Vehicle is currently being ${this.getLockActionText(existingLock.lock?.lock_type || 'editing')} by ${existingLock.lock?.locked_by_name}`
        };
      }

      // If user already has the lock, just extend it
      if (existingLock.isLocked && existingLock.lock?.locked_by_user_id === userId) {
        const extended = await this.extendLock(existingLock.lock.id, vehicleId);
        if (extended) {
          this.currentLockId = existingLock.lock.id;
          this.startLockExtension(existingLock.lock.id, vehicleId);
          return {
            success: true,
            lock: existingLock.lock,
            isLocked: false
          };
        }
      }

      // Calculate expiration time
      const expiresAt = new Date(Date.now() + LOCK_DURATION_MS).toISOString();

      // Insert lock (will fail if already locked due to UNIQUE constraint)
      const { data, error } = await this.supabase
        .from('vehicle_locks')
        .insert({
          vehicle_id: vehicleId,
          locked_by_user_id: userId,
          locked_by_name: userName,
          lock_type: lockType,
          expires_at: expiresAt
        })
        .select()
        .single();

      if (error) {
        // Check if it's a unique constraint violation
        if (error.code === '23505') {
          const existingLock = await this.checkLock(vehicleId);
          return {
            success: false,
            isLocked: true,
            lockedBy: existingLock.lock?.locked_by_name,
            error: `Vehicle is already locked by another user`
          };
        }
        throw error;
      }

      // Store lock ID and start auto-extending
      this.currentLockId = data.id;
      this.startLockExtension(data.id, vehicleId);

      console.log(`✅ Lock acquired for vehicle ${vehicleId} by ${userName}`);

      return {
        success: true,
        lock: data,
        isLocked: false
      };
    } catch (error) {
      console.error('❌ Error acquiring vehicle lock:', error);
      return {
        success: false,
        error: 'Failed to acquire lock',
        isLocked: false
      };
    }
  }

  /**
   * Check if a vehicle is currently locked
   * @param vehicleId - The vehicle ID to check
   * @returns Promise with lock status
   */
  async checkLock(vehicleId: string): Promise<VehicleLockResult> {
    try {
      const { data, error } = await this.supabase
        .from('vehicle_locks')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (error) throw error;

      if (data) {
        return {
          success: true,
          isLocked: true,
          lock: data,
          lockedBy: data.locked_by_name
        };
      }

      return {
        success: true,
        isLocked: false
      };
    } catch (error) {
      console.error('❌ Error checking vehicle lock:', error);
      return {
        success: false,
        isLocked: false,
        error: 'Failed to check lock status'
      };
    }
  }

  /**
   * Release a lock on a vehicle
   * @param vehicleId - The vehicle ID to unlock
   * @param userId - Current user's ID
   * @returns Promise with release result
   */
  async releaseLock(vehicleId: string, userId: string): Promise<VehicleLockResult> {
    try {
      // Stop auto-extension
      this.stopLockExtension();

      const { error } = await this.supabase
        .from('vehicle_locks')
        .delete()
        .eq('vehicle_id', vehicleId)
        .eq('locked_by_user_id', userId);

      if (error) throw error;

      console.log(`✅ Lock released for vehicle ${vehicleId}`);

      return { success: true, isLocked: false };
    } catch (error) {
      console.error('❌ Error releasing vehicle lock:', error);
      return {
        success: false,
        error: 'Failed to release lock',
        isLocked: false
      };
    }
  }

  /**
   * Extend lock expiration (keep alive)
   * @private
   */
  private async extendLock(lockId: string, vehicleId: string): Promise<boolean> {
    try {
      const expiresAt = new Date(Date.now() + LOCK_DURATION_MS).toISOString();

      const { error } = await this.supabase
        .from('vehicle_locks')
        .update({ expires_at: expiresAt })
        .eq('id', lockId);

      if (error) {
        console.error('❌ Error extending lock:', error);
        return false;
      }

      console.log(`🔄 Lock extended for vehicle ${vehicleId}`);
      return true;
    } catch (error) {
      console.error('❌ Error extending lock:', error);
      return false;
    }
  }

  /**
   * Start auto-extending the lock
   * @private
   */
  private startLockExtension(lockId: string, vehicleId: string) {
    this.stopLockExtension(); // Clear any existing interval

    this.lockExtensionInterval = setInterval(() => {
      this.extendLock(lockId, vehicleId);
    }, LOCK_EXTENSION_INTERVAL);
  }

  /**
   * Stop auto-extending the lock
   * @private
   */
  private stopLockExtension() {
    if (this.lockExtensionInterval) {
      clearInterval(this.lockExtensionInterval);
      this.lockExtensionInterval = null;
    }
  }

  /**
   * Subscribe to vehicle lock changes (real-time)
   * @param vehicleId - The vehicle ID to monitor
   * @param onLockChange - Callback when lock status changes
   * @returns Cleanup function to unsubscribe
   */
  subscribeToLockChanges(
    vehicleId: string,
    onLockChange: (lock: VehicleLock | null) => void
  ): () => void {
    // Unsubscribe from any existing channel
    if (this.realtimeChannel) {
      this.realtimeChannel.unsubscribe();
    }

    this.realtimeChannel = this.supabase
      .channel(`vehicle-lock:${vehicleId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vehicle_locks',
          filter: `vehicle_id=eq.${vehicleId}`
        },
        (payload) => {
          console.log('🔔 Lock change detected:', payload.eventType);
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            onLockChange(payload.new as VehicleLock);
          } else if (payload.eventType === 'DELETE') {
            onLockChange(null);
          }
        }
      )
      .subscribe();

    // Return cleanup function
    return () => {
      this.realtimeChannel?.unsubscribe();
      this.stopLockExtension();
    };
  }

  /**
   * Clean up expired locks manually
   * @private
   */
  private async cleanupExpiredLocks() {
    try {
      const { error } = await this.supabase
        .from('vehicle_locks')
        .delete()
        .lt('expires_at', new Date().toISOString());

      if (error) {
        console.error('⚠️ Error cleaning up expired locks:', error);
      }
    } catch (error) {
      console.error('⚠️ Error cleaning up expired locks:', error);
    }
  }

  /**
   * Get human-readable action text for lock type
   * @private
   */
  private getLockActionText(lockType: string): string {
    switch (lockType) {
      case 'editing':
        return 'edited';
      case 'selling':
        return 'sold';
      case 'moving_to_soldout':
        return 'moved to sold-out';
      default:
        return 'processed';
    }
  }

  /**
   * Cleanup on unmount - releases lock and stops subscriptions
   */
  cleanup(vehicleId: string, userId: string) {
    this.stopLockExtension();
    this.realtimeChannel?.unsubscribe();
    this.realtimeChannel = null;
    this.currentLockId = null;
    
    // Release lock asynchronously (don't wait)
    this.releaseLock(vehicleId, userId).catch(err => {
      console.error('⚠️ Error during cleanup:', err);
    });
  }
}

/**
 * Singleton instance to avoid creating multiple service instances
 */
let lockServiceInstance: VehicleLockService | null = null;

/**
 * Get or create the singleton VehicleLockService instance
 */
export function getVehicleLockService(): VehicleLockService {
  if (!lockServiceInstance) {
    lockServiceInstance = new VehicleLockService();
  }
  return lockServiceInstance;
}
