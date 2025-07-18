import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'info', 
  duration = 5000, 
  onClose 
}) => {
  // Removed auto-dismiss functionality - toasts now require manual dismissal

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-400" />,
    error: <XCircle className="h-5 w-5 text-red-400" />,
    info: <AlertCircle className="h-5 w-5 text-blue-400" />
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200'
  };

  const textColors = {
    success: 'text-green-800',
    error: 'text-red-800',
    info: 'text-blue-800'
  };

  return (
    <div className={`flex items-center p-4 rounded-lg shadow-lg border ${bgColors[type]} min-w-[300px] max-w-md`}>
      <div className="flex-shrink-0 mr-3">
        {icons[type]}
      </div>
      <div className={`flex-1 text-sm font-medium ${textColors[type]}`}>
        {message}
      </div>
      <button
        onClick={onClose}
        className={`ml-4 flex-shrink-0 ${textColors[type]} hover:opacity-70 transition-opacity`}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Toast;