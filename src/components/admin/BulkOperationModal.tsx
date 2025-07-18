import React, { useState } from 'react';
import { X, AlertTriangle, Info } from 'lucide-react';
import StatusDropdown from './StatusDropdown';
import { bulkOperationSchema } from '../../schemas';

interface Project {
  id: string;
  project_name: string;
  project_status: string;
  business_name?: string | null;
}

interface BulkOperationModalProps {
  isOpen: boolean;
  onClose: () => void;
  operation: 'change-status' | 'archive' | 'delete';
  projects: Project[];
  onConfirm: (data: { newStatus?: string }) => void;
  isProcessing?: boolean;
  statusOptions?: Array<{ value: string; label: string; color: string }>;
}

const BulkOperationModal: React.FC<BulkOperationModalProps> = ({
  isOpen,
  onClose,
  operation,
  projects,
  onConfirm,
  isProcessing = false,
  statusOptions
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    // NEW: Parallel Zod validation for bulk operations
    const bulkOpData = {
      project_ids: projects.map(p => p.id),
      operation
    };
    
    // Validate bulk operation data
    const zodResult = bulkOperationSchema.safeParse(bulkOpData);
    if (!zodResult.success) {
      console.debug('Bulk operation validation failed:', zodResult.error.format());
    }
    
    // Continue with existing logic
    if (operation === 'change-status' && selectedStatus) {
      onConfirm({ newStatus: selectedStatus });
    } else if (operation === 'archive') {
      onConfirm({});
    } else if (operation === 'delete' && deleteConfirmText === 'DELETE') {
      onConfirm({});
    }
  };

  const canConfirm = () => {
    if (operation === 'change-status') return !!selectedStatus;
    if (operation === 'delete') return deleteConfirmText === 'DELETE';
    return true;
  };

  const getModalTitle = () => {
    switch (operation) {
      case 'change-status':
        return 'Change Status for Multiple Projects';
      case 'archive':
        return 'Archive Multiple Projects';
      case 'delete':
        return 'Delete Multiple Projects';
    }
  };

  const getModalIcon = () => {
    switch (operation) {
      case 'change-status':
        return <Info className="h-6 w-6 text-blue-600" />;
      case 'archive':
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
      case 'delete':
        return <AlertTriangle className="h-6 w-6 text-red-600" />;
    }
  };

  const defaultStatusOptions = [
    { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
    { value: 'template-internal', label: 'Template (Internal)', color: 'bg-purple-100 text-purple-800' },
    { value: 'template-public', label: 'Template (Public)', color: 'bg-purple-100 text-purple-800' },
    { value: 'prospect-staging', label: 'Prospect Staging', color: 'bg-blue-100 text-blue-800' },
    { value: 'live-customer', label: 'Live Customer', color: 'bg-green-100 text-green-800' },
    { value: 'paused-maintenance', label: 'Maintenance', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'archived', label: 'Archived', color: 'bg-gray-100 text-gray-800' }
  ];

  const options = statusOptions || defaultStatusOptions;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
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
        <div className="px-6 py-4 flex-1 overflow-y-auto">
          {/* Operation-specific content */}
          {operation === 'change-status' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select new status for {projects.length} project{projects.length !== 1 ? 's' : ''}:
                </label>
                <StatusDropdown
                  value={selectedStatus}
                  options={options}
                  onChange={setSelectedStatus}
                  className="w-fit"
                />
              </div>
            </div>
          )}

          {operation === 'archive' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                You are about to archive {projects.length} project{projects.length !== 1 ? 's' : ''}. 
                Archived projects can be restored later if needed.
              </p>
            </div>
          )}

          {operation === 'delete' && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Warning: This action cannot be undone
                    </h3>
                    <p className="mt-2 text-sm text-red-700">
                      You are about to permanently delete {projects.length} project{projects.length !== 1 ? 's' : ''}. 
                      All project data, pages, and settings will be permanently removed.
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type <span className="font-mono text-red-600">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  placeholder="Type DELETE to confirm"
                />
              </div>
            </div>
          )}

          {/* Project list */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Affected Projects ({projects.length}):
            </h3>
            <div className="bg-gray-50 rounded-lg p-3 max-h-64 overflow-y-auto">
              <ul className="space-y-2">
                {projects.map((project) => (
                  <li key={project.id} className="text-sm">
                    <span className="font-medium text-gray-900">{project.project_name}</span>
                    {project.business_name && (
                      <span className="text-gray-500 ml-2">({project.business_name})</span>
                    )}
                    <span className="text-gray-500 ml-2">- {project.project_status}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
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
          <button
            onClick={handleConfirm}
            disabled={!canConfirm() || isProcessing}
            className={`
              px-4 py-2 text-sm font-medium text-white rounded-md disabled:opacity-50
              ${operation === 'delete' 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-blue-600 hover:bg-blue-700'
              }
            `}
          >
            {isProcessing ? (
              <span className="flex items-center">
                <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                Processing...
              </span>
            ) : (
              operation === 'delete' ? 'Delete Projects' : 'Confirm'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkOperationModal;