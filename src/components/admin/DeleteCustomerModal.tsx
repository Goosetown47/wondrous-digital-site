import React, { useState } from 'react';
import { X, AlertTriangle, Trash2, Info } from 'lucide-react';

interface Customer {
  id: string;
  business_name: string;
  contact_email: string;
  account_type: 'prospect' | 'customer' | 'inactive';
  project_count?: number;
}

interface DeleteCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onConfirm: () => void;
  isProcessing?: boolean;
}

const DeleteCustomerModal: React.FC<DeleteCustomerModalProps> = ({
  isOpen,
  onClose,
  customer,
  onConfirm,
  isProcessing = false
}) => {
  const [confirmText, setConfirmText] = useState('');

  // Reset confirmation text when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setConfirmText('');
    }
  }, [isOpen]);

  if (!isOpen || !customer) return null;

  // Determine if this customer can be deleted
  const canDelete = () => {
    // Only inactive accounts with no projects can be deleted
    return customer.account_type === 'inactive' && (customer.project_count === 0 || customer.project_count === undefined);
  };

  const getDeleteWarningMessage = () => {
    if (customer.project_count && customer.project_count > 0) {
      return `This account has ${customer.project_count} project${customer.project_count > 1 ? 's' : ''} associated with it. All projects must be deleted or reassigned before this account can be deleted.`;
    }

    if (customer.account_type !== 'inactive') {
      const statusMessages: Record<Customer['account_type'], string> = {
        'prospect': 'Prospect accounts must be set to inactive before they can be deleted.',
        'customer': 'Customer accounts must be set to inactive before they can be deleted.',
        'inactive': '' // This shouldn't happen as inactive can be deleted
      };
      return statusMessages[customer.account_type];
    }

    return 'This account will be permanently deleted. All account data including contact information and notes will be permanently removed. This action cannot be undone.';
  };

  const getModalTitle = () => {
    if (!canDelete()) {
      return 'Cannot Delete Account';
    }
    return 'Delete Account';
  };

  const getModalIcon = () => {
    if (!canDelete()) {
      return <Info className="h-6 w-6 text-blue-600" />;
    }
    return <AlertTriangle className="h-6 w-6 text-red-600" />;
  };

  const canConfirm = () => {
    if (!canDelete()) return false;
    // User must type the exact business name to confirm
    return confirmText === customer.business_name;
  };

  const handleConfirm = () => {
    if (canConfirm()) {
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getModalIcon()}
            <h2 className="text-lg font-semibold text-gray-900">{getModalTitle()}</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {/* Customer Info */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Account Details:</h3>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm">
                <span className="font-medium text-gray-900">{customer.business_name}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {customer.contact_email}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Status: {customer.account_type}
                {customer.project_count !== undefined && (
                  <span className="ml-2">
                    • {customer.project_count} project{customer.project_count !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <div className={`rounded-lg p-4 mb-4 ${
            !canDelete() 
              ? 'bg-blue-50 border border-blue-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex">
              {!canDelete() ? (
                <Info className="h-5 w-5 text-blue-400 flex-shrink-0" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
              )}
              <div className="ml-3">
                <p className={`text-sm ${
                  !canDelete() ? 'text-blue-800' : 'text-red-800'
                }`}>
                  {getDeleteWarningMessage()}
                </p>
              </div>
            </div>
          </div>

          {/* Confirmation Input */}
          {canDelete() && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="font-mono text-red-600">{customer.business_name}</span> to confirm:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                placeholder={`Type "${customer.business_name}" to confirm`}
                disabled={isProcessing}
                autoFocus
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          
          {canDelete() ? (
            <button
              onClick={handleConfirm}
              disabled={!canConfirm() || isProcessing}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:hover:bg-red-600"
            >
              {isProcessing ? (
                <span className="flex items-center">
                  <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                  Deleting...
                </span>
              ) : (
                <span className="flex items-center">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </span>
              )}
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Got it
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeleteCustomerModal;