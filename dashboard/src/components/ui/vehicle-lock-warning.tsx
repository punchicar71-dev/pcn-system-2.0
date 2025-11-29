'use client';

import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VehicleLockWarningProps {
  isLocked: boolean;
  lockedBy?: string | null;
  lockType?: string;
  className?: string;
}

/**
 * Vehicle Lock Warning Component
 * Shows a warning banner when a vehicle is locked by another user
 */
export function VehicleLockWarning({ 
  isLocked, 
  lockedBy, 
  lockType = 'processing',
  className 
}: VehicleLockWarningProps) {
  if (!isLocked || !lockedBy) return null;

  const actionText = getLockActionText(lockType);

  return (
    <div
      className={cn(
        "mb-6 flex items-start gap-3 rounded-lg border border-yellow-300 bg-yellow-50 p-4 shadow-sm",
        className
      )}
      role="alert"
    >
      <Lock className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h3 className="font-semibold text-yellow-900 text-sm mb-1">
          Vehicle Currently Locked
        </h3>
        <p className="text-sm text-yellow-800">
          <span className="font-medium">{lockedBy}</span> is currently {actionText} this vehicle. 
          Please wait until they complete their action.
        </p>
      </div>
    </div>
  );
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
