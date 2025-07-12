import React, { useEffect, useState } from 'react';
import { BarChart3, Calendar, Bell, Clock, Users, Search, ExternalLink } from 'lucide-react';
import { useProject } from '../contexts/ProjectContext';
import { supabase } from '../utils/supabase';

const DashboardPage = () => {
  const { 
    userProfile, 
    selectedProject, 
    selectedAccount,
    loading, 
    projectSwitching 
  } = useProject();

  const [error, setError] = useState<string | null>(null);

  // Get current date/time for display
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  if (loading || projectSwitching) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-12 bg-gray-200 rounded w-1/3"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-48 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Error Loading Dashboard</h2>
        <p className="text-red-500 mb-4">{error}</p>
        <p className="text-gray-600">Please try refreshing the page or contact support if the issue persists.</p>
      </div>
    );
  }

  const userName = userProfile?.full_name || userProfile?.email?.split('@')[0] || 'there';

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              {selectedProject && (
                <span className={`ml-3 text-xs px-2.5 py-1 rounded-full ${
                  selectedProject.project_type === 'template' 
                    ? 'bg-purple-100 text-purple-800' 
                    : selectedProject.project_type === 'main_site'
                    ? 'bg-green-100 text-green-800'
                    : selectedProject.project_type === 'landing_page'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {selectedProject.project_type === 'template' 
                    ? 'Template' 
                    : selectedProject.project_type === 'main_site' 
                    ? 'Main Site' 
                    : selectedProject.project_type === 'landing_page'
                    ? 'Landing Page'
                    : 'Site'}
                </span>
              )}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <p className="text-lg text-gray-600">
                <span className="font-semibold">{userName}</span>
              </p>
              {selectedProject && (
                <>
                  <span className="hidden sm:inline text-gray-400">•</span>
                  <p className="text-lg font-medium text-gray-800">
                    Editing <span className="text-primary-pink">{selectedProject.project_name}</span>
                    {selectedAccount && selectedAccount.business_name !== 'Wondrous Digital' && (
                      <span className="text-gray-600"> for {selectedAccount.business_name}</span>
                    )}
                  </p>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-500 bg-white py-2 px-4 rounded-full shadow-sm border border-gray-200">
            <Clock className="w-4 h-4 mr-2" />
            {currentDate}
          </div>
        </div>

        {/* Stats overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Website Visits</p>
                <h3 className="text-2xl font-bold text-gray-900">1,243</h3>
                <p className="text-xs text-green-600 mt-1">+12% from last period</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Upcoming Events</p>
                <h3 className="text-2xl font-bold text-gray-900">3</h3>
                <p className="text-xs text-gray-500 mt-1">Next: Strategy Meeting</p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Notifications</p>
                <h3 className="text-2xl font-bold text-gray-900">5</h3>
                <p className="text-xs text-gray-500 mt-1">2 unread messages</p>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <Bell className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-blue-50 rounded-md">
                <ExternalLink className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">External Tools</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Access your integrated marketing platforms and tools.
                </p>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                  View Integrations →
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-green-50 rounded-md">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Customer Management</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Manage your customer database and interactions.
                </p>
                <button className="text-sm font-medium text-green-600 hover:text-green-700">
                  View Customers →
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-purple-50 rounded-md">
                <Search className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">SEO Performance</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Check your website's search engine rankings.
                </p>
                <button className="text-sm font-medium text-purple-600 hover:text-purple-700">
                  View Rankings →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
            {selectedProject && (
              <span className="text-sm text-gray-500">
                {selectedProject.project_name}
              </span>
            )}
          </div>
          <div className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Bell className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-900">New contact form submission from John Doe</p>
                  <p className="text-xs text-gray-500">1 hour ago</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-900">Strategy meeting scheduled for tomorrow</p>
                  <p className="text-xs text-gray-500">3 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-900">Website traffic increased by 15% this week</p>
                  <p className="text-xs text-gray-500">Yesterday</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button className="text-sm font-medium text-gray-600 hover:text-gray-800">
                View all activity →
              </button>
            </div>
          </div>
        </div>
        
        {/* Recent Content Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Content</h2>
            {selectedProject && (
              <span className="text-sm text-gray-500">
                {selectedProject.project_name}
              </span>
            )}
          </div>
          <div>
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">How to Grow Your Local Business</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Blog Post</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Jan 15, 2024</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Published</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Customer Follow-ups Guide</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Blog Post</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Jan 10, 2024</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Published</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button className="text-sm font-medium text-gray-600 hover:text-gray-800">
                View all content →
              </button>
            </div>
          </div>
        </div>
      </div>
  );
};

export default DashboardPage;