/**
 * MIGRATING: Supabase Auth has been removed.
 * This file will be updated to work with Better Auth in Step 2.
 * Currently uses localStorage for user data during migration.
 * TODO: Replace with Better Auth session in Step 2.
 */
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { getVehicleLockService, VehicleLock } from '@/lib/vehicle-lock-service';
import { useToast } from '@/hooks/use-toast';
import { Lock, LockOpen } from 'lucide-react';

/**
 * Hook to manage vehicle locking for preventing concurrent edits
 * @param vehicleId - The vehicle ID to lock (null if no vehicle selected)
 * @param lockType - Type of operation (editing, selling, moving_to_soldout)
 * @param enabled - Whether locking is enabled (default: true)
 * @returns Lock state and control functions
 */
export function useVehicleLock(
  vehicleId: string | null,
  lockType: 'editing' | 'selling' | 'moving_to_soldout',
  enabled: boolean = true
) {
  const { toast } = useToast();
  const [isLocked, setIsLocked] = useState(false);
  const [lockedBy, setLockedBy] = useState<string | null>(null);
  const [hasMyLock, setHasMyLock] = useState(false);
  const [isAcquiring, setIsAcquiring] = useState(false);
  
  const lockService = useRef(getVehicleLockService());
  const cleanupRef = useRef<(() => void) | null>(null);
  const hasShownToast = useRef(false);

  /**
   * Get current user info from localStorage
   * MIGRATION: Using localStorage instead of Supabase Auth
   */
  const getUserInfo = useCallback(async () => {
    try {
      // MIGRATION: Using localStorage instead of Supabase Auth
      const storedUser = localStorage.getItem('pcn-user');
      if (!storedUser) return null;

      const userData = JSON.parse(storedUser);
      if (userData) {
        return {
          id: userData.auth_id || userData.id, // Use auth_id for compatibility
          name: `${userData.first_name} ${userData.last_name}`.trim() || userData.email || 'Unknown User'
        };
      }

      return null;
    } catch (error) {
      console.error('❌ Error getting user info:', error);
      return null;
    }
  }, []);

  /**
   * Acquire lock on the vehicle
   */
  const acquireLock = useCallback(async () => {
    if (!vehicleId || !enabled || isAcquiring) return false;

    setIsAcquiring(true);
    const userInfo = await getUserInfo();
    
    if (!userInfo) {
      console.error('❌ Cannot acquire lock: User not authenticated');
      setIsAcquiring(false);
      return false;
    }

    const result = await lockService.current.acquireLock(
      vehicleId,
      lockType,
      userInfo.id,
      userInfo.name
    );

    setIsAcquiring(false);

    if (result.success) {
      setHasMyLock(true);
      setIsLocked(false);
      hasShownToast.current = false;
      return true;
    } else {
      if (result.isLocked) {
        setIsLocked(true);
        setLockedBy(result.lockedBy || 'Another user');
        
        // Show toast only once
        if (!hasShownToast.current) {
          toast({
            variant: 'default',
            title: 'Vehicle Locked',
            description: `${result.lockedBy} is currently ${getLockActionText(lockType)} this vehicle`,
            duration: 5000,
          });
          hasShownToast.current = true;
        }
      }
      return false;
    }
  }, [vehicleId, enabled, isAcquiring, getUserInfo, lockType, toast]);

  /**
   * Release lock on the vehicle
   */
  const releaseLock = useCallback(async () => {
    if (!vehicleId || !enabled) return;

    const userInfo = await getUserInfo();
    if (!userInfo) return;

    await lockService.current.releaseLock(vehicleId, userInfo.id);
    setHasMyLock(false);
    setIsLocked(false);
    setLockedBy(null);
    hasShownToast.current = false;
  }, [vehicleId, enabled, getUserInfo]);

  /**
   * Subscribe to real-time lock changes
   */
  useEffect(() => {
    if (!vehicleId || !enabled) return;

    const userInfo = getUserInfo();

    // Check initial lock status
    userInfo.then((user) => {
      if (!user) return;
      
      lockService.current.checkLock(vehicleId).then((result) => {
        if (result.isLocked && result.lock?.locked_by_user_id !== user.id) {
          setIsLocked(true);
          setLockedBy(result.lockedBy || 'Another user');
        }
      });
    });

    // Subscribe to real-time changes
    const unsubscribe = lockService.current.subscribeToLockChanges(
      vehicleId,
      (lock) => {
        userInfo.then((user) => {
          if (!user) return;

          if (lock) {
            // Vehicle is locked
            if (lock.locked_by_user_id !== user.id) {
              setIsLocked(true);
              setLockedBy(lock.locked_by_name);
              
              // Show notification only if we haven't shown it yet
              if (!hasShownToast.current) {
                toast({
                  variant: 'default',
                  title: 'Vehicle Locked',
                  description: `${lock.locked_by_name} is currently ${getLockActionText(lock.lock_type)} this vehicle`,
                  duration: 5000,
                });
                hasShownToast.current = true;
              }
            }
          } else {
            // Vehicle is unlocked
            const wasLocked = isLocked;
            setIsLocked(false);
            setLockedBy(null);
            
            // Show unlock notification only if it was previously locked
            if (wasLocked && hasShownToast.current) {
              toast({
                variant: 'default',
                title: 'Vehicle Unlocked',
                description: 'You can now edit this vehicle',
                duration: 3000,
              });
            }
            hasShownToast.current = false;
          }
        });
      }
    );

    cleanupRef.current = unsubscribe;

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [vehicleId, enabled, getUserInfo, toast, isLocked]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (vehicleId && enabled && hasMyLock) {
        getUserInfo().then((user) => {
          if (user) {
            lockService.current.cleanup(vehicleId, user.id);
          }
        });
      }
    };
  }, [vehicleId, enabled, hasMyLock, getUserInfo]);

  return {
    isLocked,         // Is the vehicle locked by another user?
    lockedBy,         // Who has locked the vehicle?
    hasMyLock,        // Do I have the lock?
    isAcquiring,      // Am I currently trying to acquire the lock?
    acquireLock,      // Function to acquire lock
    releaseLock,      // Function to release lock
  };
}

/**
 * Helper function to get human-readable action text
 */
function getLockActionText(lockType: string): string {
  switch (lockType) {
    case 'editing':
      return 'editing';
    case 'selling':
      return 'selling';
    case 'moving_to_soldout':
      return 'moving to sold-out';
    default:
      return 'processing';
  }
}
