import React from 'react';
import { FileText } from 'lucide-react';

interface TemplateSectionPlaceholderProps {
  sectionType: string;
  sectionId: string;
}

const TemplateSectionPlaceholder: React.FC<TemplateSectionPlaceholderProps> = ({ 
  sectionType, 
  sectionId 
}) => {
  return (
    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12">
      <div className="flex flex-col items-center justify-center text-center">
        <FileText className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          Template Section: {sectionType}
        </h3>
        <p className="text-sm text-gray-500 max-w-md">
          This section uses an HTML template. Switch to Preview Mode to see the rendered content.
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Section ID: {sectionId}
        </p>
      </div>
    </div>
  );
};

export default TemplateSectionPlaceholder;