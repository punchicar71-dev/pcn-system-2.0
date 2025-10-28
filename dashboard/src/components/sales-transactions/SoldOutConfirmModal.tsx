'use client';

import { X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface SoldOutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function SoldOutConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  isLoading = false 
}: SoldOutConfirmModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[550px] p-0">
        <div className="p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[24px] font-bold text-gray-900">Are you done selling process?</h2>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
             
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4 mb-6">
            <p className="text-gray-600 text-[16px]">
              Those vehicle details permanently move sold out table ?<br />
              This action cannot be undone.
            </p>
            
            {/* Note Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 font-medium">
                Note: Vehicle images have been automatically removed after sale completion.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 bg-green-600 hover:bg-green-800 text-white font-semibold py-4 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : 'Sold Out'}
            </button>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 bg-white hover:bg-gray-50 text-gray-900 font-semibold py-4 px-6 rounded-lg border-2 border-gray-300 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
