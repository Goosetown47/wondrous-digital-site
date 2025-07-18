import React from 'react';
import { X, Rocket, AlertCircle, Clock } from 'lucide-react';

interface DeployPlaceholderModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    id: string;
    project_name: string;
    project_status: string;
  } | null;
}

const DeployPlaceholderModal: React.FC<DeployPlaceholderModalProps> = ({
  isOpen,
  onClose,
  project
}) => {
  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Rocket className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Deploy Project</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {/* Project Info */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Project:</h3>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm">
                <span className="font-medium text-gray-900">{project.project_name}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Status: {project.project_status}
              </div>
            </div>
          </div>

          {/* Coming Soon Message */}
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex">
              <Clock className="h-5 w-5 text-blue-400 flex-shrink-0" />
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-900">Coming Soon!</h4>
                <p className="text-sm text-blue-800 mt-1">
                  Netlify deployment integration will be available in Phase 3 of development.
                </p>
              </div>
            </div>
          </div>

          {/* Feature Preview */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">When available, you'll be able to:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                Deploy to custom subdomains (e.g., business-name.wondrousdigital.com)
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                Manage custom domains for live customer sites
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                One-click deployment with automatic SSL certificates
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                Deploy maintenance pages when needed
              </li>
            </ul>
          </div>

          {/* Info Note */}
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">
                  For now, projects are saved locally and can be edited using the View/Edit button.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeployPlaceholderModal;