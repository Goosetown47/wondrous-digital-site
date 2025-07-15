import React, { useState, useEffect, useRef } from 'react';
import { useProject } from '../../../contexts/ProjectContext';
import { supabase } from '../../../utils/supabase';
import { Palette, Type, Plus, Save, Loader, X, Check, MousePointer } from 'lucide-react';
import Button from '../../../components/ui/Button';
import ButtonPreview from '../../../components/ui/ButtonPreview';
import FontSelector from '../../../components/ui/FontSelector';
import FontSearch from '../../../components/ui/FontSearch';
import FontPreview from '../../../components/ui/FontPreview';
import { fontPreloader } from '../../../utils/font-preloader';
import EnhancedColorPicker from '../../../components/admin/EnhancedColorPicker';
import GradientEditor from '../../../components/admin/GradientEditor';
import ButtonTypeCard from '../../../components/admin/ButtonTypeCard';
import { cn, applySiteStyleVariables } from '../../../lib/utils';
import { GOOGLE_FONTS } from '../../../data/google-fonts';

// Define interface for site styles based on database structure
interface SiteStyles {
  id?: string;
  project_id: string;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  tertiary_color: string | null;
  dark_color: string | null;
  light_color: string | null;
  white_color: string | null;
  button_radius: 'squared' | 'slightly-rounded' | 'fully-rounded' | null;
  button_style: 'default' | 'floating' | 'brick' | 'modern' | 'offset-background' | 'compact' | null;
  primary_button_hover_color: string | null;
  secondary_button_hover_color: string | null;
  soft_shade_1: string | null;
  soft_shade_2: string | null;
  soft_shade_3: string | null;
  gradient_1: string | null;
  gradient_2: string | null;
  button_radius: 'squared' | 'slightly-rounded' | 'fully-rounded';
  button_style: 'default' | 'floating' | 'brick' | 'modern' | 'offset-background' | 'compact';
  primary_button_hover_color: string | null;
  secondary_button_hover_color: string | null;
  primary_button_background_color: string | null;
  secondary_button_background_color: string | null;
  primary_button_text_color: string | null;
  primary_button_border_color: string | null;
  primary_button_shadow_color: string | null;
  secondary_button_text_color: string | null;
  secondary_button_border_color: string | null;
  secondary_button_shadow_color: string | null;
  outline_text_color: string | null;
  outline_border_color: string | null;
  outline_hover_bg: string | null;
  outline_background_color: string | null;
  outline_shadow_color: string | null;
  text_link_color: string | null;
  text_link_hover_color: string | null;
  primary_font: string | null;
  secondary_font: string | null;
  // Per-button-type settings
  primary_button_radius: 'squared' | 'slightly-rounded' | 'fully-rounded' | null;
  secondary_button_radius: 'squared' | 'slightly-rounded' | 'fully-rounded' | null;
  tertiary_button_radius: 'squared' | 'slightly-rounded' | 'fully-rounded' | null;
  primary_button_size: 'small' | 'medium' | 'large' | null;
  secondary_button_size: 'small' | 'medium' | 'large' | null;
  tertiary_button_size: 'small' | 'medium' | 'large' | null;
  primary_button_icon_enabled: boolean | null;
  primary_button_icon_position: 'left' | 'right' | null;
  secondary_button_icon_enabled: boolean | null;
  secondary_button_icon_position: 'left' | 'right' | null;
  tertiary_button_icon_enabled: boolean | null;
  tertiary_button_icon_position: 'left' | 'right' | null;
  textlink_button_icon_enabled: boolean | null;
  textlink_button_icon_position: 'left' | 'right' | null;
  primary_button_font: string | null;
  primary_button_weight: string | null;
  secondary_button_font: string | null;
  secondary_button_weight: string | null;
  tertiary_button_font: string | null;
  tertiary_button_weight: string | null;
  textlink_button_font: string | null;
  textlink_button_weight: string | null;
  h1_font_source: string | null;
  h2_font_source: string | null;
  h3_font_source: string | null;
  h4_font_source: string | null;
  h5_font_source: string | null;
  h6_font_source: string | null;
  p_font_source: string | null;
  h1_font_size: string | null;
  h2_font_size: string | null;
  h3_font_size: string | null;
  h4_font_size: string | null;
  h5_font_size: string | null;
  h6_font_size: string | null;
  p_font_size: string | null;
  h1_font_weight: string | null;
  h2_font_weight: string | null;
  h3_font_weight: string | null;
  h4_font_weight: string | null;
  h5_font_weight: string | null;
  h6_font_weight: string | null;
  p_font_weight: string | null;
  h1_line_height: string | null;
  h2_line_height: string | null;
  h3_line_height: string | null;
  h4_line_height: string | null;
  h5_line_height: string | null;
  h6_line_height: string | null;
  p_line_height: string | null;
}

// Google Fonts popular options
const POPULAR_FONTS = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Nunito',
  'Source Sans Pro',
  'Playfair Display',
  'Merriweather',
  'Crimson Text',
  'Lora'
];

// Font size options
const FONT_SIZES = [
  '0.75rem', '0.875rem', '1rem', '1.125rem', '1.25rem', 
  '1.5rem', '1.75rem', '2rem', '2.25rem', '2.5rem', 
  '3rem', '3.5rem', '4rem', '5rem', '6rem'
];

// Font weight options
const FONT_WEIGHTS = [
  '300', '400', '500', '600', '700', '800', '900'
];

// Line height options
const LINE_HEIGHTS = [
  '1.0', '1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '1.8', '2.0'
];

// Default colors
const DEFAULT_STYLES = {
  primary_color: '#000000',
  secondary_color: '#374151',
  tertiary_color: '#9CA3AF',
  dark_color: '#000000',
  light_color: '#F3F4F6',
  white_color: '#FFFFFF',
  button_radius: 'slightly-rounded',
  button_style: 'default',
  primary_button_hover_color: '#374151',
  secondary_button_hover_color: '#F9FAFB',
  primary_button_background_color: '#000000',
  secondary_button_background_color: '#FFFFFF',
  primary_button_text_color: '#FFFFFF',
  primary_button_border_color: '#000000',
  primary_button_shadow_color: '#374151',
  secondary_button_text_color: '#000000',
  secondary_button_border_color: '#E5E7EB',
  secondary_button_shadow_color: '#D1D5DB',
  outline_text_color: '#000000',
  outline_border_color: '#000000',
  outline_hover_bg: '#F3F4F6',
  text_link_color: '#000000',
  text_link_hover_color: '#374151',
  soft_shade_1: '#F5F5F5',
  soft_shade_2: '#E5E5E5',
  soft_shade_3: '#D4D4D4',
  gradient_1: 'linear-gradient(135deg, #000000 0%, #F9FAFB 100%)',
  gradient_2: 'linear-gradient(135deg, #F9FAFB 0%, #000000 100%)',
  primary_font: 'Inter',
  secondary_font: 'Inter',
  h1_font_source: 'primary_font',
  h2_font_source: 'primary_font',
  h3_font_source: 'primary_font',
  h4_font_source: 'primary_font',
  h5_font_source: 'primary_font',
  h6_font_source: 'primary_font',
  p_font_source: 'secondary_font',
  h1_font_size: '2.5rem',
  h2_font_size: '2rem',
  h3_font_size: '1.75rem',
  h4_font_size: '1.5rem',
  h5_font_size: '1.25rem',
  h6_font_size: '1rem',
  p_font_size: '1rem',
  h1_font_weight: '700',
  h2_font_weight: '700',
  h3_font_weight: '600',
  h4_font_weight: '600',
  h5_font_weight: '600',
  h6_font_weight: '600',
  p_font_weight: '400',
  h1_line_height: '1.2',
  h2_line_height: '1.3',
  h3_line_height: '1.4',
  h4_line_height: '1.4',
  h5_line_height: '1.4',
  h6_line_height: '1.4',
  p_line_height: '1.6'
};

const SiteStyles = () => {
  const { selectedProject, loading: projectLoading } = useProject();
  
  // State
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'buttons'>('colors');
  const [siteStyles, setSiteStyles] = useState<SiteStyles | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addedFonts, setAddedFonts] = useState<Set<string>>(new Set());
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Color picker state
  const [activeColorField, setActiveColorField] = useState<string | null>(null);
  const [colorPickerValue, setColorPickerValue] = useState('#000000');
  
  // Gradient editor state
  const [activeGradientField, setActiveGradientField] = useState<string | null>(null);
  const [gradientEditorValue, setGradientEditorValue] = useState('');
  
  // Typography preview state
  const [loadedFonts, setLoadedFonts] = useState<string[]>([]);
  
  // Auto-save functionality
  const saveTimeoutRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);
  
  // Fetch site styles when the selected project changes
  useEffect(() => {
    if (selectedProject) {
      // Clear any unsaved state when switching projects
      setActiveColorField(null);
      setActiveGradientField(null);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Immediately reset CSS variables to defaults to prevent carryover
      applySiteStyleVariables(DEFAULT_STYLES);
      
      fetchSiteStyles();
    }
    
    return () => {
      isMountedRef.current = false;
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [selectedProject]);

  // Apply CSS variables whenever siteStyles changes
  useEffect(() => {
    if (siteStyles) {
      applySiteStyleVariables({...DEFAULT_STYLES, ...siteStyles});
    }
  }, [siteStyles]);
  
  // Function to fetch site styles
  const fetchSiteStyles = async () => {
    if (!selectedProject) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Check if site styles exist for this project
      const { data, error } = await supabase
        .from('site_styles')
        .select('*')
        .eq('project_id', selectedProject.id)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        // Site styles exist, set them to state
        setSiteStyles(data);
        
        // Load the fonts used in the site styles
        if (data.primary_font) {
          loadFont(data.primary_font);
        }
        if (data.secondary_font) {
          loadFont(data.secondary_font);
        }
      } else {
        // No site styles yet, create default
        setSiteStyles({
          project_id: selectedProject.id,
          logo_url: null,
          ...DEFAULT_STYLES
        });
      }
    } catch (err: any) {
      console.error('Error fetching site styles:', err);
      setError(err.message || 'Failed to load site styles');
    } finally {
      setLoading(false);
    }
  };
  
  // Enhanced function to load a Google Font using the preloader
  const loadFont = async (fontName: string) => {
    if (!fontName || loadedFonts.includes(fontName)) return;
    
    try {
      // Use the font preloader for optimized loading
      await fontPreloader.loadFont(fontName);
      
      // Add to local state tracking
      setLoadedFonts(prev => [...prev, fontName]);
    } catch (error) {
      console.warn(`Failed to load font: ${fontName}`, error);
    }
  };
  
  // Handle site style changes
  const handleStyleChange = (field: keyof SiteStyles, value: string | null) => {
    if (!siteStyles) return;
    
    // Update state
    const updatedStyles = { ...siteStyles, [field]: value };
    setSiteStyles(updatedStyles);
    
    // Immediately apply CSS variables
    applySiteStyleVariables({...DEFAULT_STYLES, ...updatedStyles});
    
    // If it's a font field, load the font
    if ((field === 'primary_font' || field === 'secondary_font') && value) {
      loadFont(value);
    }
    
    // Schedule auto-save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = window.setTimeout(() => {
      if (isMountedRef.current) {
        saveSiteStyles();
      }
    }, 2000);
  };
  
  // Save site styles to database
  const saveSiteStyles = async () => {
    if (!selectedProject || !siteStyles) return;
    
    try {
      setSaving(true);
      setError(null);
      
      // Determine if we need to insert or update
      const hasId = !!siteStyles.id;
      
      if (hasId) {
        // Update existing record
        const { error } = await supabase
          .from('site_styles')
          .update(siteStyles)
          .eq('id', siteStyles.id);
        
        if (error) throw error;
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from('site_styles')
          .insert([siteStyles])
          .select('id');
        
        if (error) throw error;
        
        // Update local state with new ID
        if (data && data[0]) {
          setSiteStyles(prev => {
            if (!prev) return null;
            return { ...prev, id: data[0].id };
          });
        }
      }
      
      // Show saved message
      setSavedMessage('Changes saved successfully');
      
      // Clear message after 3 seconds
      setTimeout(() => {
        if (isMountedRef.current) {
          setSavedMessage(null);
        }
      }, 3000);
    } catch (err: any) {
      console.error('Error saving site styles:', err);
      setError(err.message || 'Failed to save site styles');
    } finally {
      setSaving(false);
    }
  };
  
  // Function to toggle color picker for a specific field
  const toggleColorPicker = (field: keyof SiteStyles | null, value: string = '#000000') => {
    setActiveColorField(field);
    if (field && siteStyles && siteStyles[field]) {
      setColorPickerValue(siteStyles[field] || value);
    } else {
      setColorPickerValue(value);
    }
  };
  
  // Function to apply color picker value to the active field
  const applyColor = (color: string) => {
    if (activeColorField && siteStyles) {
      handleStyleChange(activeColorField as keyof SiteStyles, color);
      setActiveColorField(null);
    }
  };
  
  // Function to toggle gradient editor for a specific field
  const toggleGradientEditor = (field: keyof SiteStyles | null, value: string = '') => {
    setActiveGradientField(field);
    if (field && siteStyles && siteStyles[field]) {
      setGradientEditorValue(siteStyles[field] || value);
    } else {
      setGradientEditorValue(value);
    }
  };
  
  // Function to apply gradient editor value to the active field
  const applyGradient = (gradient: string) => {
    if (activeGradientField && siteStyles) {
      handleStyleChange(activeGradientField as keyof SiteStyles, gradient);
      setActiveGradientField(null);
    }
  };

  // Helper function to get button background styles (handles gradients)
  const getButtonBackgroundStyles = () => {
    const bgColor = siteStyles?.primary_button_background_color || DEFAULT_STYLES.primary_button_background_color;
    const isGradient = bgColor?.includes('linear-gradient') || bgColor?.includes('radial-gradient') || bgColor?.includes('conic-gradient');
    
    if (isGradient) {
      return {
        style: { background: bgColor },
        className: 'text-white font-medium text-sm'
      };
    } else {
      return {
        style: {},
        className: 'bg-[var(--primary-button-background-color)] text-white font-medium text-sm'
      };
    }
  };

  // Helper function for check mark divs (app UI - always pink)
  const getCheckMarkStyles = () => {
    return {
      style: {},
      className: 'w-5 h-5 bg-primary-pink rounded-full flex items-center justify-center'
    };
  };
  
  // Loading state
  if (projectLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-6 w-6 text-primary-pink animate-spin" />
        <span className="ml-2 text-gray-600">Loading site styles...</span>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
        <p>{error}</p>
        <button
          onClick={fetchSiteStyles}
          className="mt-2 text-sm font-medium underline"
        >
          Try again
        </button>
      </div>
    );
  }
  
  // No project selected
  if (!selectedProject) {
    return (
      <div className="bg-white p-6 shadow-sm rounded-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Site Styles</h1>
        <p className="text-gray-600">Please select a project to manage its site styles.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Site Styles</h1>
          <p className="text-gray-600">
            Manage site styles for{' '}
            <span className="font-medium text-primary-pink">{selectedProject.project_name}</span>
          </p>
        </div>
        
        {/* Save indicator */}
        <div className="flex items-center">
          {savedMessage && (
            <div className="mr-4 text-sm text-green-600 flex items-center">
              <Check className="h-4 w-4 mr-1" />
              {savedMessage}
            </div>
          )}
          
          <button
            onClick={saveSiteStyles}
            className={`bg-primary-pink text-white px-4 py-2 rounded-lg flex items-center ${
              saving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary-dark-purple transition-colors duration-200'
            }`}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              className={`px-6 py-3 focus:outline-none ${
                activeTab === 'colors'
                  ? 'border-b-2 border-primary-pink text-primary-pink'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('colors')}
            >
              <div className="flex items-center">
                <Palette className="h-4 w-4 mr-2" />
                <span>Colors</span>
              </div>
            </button>
            
            <button
              className={`px-6 py-3 focus:outline-none ${
                activeTab === 'typography'
                  ? 'border-b-2 border-primary-pink text-primary-pink'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('typography')}
            >
              <div className="flex items-center">
                <Type className="h-4 w-4 mr-2" />
                <span>Typography</span>
              </div>
            </button>
            
            <button
              className={`px-6 py-3 focus:outline-none ${
                activeTab === 'buttons'
                  ? 'border-b-2 border-primary-pink text-primary-pink'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('buttons')}
            >
              <div className="flex items-center">
                <MousePointer className="h-4 w-4 mr-2" />
                <span>Buttons</span>
              </div>
            </button>
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'colors' && siteStyles && (
            <div className="space-y-8">
              {/* Color Palette Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Color Palette</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {/* Primary Color */}
                  <div>
                    <div
                      className="h-[75px] w-[75px] rounded-[10px] cursor-pointer mb-2 border border-gray-200"
                      style={{ background: siteStyles.primary_color || '#000000' }}
                      onClick={() => toggleColorPicker('primary_color', siteStyles.primary_color || '#000000')}
                    />
                    <p className="text-sm font-medium text-gray-700">Primary</p>
                    <p className="text-xs text-gray-500">{siteStyles.primary_color || '#000000'}</p>
                  </div>
                  
                  {/* Secondary Color */}
                  <div>
                    <div
                      className="h-[75px] w-[75px] rounded-[10px] cursor-pointer mb-2 border border-gray-200"
                      style={{ background: siteStyles.secondary_color || '#374151' }}
                      onClick={() => toggleColorPicker('secondary_color', siteStyles.secondary_color || '#374151')}
                    />
                    <p className="text-sm font-medium text-gray-700">Secondary</p>
                    <p className="text-xs text-gray-500">{siteStyles.secondary_color || '#374151'}</p>
                  </div>
                  
                  {/* Tertiary Color */}
                  <div>
                    <div
                      className="h-[75px] w-[75px] rounded-[10px] cursor-pointer mb-2 border border-gray-200"
                      style={{ backgroundColor: siteStyles.tertiary_color || '#302940' }}
                      onClick={() => toggleColorPicker('tertiary_color', siteStyles.tertiary_color || '#302940')}
                    />
                    <p className="text-sm font-medium text-gray-700">Tertiary</p>
                    <p className="text-xs text-gray-500">{siteStyles.tertiary_color || '#302940'}</p>
                  </div>
                  
                  {/* Dark Color */}
                  <div>
                    <div
                      className="h-[75px] w-[75px] rounded-[10px] cursor-pointer mb-2 border border-gray-200"
                      style={{ backgroundColor: siteStyles.dark_color || '#1F0943' }}
                      onClick={() => toggleColorPicker('dark_color', siteStyles.dark_color || '#1F0943')}
                    />
                    <p className="text-sm font-medium text-gray-700">Dark</p>
                    <p className="text-xs text-gray-500">{siteStyles.dark_color || '#1F0943'}</p>
                  </div>
                  
                  {/* Light Color */}
                  <div>
                    <div
                      className="h-[75px] w-[75px] rounded-[10px] cursor-pointer mb-2 border border-gray-200"
                      style={{ backgroundColor: siteStyles.light_color || '#EFD0F2' }}
                      onClick={() => toggleColorPicker('light_color', siteStyles.light_color || '#EFD0F2')}
                    />
                    <p className="text-sm font-medium text-gray-700">Light</p>
                    <p className="text-xs text-gray-500">{siteStyles.light_color || '#EFD0F2'}</p>
                  </div>
                  
                  {/* White Color */}
                  <div>
                    <div
                      className="h-[75px] w-[75px] rounded-[10px] cursor-pointer mb-2 border border-gray-200"
                      style={{ backgroundColor: siteStyles.white_color || '#FFFFFF' }}
                      onClick={() => toggleColorPicker('white_color', siteStyles.white_color || '#FFFFFF')}
                    />
                    <p className="text-sm font-medium text-gray-700">White</p>
                    <p className="text-xs text-gray-500">{siteStyles.white_color || '#FFFFFF'}</p>
                  </div>
                  
                  {/* Soft Shade 1 */}
                  <div>
                    <div
                      className="h-[75px] w-[75px] rounded-[10px] cursor-pointer mb-2 border border-gray-200"
                      style={{ backgroundColor: siteStyles.soft_shade_1 || '#F5F5F5' }}
                      onClick={() => toggleColorPicker('soft_shade_1', siteStyles.soft_shade_1 || '#F5F5F5')}
                    />
                    <p className="text-sm font-medium text-gray-700">Soft Shade 1</p>
                    <p className="text-xs text-gray-500">{siteStyles.soft_shade_1 || '#F5F5F5'}</p>
                  </div>
                  
                  {/* Soft Shade 2 */}
                  <div>
                    <div
                      className="h-[75px] w-[75px] rounded-[10px] cursor-pointer mb-2 border border-gray-200"
                      style={{ backgroundColor: siteStyles.soft_shade_2 || '#E5E5E5' }}
                      onClick={() => toggleColorPicker('soft_shade_2', siteStyles.soft_shade_2 || '#E5E5E5')}
                    />
                    <p className="text-sm font-medium text-gray-700">Soft Shade 2</p>
                    <p className="text-xs text-gray-500">{siteStyles.soft_shade_2 || '#E5E5E5'}</p>
                  </div>
                  
                  {/* Soft Shade 3 */}
                  <div>
                    <div
                      className="h-[75px] w-[75px] rounded-[10px] cursor-pointer mb-2 border border-gray-200"
                      style={{ backgroundColor: siteStyles.soft_shade_3 || '#D4D4D4' }}
                      onClick={() => toggleColorPicker('soft_shade_3', siteStyles.soft_shade_3 || '#D4D4D4')}
                    />
                    <p className="text-sm font-medium text-gray-700">Soft Shade 3</p>
                    <p className="text-xs text-gray-500">{siteStyles.soft_shade_3 || '#D4D4D4'}</p>
                  </div>
                </div>
              </div>
              
              {/* Gradient Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Gradients</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Gradient 1 */}
                  <div>
                    <div
                      className="h-[75px] rounded-[10px] cursor-pointer mb-2 border border-gray-200"
                      style={{ background: siteStyles.gradient_1 || 'linear-gradient(135deg, #000000 0%, #F9FAFB 100%)' }}
                      onClick={() => toggleGradientEditor('gradient_1', siteStyles.gradient_1 || 'linear-gradient(135deg, #000000 0%, #F9FAFB 100%)')}
                    />
                    <p className="text-sm font-medium text-gray-700">Gradient 1</p>
                    <p className="text-xs text-gray-500">{siteStyles.gradient_1 || 'linear-gradient(135deg, #000000 0%, #F9FAFB 100%)'}</p>
                  </div>
                  
                  {/* Gradient 2 */}
                  <div>
                    <div
                      className="h-[75px] rounded-[10px] cursor-pointer mb-2 border border-gray-200"
                      style={{ background: siteStyles.gradient_2 || 'linear-gradient(135deg, #F9FAFB 0%, #000000 100%)' }}
                      onClick={() => toggleGradientEditor('gradient_2', siteStyles.gradient_2 || 'linear-gradient(135deg, #F9FAFB 0%, #000000 100%)')}
                    />
                    <p className="text-sm font-medium text-gray-700">Gradient 2</p>
                    <p className="text-xs text-gray-500">{siteStyles.gradient_2 || 'linear-gradient(135deg, #F9FAFB 0%, #000000 100%)'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'typography' && siteStyles && (
            <div className="space-y-8">
              {/* Font Selection Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Font Selection</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Primary Font */}
                  <div>
                    <FontSelector
                      label="Primary Font"
                      description="Used for body text and most UI elements"
                      value={siteStyles.primary_font || 'Inter'}
                      onChange={(fontName) => handleStyleChange('primary_font', fontName)}
                      onFontLoad={loadFont}
                      addedFonts={addedFonts}
                      onAddedFontsChange={setAddedFonts}
                    />
                  </div>
                  
                  {/* Secondary Font */}
                  <div>
                    <FontSelector
                      label="Secondary Font"
                      description="Used for headings and display text"
                      value={siteStyles.secondary_font || 'Playfair Display'}
                      onChange={(fontName) => handleStyleChange('secondary_font', fontName)}
                      onFontLoad={loadFont}
                      addedFonts={addedFonts}
                      onAddedFontsChange={setAddedFonts}
                    />
                  </div>
                </div>
                
                {/* Font Search */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Search the Full Google Fonts Library
                  </h4>
                  <p className="text-xs text-gray-500 mb-3">
                    Access 1400+ Google Fonts beyond our curated collection. Perfect for finding unique fonts not available in the dropdowns above.
                  </p>
                  <FontSearch
                    onFontSelect={(fontName) => {
                      // Add to added fonts
                      setAddedFonts(prev => new Set([...prev, fontName]));
                      // Set as primary font - user can change it in the dropdown if needed
                      handleStyleChange('primary_font', fontName);
                      // Load the font
                      loadFont(fontName);
                    }}
                    onFontLoad={loadFont}
                    placeholder="Search Google Fonts like 'Ubuntu', 'Crimson Pro', 'Source Sans 3'..."
                  />
                </div>

                {/* Font Previews */}
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Primary Font Preview</h4>
                    <FontPreview 
                      fontName={siteStyles.primary_font || 'Inter'}
                      size="small"
                      showWeights={false}
                      customText="This is your primary font for body text and UI elements."
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Secondary Font Preview</h4>
                    <FontPreview 
                      fontName={siteStyles.secondary_font || 'Playfair Display'}
                      size="small"
                      showWeights={false}
                      customText="This is your secondary font for headings and titles."
                    />
                  </div>
                </div>
              </div>
              
              {/* Typography Preview Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Typography Preview</h3>
                
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  {/* H1 Heading */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium text-gray-500">H1 Heading</div>
                      <div className="flex gap-2">
                        <select
                          value={siteStyles.h1_font_source || 'secondary_font'}
                          onChange={(e) => handleStyleChange('h1_font_source', e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-300 rounded"
                        >
                          <option value="primary_font">Primary Font</option>
                          <option value="secondary_font">Secondary Font</option>
                        </select>
                        <select
                          value={siteStyles.h1_font_size || '2.5rem'}
                          onChange={(e) => handleStyleChange('h1_font_size', e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-300 rounded"
                        >
                          {FONT_SIZES.map(size => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                        <select
                          value={siteStyles.h1_font_weight || '700'}
                          onChange={(e) => handleStyleChange('h1_font_weight', e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-300 rounded"
                        >
                          {FONT_WEIGHTS.map(weight => (
                            <option key={weight} value={weight}>{weight}</option>
                          ))}
                        </select>
                        <select
                          value={siteStyles.h1_line_height || '1.2'}
                          onChange={(e) => handleStyleChange('h1_line_height', e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-300 rounded"
                          title="Line Height"
                        >
                          {LINE_HEIGHTS.map(height => (
                            <option key={height} value={height}>{height}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <h1 
                      className="text-gray-900"
                      style={{ 
                        fontFamily: siteStyles.h1_font_source === 'primary_font' 
                          ? siteStyles.primary_font || 'Inter'
                          : siteStyles.secondary_font || 'Playfair Display',
                        fontSize: siteStyles.h1_font_size || '2.5rem',
                        fontWeight: siteStyles.h1_font_weight || '700',
                        lineHeight: siteStyles.h1_line_height || '1.2'
                      }}
                    >
                      Hic ad portas nostras mari ablutas, solis occasu occidentis stabunt
                    </h1>
                  </div>
                  
                  {/* H2 Example */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium text-gray-500">H2 Heading</div>
                      <div className="flex gap-2">
                        <select
                          value={siteStyles.h2_font_source || 'secondary_font'}
                          onChange={(e) => handleStyleChange('h2_font_source', e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-300 rounded"
                        >
                          <option value="primary_font">Primary Font</option>
                          <option value="secondary_font">Secondary Font</option>
                        </select>
                        <select
                          value={siteStyles.h2_font_size || '2rem'}
                          onChange={(e) => handleStyleChange('h2_font_size', e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-300 rounded"
                        >
                          {FONT_SIZES.map(size => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                        <select
                          value={siteStyles.h2_font_weight || '700'}
                          onChange={(e) => handleStyleChange('h2_font_weight', e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-300 rounded"
                        >
                          {FONT_WEIGHTS.map(weight => (
                            <option key={weight} value={weight}>{weight}</option>
                          ))}
                        </select>
                        <select
                          value={siteStyles.h2_line_height || '1.3'}
                          onChange={(e) => handleStyleChange('h2_line_height', e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-300 rounded"
                          title="Line Height"
                        >
                          {LINE_HEIGHTS.map(height => (
                            <option key={height} value={height}>{height}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <h2 
                      className="text-gray-900"
                      style={{ 
                        fontFamily: siteStyles.h2_font_source === 'primary_font'
                          ? siteStyles.primary_font || 'Inter'
                          : siteStyles.secondary_font || 'Playfair Display',
                        fontSize: siteStyles.h2_font_size || '2rem',
                        fontWeight: siteStyles.h2_font_weight || '700',
                        lineHeight: siteStyles.h2_line_height || '1.3'
                      }}
                    >
                      Hic ad portas nostras mari ablutas, solis occasu occidentis stabunt
                    </h2>
                  </div>
                  
                  {/* H3 Example */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium text-gray-500">H3 Heading</div>
                      <div className="flex gap-2">
                        <select
                          value={siteStyles.h3_font_source || 'secondary_font'}
                          onChange={(e) => handleStyleChange('h3_font_source', e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-300 rounded"
                        >
                          <option value="primary_font">Primary Font</option>
                          <option value="secondary_font">Secondary Font</option>
                        </select>
                        <select
                          value={siteStyles.h3_font_size || '1.75rem'}
                          onChange={(e) => handleStyleChange('h3_font_size', e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-300 rounded"
                        >
                          {FONT_SIZES.map(size => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                        <select
                          value={siteStyles.h3_font_weight || '600'}
                          onChange={(e) => handleStyleChange('h3_font_weight', e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-300 rounded"
                        >
                          {FONT_WEIGHTS.map(weight => (
                            <option key={weight} value={weight}>{weight}</option>
                          ))}
                        </select>
                        <select
                          value={siteStyles.h3_line_height || '1.4'}
                          onChange={(e) => handleStyleChange('h3_line_height', e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-300 rounded"
                          title="Line Height"
                        >
                          {LINE_HEIGHTS.map(height => (
                            <option key={height} value={height}>{height}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <h3 
                      className="text-gray-900"
                      style={{ 
                        fontFamily: siteStyles.h3_font_source === 'primary_font'
                          ? siteStyles.primary_font || 'Inter'
                          : siteStyles.secondary_font || 'Playfair Display',
                        fontSize: siteStyles.h3_font_size || '1.75rem',
                        fontWeight: siteStyles.h3_font_weight || '600',
                        lineHeight: siteStyles.h3_line_height || '1.4'
                      }}
                    >
                      Hic ad portas nostras mari ablutas, solis occasu occidentis stabunt
                    </h3>
                  </div>
                  
                  {/* H4 Example */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium text-gray-500">H4 Heading</div>
                      <div className="flex gap-2">
                        <select
                          value={siteStyles.h4_font_source || 'secondary_font'}
                          onChange={(e) => handleStyleChange('h4_font_source', e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-300 rounded"
                        >
                          <option value="primary_font">Primary Font</option>
                          <option value="secondary_font">Secondary Font</option>
                        </select>
                        <select
                          value={siteStyles.h4_font_size || '1.5rem'}
                          onChange={(e) => handleStyleChange('h4_font_size', e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-300 rounded"
                        >
                          {FONT_SIZES.map(size => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                        <select
                          value={siteStyles.h4_font_weight || '600'}
                          onChange={(e) => handleStyleChange('h4_font_weight', e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-300 rounded"
                        >
                          {FONT_WEIGHTS.map(weight => (
                            <option key={weight} value={weight}>{weight}</option>
                          ))}
                        </select>
                        <select
                          value={siteStyles.h4_line_height || '1.4'}
                          onChange={(e) => handleStyleChange('h4_line_height', e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-300 rounded"
                          title="Line Height"
                        >
                          {LINE_HEIGHTS.map(height => (
                            <option key={height} value={height}>{height}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <h4 
                      className="text-gray-900"
                      style={{ 
                        fontFamily: siteStyles.h4_font_source === 'primary_font'
                          ? siteStyles.primary_font || 'Inter'
                          : siteStyles.secondary_font || 'Playfair Display',
                        fontSize: siteStyles.h4_font_size || '1.5rem',
                        fontWeight: siteStyles.h4_font_weight || '600',
                        lineHeight: siteStyles.h4_line_height || '1.4'
                      }}
                    >
                      Hic ad portas nostras mari ablutas, solis occasu occidentis stabunt
                    </h4>
                  </div>
                  
                  {/* H5 Example */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium text-gray-500">H5 Heading</div>
                      <div className="flex gap-2">
                        <select
                          value={siteStyles.h5_font_source || 'secondary_font'}
                          onChange={(e) => handleStyleChange('h5_font_source', e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-300 rounded"
                        >
                          <option value="primary_font">Primary Font</option>
                          <option value="secondary_font">Secondary Font</option>
                        </select>
                        <select
                          value={siteStyles.h5_font_size || '1.25rem'}
                          onChange={(e) => handleStyleChange('h5_font_size', e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-300 rounded"
                        >
                          {FONT_SIZES.map(size => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                        <select
                          value={siteStyles.h5_font_weight || '600'}
                          onChange={(e) => handleStyleChange('h5_font_weight', e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-300 rounded"
                        >
                          {FONT_WEIGHTS.map(weight => (
                            <option key={weight} value={weight}>{weight}</option>
                          ))}
                        </select>
                        <select
                          value={siteStyles.h5_line_height || '1.4'}
                          onChange={(e) => handleStyleChange('h5_line_height', e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-300 rounded"
                          title="Line Height"
                        >
                          {LINE_HEIGHTS.map(height => (
                            <option key={height} value={height}>{height}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <h5 
                      className="text-gray-900"
                      style={{ 
                        fontFamily: siteStyles.h5_font_source === 'primary_font'
                          ? siteStyles.primary_font || 'Inter'
                          : siteStyles.secondary_font || 'Playfair Display',
                        fontSize: siteStyles.h5_font_size || '1.25rem',
                        fontWeight: siteStyles.h5_font_weight || '600',
                        lineHeight: siteStyles.h5_line_height || '1.4'
                      }}
                    >
                      Hic ad portas nostras mari ablutas, solis occasu occidentis stabunt
                    </h5>
                  </div>
                  
                  {/* H6 Example */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium text-gray-500">H6 Heading</div>
                      <div className="flex gap-2">
                        <select
                          value={siteStyles.h6_font_source || 'secondary_font'}
                          onChange={(e) => handleStyleChange('h6_font_source', e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-300 rounded"
                        >
                          <option value="primary_font">Primary Font</option>
                          <option value="secondary_font">Secondary Font</option>
                        </select>
                        <select
                          value={siteStyles.h6_font_size || '1rem'}
                          onChange={(e) => handleStyleChange('h6_font_size', e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-300 rounded"
                        >
                          {FONT_SIZES.map(size => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                        <select
                          value={siteStyles.h6_font_weight || '600'}
                          onChange={(e) => handleStyleChange('h6_font_weight', e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-300 rounded"
                        >
                          {FONT_WEIGHTS.map(weight => (
                            <option key={weight} value={weight}>{weight}</option>
                          ))}
                        </select>
                        <select
                          value={siteStyles.h6_line_height || '1.4'}
                          onChange={(e) => handleStyleChange('h6_line_height', e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-300 rounded"
                          title="Line Height"
                        >
                          {LINE_HEIGHTS.map(height => (
                            <option key={height} value={height}>{height}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <h6 
                      className="text-gray-900"
                      style={{ 
                        fontFamily: siteStyles.h6_font_source === 'primary_font'
                          ? siteStyles.primary_font || 'Inter'
                          : siteStyles.secondary_font || 'Playfair Display',
                        fontSize: siteStyles.h6_font_size || '1rem',
                        fontWeight: siteStyles.h6_font_weight || '600',
                        lineHeight: siteStyles.h6_line_height || '1.4'
                      }}
                    >
                      Hic ad portas nostras mari ablutas, solis occasu occidentis stabunt
                    </h6>
                  </div>
                  
                  {/* Paragraph Example */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium text-gray-500">Paragraph</div>
                      <div className="flex gap-2">
                        <select
                          value={siteStyles.p_font_source || 'primary_font'}
                          onChange={(e) => handleStyleChange('p_font_source', e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-300 rounded"
                        >
                          <option value="primary_font">Primary Font</option>
                          <option value="secondary_font">Secondary Font</option>
                        </select>
                        <select
                          value={siteStyles.p_font_size || '1rem'}
                          onChange={(e) => handleStyleChange('p_font_size', e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-300 rounded"
                        >
                          {FONT_SIZES.map(size => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                        <select
                          value={siteStyles.p_font_weight || '400'}
                          onChange={(e) => handleStyleChange('p_font_weight', e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-300 rounded"
                        >
                          {FONT_WEIGHTS.map(weight => (
                            <option key={weight} value={weight}>{weight}</option>
                          ))}
                        </select>
                        <select
                          value={siteStyles.p_line_height || '1.6'}
                          onChange={(e) => handleStyleChange('p_line_height', e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-300 rounded"
                          title="Line Height"
                        >
                          {LINE_HEIGHTS.map(height => (
                            <option key={height} value={height}>{height}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <p 
                      className="text-gray-700"
                      style={{ 
                        fontFamily: siteStyles.p_font_source === 'secondary_font'
                          ? siteStyles.secondary_font || 'Playfair Display'
                          : siteStyles.primary_font || 'Inter',
                        fontSize: siteStyles.p_font_size || '1rem',
                        fontWeight: siteStyles.p_font_weight || '400',
                        lineHeight: siteStyles.p_line_height || '1.6'
                      }}
                    >
                      Da mihi fessos, pauperes, Confertas turbas libere respirare cupientes, Miserabiles sordes litoris tui plenissimi. Mitte hos, vagos, tempestate iactos, ad me, Lucernam meam iuxta auream portam tollo!
                    </p>
                  </div>
                </div>
              </div>
              
            </div>
          )}
          
          {activeTab === 'buttons' && siteStyles && (
            <div className="space-y-8">

              {/* Button Configuration Cards */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Button Configuration</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Customize colors, radius, size, icons, and typography for each button type.
                </p>
                
                {/* Button Type Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                  <ButtonTypeCard
                    variant="primary"
                    title="Primary Button"
                    siteStyles={siteStyles}
                    onStyleChange={handleStyleChange}
                  />
                  <ButtonTypeCard
                    variant="secondary"
                    title="Secondary Button"
                    siteStyles={siteStyles}
                    onStyleChange={handleStyleChange}
                  />
                  <ButtonTypeCard
                    variant="tertiary"
                    title="Tertiary Button"
                    siteStyles={siteStyles}
                    onStyleChange={handleStyleChange}
                  />
                  <ButtonTypeCard
                    variant="text-link"
                    title="Text Link"
                    siteStyles={siteStyles}
                    onStyleChange={handleStyleChange}
                  />
              </div>
              </div>
              
              {/* Button Style Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Button Style</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Select a button style that matches your brand personality.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Default Style (formerly Sleek) */}
                  <div className={`relative rounded-lg border-2 ${siteStyles.button_style === 'default' ? 'border-primary-pink' : 'border-gray-200 hover:border-gray-300'} p-4 transition-colors cursor-pointer`}
                    onClick={() => handleStyleChange('button_style', 'default')}
                  >
                    <h4 className="font-medium text-center mb-2">Default</h4>
                    <p className="text-xs text-gray-500 text-center mb-4">Clean and minimal</p>
                    <div className="space-y-2">
                      <ButtonPreview
                        variant="primary"
                        radius={siteStyles.button_radius as any || 'slightly-rounded'}
                        style="default"
                      />
                      <ButtonPreview
                        variant="tertiary"
                        radius={siteStyles.button_radius as any || 'slightly-rounded'}
                        style="default"
                      />
                    </div>
                    {siteStyles.button_style === 'default' && (
                      <div className="absolute top-2 right-2">
                        <div 
                          className={getCheckMarkStyles().className}
                          style={getCheckMarkStyles().style}
                        >
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Floating Style (formerly Bubble) */}
                  <div className={`relative rounded-lg border-2 ${siteStyles.button_style === 'floating' ? 'border-primary-pink' : 'border-gray-200 hover:border-gray-300'} p-4 transition-colors cursor-pointer`}
                    onClick={() => handleStyleChange('button_style', 'floating')}
                  >
                    <h4 className="font-medium text-center mb-2">Floating</h4>
                    <p className="text-xs text-gray-500 text-center mb-4">Enhanced shadows and hover</p>
                    <div className="space-y-2">
                      <ButtonPreview
                        variant="primary"
                        radius={siteStyles.button_radius as any || 'slightly-rounded'}
                        style="floating"
                      />
                      <ButtonPreview
                        variant="tertiary"
                        radius={siteStyles.button_radius as any || 'slightly-rounded'}
                        style="floating"
                      />
                    </div>
                    {siteStyles.button_style === 'floating' && (
                      <div className="absolute top-2 right-2">
                        <div 
                          className={getCheckMarkStyles().className}
                          style={getCheckMarkStyles().style}
                        >
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Brick Style (formerly Default) */}
                  <div className={`relative rounded-lg border-2 ${siteStyles.button_style === 'brick' ? 'border-primary-pink' : 'border-gray-200 hover:border-gray-300'} p-4 transition-colors cursor-pointer`}
                    onClick={() => handleStyleChange('button_style', 'brick')}
                  >
                    <h4 className="font-medium text-center mb-2">Brick</h4>
                    <p className="text-xs text-gray-500 text-center mb-4">Bold with strong shadows</p>
                    <div className="space-y-2">
                      <ButtonPreview
                        variant="primary"
                        radius={siteStyles.button_radius as any || 'slightly-rounded'}
                        style="brick"
                      />
                      <ButtonPreview
                        variant="tertiary"
                        radius={siteStyles.button_radius as any || 'slightly-rounded'}
                        style="brick"
                      />
                    </div>
                    {siteStyles.button_style === 'brick' && (
                      <div className="absolute top-2 right-2">
                        <div 
                          className={getCheckMarkStyles().className}
                          style={getCheckMarkStyles().style}
                        >
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Modern Style */}
                  <div className={`relative rounded-lg border-2 ${siteStyles.button_style === 'modern' ? 'border-primary-pink' : 'border-gray-200 hover:border-gray-300'} p-4 transition-colors cursor-pointer`}
                    onClick={() => handleStyleChange('button_style', 'modern')}
                  >
                    <h4 className="font-medium text-center mb-2">Modern</h4>
                    <p className="text-xs text-gray-500 text-center mb-4">Sleek with sophisticated shadows</p>
                    <div className="space-y-2">
                      <ButtonPreview
                        variant="primary"
                        radius={siteStyles.button_radius as any || 'slightly-rounded'}
                        style="modern"
                      />
                      <ButtonPreview
                        variant="tertiary"
                        radius={siteStyles.button_radius as any || 'slightly-rounded'}
                        style="modern"
                      />
                    </div>
                    {siteStyles.button_style === 'modern' && (
                      <div className="absolute top-2 right-2">
                        <div 
                          className={getCheckMarkStyles().className}
                          style={getCheckMarkStyles().style}
                        >
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Offset Background Style */}
                  <div className={`relative rounded-lg border-2 ${siteStyles.button_style === 'offset-background' ? 'border-primary-pink' : 'border-gray-200 hover:border-gray-300'} p-4 transition-colors cursor-pointer`}
                    onClick={() => handleStyleChange('button_style', 'offset-background')}
                  >
                    <h4 className="font-medium text-center mb-2">Offset Background</h4>
                    <p className="text-xs text-gray-500 text-center mb-4">Unique stylistic look</p>
                    <div className="space-y-2">
                      <ButtonPreview
                        variant="primary"
                        radius={siteStyles.button_radius as any || 'slightly-rounded'}
                        style="offset-background"
                      />
                      <ButtonPreview
                        variant="tertiary"
                        radius={siteStyles.button_radius as any || 'slightly-rounded'}
                        style="offset-background"
                      />
                    </div>
                    {siteStyles.button_style === 'offset-background' && (
                      <div className="absolute top-2 right-2">
                        <div 
                          className={getCheckMarkStyles().className}
                          style={getCheckMarkStyles().style}
                        >
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Compact Style */}
                  <div className={`relative rounded-lg border-2 ${siteStyles.button_style === 'compact' ? 'border-primary-pink' : 'border-gray-200 hover:border-gray-300'} p-4 transition-colors cursor-pointer`}
                    onClick={() => handleStyleChange('button_style', 'compact')}
                  >
                    <h4 className="font-medium text-center mb-2">Compact</h4>
                    <p className="text-xs text-gray-500 text-center mb-4">Minimal and clean profile</p>
                    <div className="space-y-2">
                      <ButtonPreview
                        variant="primary"
                        radius={siteStyles.button_radius as any || 'slightly-rounded'}
                        style="compact"
                      />
                      <ButtonPreview
                        variant="tertiary"
                        radius={siteStyles.button_radius as any || 'slightly-rounded'}
                        style="compact"
                      />
                    </div>
                    {siteStyles.button_style === 'compact' && (
                      <div className="absolute top-2 right-2">
                        <div 
                          className={getCheckMarkStyles().className}
                          style={getCheckMarkStyles().style}
                        >
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
            </div>
          )}
          
        </div>
      </div>
      
      {/* Enhanced Color Picker Modal - Global Position */}
      <EnhancedColorPicker
        isOpen={!!activeColorField}
        colorName={activeColorField || ''}
        initialColor={colorPickerValue}
        siteStyles={siteStyles}
        onClose={() => setActiveColorField(null)}
        onSave={applyColor}
      />
      
      {/* Gradient Editor Modal - Global Position */}
      <GradientEditor
        isOpen={!!activeGradientField}
        gradientName={activeGradientField || ''}
        initialGradient={gradientEditorValue}
        onClose={() => setActiveGradientField(null)}
        onSave={applyGradient}
      />
    </div>
  );
};

export default SiteStyles;