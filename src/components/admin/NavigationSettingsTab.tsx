import React, { useState, useEffect } from 'react';
import { Navigation, LayoutTemplate, AlertCircle, Check } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { useProject } from '../../contexts/ProjectContext';

interface NavigationSettingsTabProps {
  sectionId: string;
  sectionType: string;
}

const NavigationSettingsTab: React.FC<NavigationSettingsTabProps> = ({
  sectionId,
  sectionType
}) => {
  const { selectedProject, refetchProject } = useProject();
  const [isGlobalNav, setIsGlobalNav] = useState(false);
  const [isGlobalFooter, setIsGlobalFooter] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedProject) {
      setIsGlobalNav(selectedProject.global_nav_section_id === sectionId);
      setIsGlobalFooter(selectedProject.global_footer_section_id === sectionId);
    }
  }, [selectedProject, sectionId]);

  const handleGlobalNavChange = async (checked: boolean) => {
    if (!selectedProject) return;

    setLoading(true);
    setError(null);

    // Debug logging
    console.log('🔍 Global Nav Update Debug Info:');
    console.log('  - sectionId:', sectionId);
    console.log('  - sectionType:', sectionType);
    console.log('  - selectedProject.id:', selectedProject.id);
    console.log('  - checked:', checked);
    console.log('  - selectedProject:', selectedProject);

    try {
      const updateData = { 
        global_nav_section_id: checked ? sectionId : null 
      };
      console.log('  - updateData:', updateData);

      const { data, error: updateError } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', selectedProject.id)
        .select();

      console.log('  - Supabase response data:', data);
      console.log('  - Supabase response error:', updateError);

      if (updateError) {
        console.error('❌ Supabase error details:', {
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
          code: updateError.code
        });
        throw updateError;
      }

      setIsGlobalNav(checked);
      await refetchProject();
      console.log('✅ Global navigation updated successfully');
    } catch (err) {
      console.error('❌ Full error object:', err);
      setError(`Failed to update global navigation setting: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGlobalFooterChange = async (checked: boolean) => {
    if (!selectedProject) return;

    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('projects')
        .update({ 
          global_footer_section_id: checked ? sectionId : null 
        })
        .eq('id', selectedProject.id);

      if (updateError) throw updateError;

      setIsGlobalFooter(checked);
      await refetchProject();
    } catch (err) {
      console.error('Error updating global footer:', err);
      setError('Failed to update global footer setting');
    } finally {
      setLoading(false);
    }
  };

  // Only show navigation settings for navigation-related sections
  const isNavigationSection = sectionType && (
    sectionType.toLowerCase().includes('navigation') || 
    sectionType.toLowerCase().includes('navbar') || 
    sectionType.toLowerCase().includes('footer')
  );

  // Debug logging for section type detection
  console.log('🔍 Navigation Section Detection:');
  console.log('  - sectionType:', sectionType);
  console.log('  - sectionType (lowercase):', sectionType?.toLowerCase());
  console.log('  - isNavigationSection:', isNavigationSection);
  console.log('  - includes "navigation":', sectionType?.toLowerCase().includes('navigation'));
  console.log('  - includes "navbar":', sectionType?.toLowerCase().includes('navbar'));
  console.log('  - includes "footer":', sectionType?.toLowerCase().includes('footer'));
  
  if (!isNavigationSection) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-500">
          Navigation settings are only available for navigation sections.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-1">
          Global Navigation Settings
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Configure this navigation section to appear on all pages of your website.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Global Navigation Bar */}
        <div className="border border-gray-200 rounded-lg p-4">
          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              checked={isGlobalNav}
              onChange={(e) => handleGlobalNavChange(e.target.checked)}
              disabled={loading}
              className="mt-1 mr-3"
            />
            <div className="flex-1">
              <div className="flex items-center">
                <Navigation className="h-5 w-5 text-gray-600 mr-2" />
                <span className="font-medium text-gray-900">
                  Use as Global Navigation Bar
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                This section will appear at the top of every page as the main navigation bar.
              </p>
              {isGlobalNav && (
                <div className="mt-2 flex items-center text-green-600">
                  <Check className="h-4 w-4 mr-1" />
                  <span className="text-sm">Currently active as global navigation</span>
                </div>
              )}
            </div>
          </label>
        </div>

        {/* Global Footer */}
        <div className="border border-gray-200 rounded-lg p-4">
          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              checked={isGlobalFooter}
              onChange={(e) => handleGlobalFooterChange(e.target.checked)}
              disabled={loading}
              className="mt-1 mr-3"
            />
            <div className="flex-1">
              <div className="flex items-center">
                <LayoutTemplate className="h-5 w-5 text-gray-600 mr-2" />
                <span className="font-medium text-gray-900">
                  Use as Global Footer
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                This section will appear at the bottom of every page as the main footer.
              </p>
              {isGlobalFooter && (
                <div className="mt-2 flex items-center text-green-600">
                  <Check className="h-4 w-4 mr-1" />
                  <span className="text-sm">Currently active as global footer</span>
                </div>
              )}
            </div>
          </label>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
          <div>
            <p className="text-sm text-blue-900 font-medium">Important Notes:</p>
            <ul className="mt-2 text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Only one section can be set as the global navigation bar</li>
              <li>Only one section can be set as the global footer</li>
              <li>Global sections automatically appear on all existing and new pages</li>
              <li>Global sections cannot be deleted while they are active</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationSettingsTab;