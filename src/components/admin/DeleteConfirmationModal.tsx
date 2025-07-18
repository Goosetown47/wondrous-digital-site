import React, { useState } from 'react';
import { X, AlertTriangle, Trash2, Info } from 'lucide-react';

interface Project {
  id: string;
  project_name: string;
  project_status: string;
  business_name?: string | null;
}

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onConfirm: () => void;
  isProcessing?: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  project,
  onConfirm,
  isProcessing = false
}) => {
  const [confirmText, setConfirmText] = useState('');

  if (!isOpen || !project) return null;

  // Determine if this project can be deleted and what confirmation is needed
  const canDelete = () => {
    return project.project_status === 'draft' || project.project_status === 'archived';
  };

  const needsStrongConfirmation = () => {
    return project.project_status === 'archived';
  };

  const getRequiredConfirmText = () => {
    if (needsStrongConfirmation()) {
      return project.project_name;
    }
    return '';
  };

  const getDeleteWarningMessage = () => {
    if (!canDelete()) {
      const statusMessages: Record<string, string> = {
        'template-internal': 'Templates must be archived before they can be deleted.',
        'template-public': 'Public templates must be archived before they can be deleted.',
        'prospect-staging': 'Prospect sites must be archived before they can be deleted.',
        'live-customer': 'Live customer sites must be set to maintenance, then archived before they can be deleted.',
        'paused-maintenance': 'Sites in maintenance must be archived before they can be deleted.'
      };
      return statusMessages[project.project_status] || 'This project must be archived before it can be deleted.';
    }

    if (project.project_status === 'draft') {
      return 'This draft project will be permanently deleted. This action cannot be undone.';
    }

    return 'This archived project will be permanently deleted. All project data, pages, and settings will be permanently removed.';
  };

  const getModalTitle = () => {
    if (!canDelete()) {
      return 'Cannot Delete Project';
    }
    return 'Delete Project';
  };

  const getModalIcon = () => {
    if (!canDelete()) {
      return <Info className="h-6 w-6 text-blue-600" />;
    }
    return <AlertTriangle className="h-6 w-6 text-red-600" />;
  };

  const canConfirm = () => {
    if (!canDelete()) return false;
    if (needsStrongConfirmation()) {
      return confirmText === getRequiredConfirmText();
    }
    return true;
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
          {/* Project Info */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Project Details:</h3>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm">
                <span className="font-medium text-gray-900">{project.project_name}</span>
                {project.business_name && (
                  <span className="text-gray-500 ml-2">({project.business_name})</span>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Status: {project.project_status}
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

          {/* Confirmation Input for Strong Confirmation */}
          {canDelete() && needsStrongConfirmation() && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="font-mono text-red-600">{getRequiredConfirmText()}</span> to confirm:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                placeholder={`Type "${getRequiredConfirmText()}" to confirm`}
                disabled={isProcessing}
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
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {isProcessing ? (
                <span className="flex items-center">
                  <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                  Deleting...
                </span>
              ) : (
                <span className="flex items-center">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Project
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

export default DeleteConfirmationModal;