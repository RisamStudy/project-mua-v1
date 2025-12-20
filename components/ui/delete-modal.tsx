"use client";

import { Button } from './button';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  loading?: boolean;
}

export default function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  loading = false,
}: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        {/* Icon */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 mb-4">
          <span className="material-symbols-outlined text-red-500 text-3xl">
            warning
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>

        {/* Description */}
        <p className="text-gray-400 mb-6">{description}</p>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined animate-spin text-sm">
                  refresh
                </span>
                Deleting...
              </span>
            ) : (
              'Delete'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}