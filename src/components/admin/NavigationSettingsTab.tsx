import React, { useState, useEffect } from 'react';
import { Navigation, LayoutTemplate, AlertCircle, Check } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { useProject } from '../../contexts/ProjectContext';

interface NavigationSettingsTabProps {
  sectionId: string;
  sectionType: string;
  onModalOpen?: () => void; // Optional callback when modal opens
  sectionData?: any; // The full section data
  pageId?: string; // Current page ID
  onSectionPromoted?: () => void; // Callback when section is promoted to global
  onSectionDemoted?: () => void; // Callback when section is demoted from global
}

const NavigationSettingsTab: React.FC<NavigationSettingsTabProps> = ({
  sectionId,
  sectionType,
  onModalOpen,
  sectionData,
  pageId,
  onSectionPromoted,
  onSectionDemoted
}) => {
  const { selectedProject, refetchProject } = useProject();
  const [isGlobalNav, setIsGlobalNav] = useState(false);
  const [isGlobalFooter, setIsGlobalFooter] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Call onModalOpen callback when component mounts
  useEffect(() => {
    if (onModalOpen) {
      onModalOpen();
    }
  }, []); // Run once on mount only

  useEffect(() => {
    const checkGlobalSectionStatus = async () => {
      console.log('🔍 Checking global section status for sectionId:', sectionId);
      console.log('🔍 Current selectedProject:', selectedProject);
      
      if (!selectedProject) {
        console.log('🔍 No selected project, setting states to false');
        setIsGlobalNav(false);
        setIsGlobalFooter(false);
        return;
      }

      try {
        // Check if this section is the global nav section
        console.log('🔍 Checking global nav section ID:', selectedProject.global_nav_section_id);
        if (selectedProject.global_nav_section_id) {
          const { data: navSection, error: navError } = await supabase
            .from('page_sections')
            .select('content')
            .eq('id', selectedProject.global_nav_section_id)
            .single();
          
          console.log('🔍 Nav section data:', navSection);
          console.log('🔍 Nav section error:', navError);
          
          // Check if this section's pageBuilderSectionId matches the passed sectionId
          const isCurrentGlobalNav = navSection?.content?.pageBuilderSectionId === sectionId;
          console.log('🔍 Is current global nav?', isCurrentGlobalNav);
          console.log('🔍 Comparison (pageBuilderSectionId):', navSection?.content?.pageBuilderSectionId, '===', sectionId);
          setIsGlobalNav(isCurrentGlobalNav);
        } else {
          console.log('🔍 No global nav section ID, setting to false');
          setIsGlobalNav(false);
        }

        // Check if this section is the global footer section
        console.log('🔍 Checking global footer section ID:', selectedProject.global_footer_section_id);
        if (selectedProject.global_footer_section_id) {
          const { data: footerSection, error: footerError } = await supabase
            .from('page_sections')
            .select('content')
            .eq('id', selectedProject.global_footer_section_id)
            .single();
          
          console.log('🔍 Footer section data:', footerSection);
          console.log('🔍 Footer section error:', footerError);
          
          // Check if this section's pageBuilderSectionId matches the passed sectionId
          const isCurrentGlobalFooter = footerSection?.content?.pageBuilderSectionId === sectionId;
          console.log('🔍 Is current global footer?', isCurrentGlobalFooter);
          console.log('🔍 Comparison (pageBuilderSectionId):', footerSection?.content?.pageBuilderSectionId, '===', sectionId);
          setIsGlobalFooter(isCurrentGlobalFooter);
        } else {
          console.log('🔍 No global footer section ID, setting to false');
          setIsGlobalFooter(false);
        }
      } catch (error) {
        console.error('❌ Error checking global section status:', error);
        setIsGlobalNav(false);
        setIsGlobalFooter(false);
      }
    };

    // Force a small delay to ensure latest project data is available
    const timeoutId = setTimeout(checkGlobalSectionStatus, 100);
    return () => clearTimeout(timeoutId);
  }, [selectedProject, sectionId, selectedProject?.global_nav_section_id, selectedProject?.global_footer_section_id]);

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
      let globalNavSectionId = null;

      if (checked) {
        // PROMOTING TO GLOBAL NAV
        console.log('🔄 Promoting section to global navigation');
        
        // First, get the current section data from the page
        if (!sectionData && pageId) {
          // Fetch section data from current page if not provided
          const { data: pageData, error: pageError } = await supabase
            .from('pages')
            .select('sections')
            .eq('id', pageId)
            .single();
            
          if (pageError) {
            console.error('Error fetching page data:', pageError);
            throw pageError;
          }
          
          const currentSection = pageData.sections?.find((s: any) => s.id === sectionId);
          if (!currentSection) {
            throw new Error('Section not found in page');
          }
          sectionData = currentSection;
        }
        
        // Create new page_sections record with the full section data
        console.log('🆕 Creating page_sections record');
        console.log('📋 Section data being stored:', sectionData);
        const { data: newSection, error: createError } = await supabase
          .from('page_sections')
          .insert({
            project_id: selectedProject.id,
            section_type: sectionType,
            content: {
              ...sectionData, // Include all section data
              id: sectionData?.id || sectionId, // Ensure the original section id is preserved
              pageBuilderSectionId: sectionId,
              template_name: `Global ${sectionType} Section`,
              created_from_page_builder: true
            },
            order_index: 0
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating page_sections record:', createError);
          throw createError;
        }

        globalNavSectionId = newSection.id;
        console.log('✅ Created new page_sections record:', globalNavSectionId);
        
        // Remove section from current page
        if (pageId) {
          console.log('🗑️ Removing section from current page');
          try {
            const { data: pageData, error: pageError } = await supabase
              .from('pages')
              .select('sections')
              .eq('id', pageId)
              .single();
              
            if (pageError) {
              console.error('Error fetching page data for removal:', pageError);
              throw new Error(`Failed to fetch page data: ${pageError.message}`);
            }
            
            if (pageData) {
              const updatedSections = pageData.sections?.filter((s: any) => s.id !== sectionId) || [];
              console.log(`📊 Removing section from page - Original sections: ${pageData.sections?.length || 0}, Updated sections: ${updatedSections.length}`);
              
              const { error: updateError } = await supabase
                .from('pages')
                .update({ sections: updatedSections })
                .eq('id', pageId);
                
              if (updateError) {
                console.error('Error updating page sections:', updateError);
                // Rollback by deleting the created page_sections record
                if (globalNavSectionId) {
                  await supabase
                    .from('page_sections')
                    .delete()
                    .eq('id', globalNavSectionId);
                }
                throw new Error(`Failed to remove section from page: ${updateError.message}`);
              }
              console.log('✅ Successfully removed section from page');
            }
          } catch (error) {
            console.error('❌ Failed to remove section from page:', error);
            throw error;
          }
        }
      } else {
        // DEMOTING FROM GLOBAL NAV
        console.log('🔄 Demoting section from global navigation');
        
        // Get the global nav section data
        if (selectedProject.global_nav_section_id) {
          const { data: globalSection, error: fetchError } = await supabase
            .from('page_sections')
            .select('content')
            .eq('id', selectedProject.global_nav_section_id)
            .single();
            
          if (!fetchError && globalSection && pageId) {
            // Add section back to current page
            console.log('➕ Adding section back to current page');
            const { data: pageData, error: pageError } = await supabase
              .from('pages')
              .select('sections')
              .eq('id', pageId)
              .single();
              
            if (!pageError && pageData) {
              const updatedSections = [...(pageData.sections || []), globalSection.content];
              
              const { error: updateError } = await supabase
                .from('pages')
                .update({ sections: updatedSections })
                .eq('id', pageId);
                
              if (updateError) {
                console.error('Error updating page sections:', updateError);
              }
            }
          }
          
          // Delete the page_sections record
          console.log('🗑️ Deleting page_sections record');
          const { error: deleteError } = await supabase
            .from('page_sections')
            .delete()
            .eq('id', selectedProject.global_nav_section_id);
            
          if (deleteError) {
            console.error('Error deleting page_sections record:', deleteError);
          }
        }
      }

      const updateData = { 
        global_nav_section_id: globalNavSectionId
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
      console.log('🔄 Refetching project data...');
      await refetchProject();
      console.log('✅ Global navigation updated successfully');
      
      // Call appropriate callback
      if (checked && onSectionPromoted) {
        onSectionPromoted();
      } else if (!checked && onSectionDemoted) {
        onSectionDemoted();
      }
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

    console.log('🔍 Global Footer Update Debug Info:');
    console.log('  - sectionId:', sectionId);
    console.log('  - sectionType:', sectionType);
    console.log('  - selectedProject.id:', selectedProject.id);
    console.log('  - checked:', checked);

    try {
      let globalFooterSectionId = null;

      if (checked) {
        // PROMOTING TO GLOBAL FOOTER
        console.log('🔄 Promoting section to global footer');
        
        // First, get the current section data from the page
        if (!sectionData && pageId) {
          // Fetch section data from current page if not provided
          const { data: pageData, error: pageError } = await supabase
            .from('pages')
            .select('sections')
            .eq('id', pageId)
            .single();
            
          if (pageError) {
            console.error('Error fetching page data:', pageError);
            throw pageError;
          }
          
          const currentSection = pageData.sections?.find((s: any) => s.id === sectionId);
          if (!currentSection) {
            throw new Error('Section not found in page');
          }
          sectionData = currentSection;
        }
        
        // Create new page_sections record with the full section data
        console.log('🆕 Creating page_sections record for footer');
        console.log('📋 Section data being stored:', sectionData);
        const { data: newSection, error: createError } = await supabase
          .from('page_sections')
          .insert({
            project_id: selectedProject.id,
            section_type: sectionType,
            content: {
              ...sectionData, // Include all section data
              id: sectionData?.id || sectionId, // Ensure the original section id is preserved
              pageBuilderSectionId: sectionId,
              template_name: `Global ${sectionType} Section`,
              created_from_page_builder: true
            },
            order_index: 0
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating page_sections record for footer:', createError);
          throw createError;
        }

        globalFooterSectionId = newSection.id;
        console.log('✅ Created new page_sections record for footer:', globalFooterSectionId);
        
        // Remove section from current page
        if (pageId) {
          console.log('🗑️ Removing section from current page');
          try {
            const { data: pageData, error: pageError } = await supabase
              .from('pages')
              .select('sections')
              .eq('id', pageId)
              .single();
              
            if (pageError) {
              console.error('Error fetching page data for removal:', pageError);
              throw new Error(`Failed to fetch page data: ${pageError.message}`);
            }
            
            if (pageData) {
              const updatedSections = pageData.sections?.filter((s: any) => s.id !== sectionId) || [];
              console.log(`📊 Removing section from page - Original sections: ${pageData.sections?.length || 0}, Updated sections: ${updatedSections.length}`);
              
              const { error: updateError } = await supabase
                .from('pages')
                .update({ sections: updatedSections })
                .eq('id', pageId);
                
              if (updateError) {
                console.error('Error updating page sections:', updateError);
                // Rollback by deleting the created page_sections record
                if (globalFooterSectionId) {
                  await supabase
                    .from('page_sections')
                    .delete()
                    .eq('id', globalFooterSectionId);
                }
                throw new Error(`Failed to remove section from page: ${updateError.message}`);
              }
              console.log('✅ Successfully removed section from page');
            }
          } catch (error) {
            console.error('❌ Failed to remove section from page:', error);
            throw error;
          }
        }
      } else {
        // DEMOTING FROM GLOBAL FOOTER
        console.log('🔄 Demoting section from global footer');
        
        // Get the global footer section data
        if (selectedProject.global_footer_section_id) {
          const { data: globalSection, error: fetchError } = await supabase
            .from('page_sections')
            .select('content')
            .eq('id', selectedProject.global_footer_section_id)
            .single();
            
          if (!fetchError && globalSection && pageId) {
            // Add section back to current page
            console.log('➕ Adding section back to current page');
            const { data: pageData, error: pageError } = await supabase
              .from('pages')
              .select('sections')
              .eq('id', pageId)
              .single();
              
            if (!pageError && pageData) {
              const updatedSections = [...(pageData.sections || []), globalSection.content];
              
              const { error: updateError } = await supabase
                .from('pages')
                .update({ sections: updatedSections })
                .eq('id', pageId);
                
              if (updateError) {
                console.error('Error updating page sections:', updateError);
              }
            }
          }
          
          // Delete the page_sections record
          console.log('🗑️ Deleting page_sections record');
          const { error: deleteError } = await supabase
            .from('page_sections')
            .delete()
            .eq('id', selectedProject.global_footer_section_id);
            
          if (deleteError) {
            console.error('Error deleting page_sections record:', deleteError);
          }
        }
      }

      const { error: updateError } = await supabase
        .from('projects')
        .update({ 
          global_footer_section_id: globalFooterSectionId
        })
        .eq('id', selectedProject.id);

      if (updateError) throw updateError;

      setIsGlobalFooter(checked);
      console.log('🔄 Refetching project data...');
      await refetchProject();
      console.log('✅ Global footer updated successfully');
      
      // Call appropriate callback
      if (checked && onSectionPromoted) {
        onSectionPromoted();
      } else if (!checked && onSectionDemoted) {
        onSectionDemoted();
      }
    } catch (err) {
      console.error('❌ Full error object:', err);
      setError(`Failed to update global footer setting: ${err instanceof Error ? err.message : 'Unknown error'}`);
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