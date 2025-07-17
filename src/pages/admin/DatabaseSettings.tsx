import React, { useState } from 'react';
import { Database } from 'lucide-react';
import SectionTypesTab from '../../components/admin/database-settings/SectionTypesTab';
import CategoriesTab from '../../components/admin/database-settings/CategoriesTab';

type TabKey = 'section-types' | 'categories';

interface Tab {
  key: TabKey;
  label: string;
  description: string;
}

const tabs: Tab[] = [
  {
    key: 'section-types',
    label: 'Section Types',
    description: 'Manage available section types for the page builder'
  },
  {
    key: 'categories',
    label: 'Categories',
    description: 'Manage categories for organizing section templates'
  }
];

const DatabaseSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('section-types');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <Database className="h-6 w-6 text-gray-700 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Database Settings</h1>
                <p className="text-sm text-gray-500 mt-1">Manage system-wide settings and configurations</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.key
                    ? 'border-primary-pink text-primary-pink'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Tab Description */}
          <div className="mb-6">
            <p className="text-gray-600">
              {tabs.find(tab => tab.key === activeTab)?.description}
            </p>
          </div>

          {/* Tab Component */}
          {activeTab === 'section-types' && <SectionTypesTab />}
          {activeTab === 'categories' && <CategoriesTab />}
        </div>
      </div>
    </div>
  );
};

export default DatabaseSettings;