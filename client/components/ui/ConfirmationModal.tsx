import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  itemName?: string;
  itemType: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

/**
 * A reusable confirmation modal component for confirming destructive actions like deletions.
 * 
 * @example
 * <ConfirmationModal
 *   isOpen={showModal}
 *   title="Delete Transaction"
 *   message="Are you sure you want to delete this transaction? This action cannot be undone."
 *   itemName="Coffee Purchase"
 *   itemType="transaction"
 *   onConfirm={handleDelete}
 *   onCancel={() => setShowModal(false)}
 *   isDeleting={isDeleting}
 * />
 */
export function ConfirmationModal({
  isOpen,
  title,
  message,
  itemName,
  itemType,
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isDeleting = false
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 relative animate-fade-in">
        <div className="flex items-center mb-4">
          {/* Warning Icon */}
          <div className="bg-red-100 dark:bg-red-900 rounded-full p-2 mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" 
              className="w-6 h-6 text-red-600 dark:text-red-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          
          {/* Title */}
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
        </div>
        
        {/* Message */}
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          {message}
        </p>
        
        {/* Item Details (if provided) */}
        {itemName && (
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {itemType.charAt(0).toUpperCase() + itemType.slice(1)} details:
            </p>
            <p className="font-medium text-gray-900 dark:text-white break-words">
              {itemName}
            </p>
          </div>
        )}
        
        {/* Warning Message */}
        <div className="text-sm text-red-500 dark:text-red-400 mb-5">
          This action cannot be undone.
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 
                      text-gray-800 dark:text-white rounded-md transition-colors"
            disabled={isDeleting}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors 
                      flex items-center justify-center min-w-[80px]"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deleting...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 