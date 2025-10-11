'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { labDraftService } from '@/lib/supabase/lab-drafts';
import { useTypes, useTypesByCategory } from '@/hooks/useTypes';
import { useThemes, useTheme } from '@/hooks/useThemes';
import {
  Monitor, Tablet, Smartphone,
  Edit2,
  Settings,
  History,
  Plus
} from 'lucide-react';
import { ResizablePreview } from '@/components/lab/resizable-preview';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
// import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
// import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
// import { cn } from '@/lib/utils'; // Unused utility
import type { LabDraft, SectionContent, PageContent } from '@/types/builder';
import { OpenSavedModal } from '@/components/lab/OpenSavedModal';
import { SaveDraftModal } from '@/components/lab/SaveDraftModal';
import { EditDraftModal } from '@/components/lab/EditDraftModal';
import { VersionHistory } from '@/components/lab/VersionHistory';
import { ImageUpload } from '@/components/ui/image-upload';
import { LabCanvas } from '@/components/lab/LabCanvas';
import { useLabStore } from '@/stores/labStore';

type DeviceView = 'desktop' | 'tablet' | 'mobile';

interface ThemeWithNestedColors {
  id: string;
  name: string;
  published?: boolean;
  variables?: {
    colors?: {
      primary?: string;
      secondary?: string;
      accent?: string;
      [key: string]: string | undefined;
    };
    radius?: string;
  };
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
  usage_count?: number;
}

interface NavigationMenuItem {
  title: string;
  url: string;
  description?: string;
  items?: NavigationMenuItem[];
}

interface NavigationContentType {
  logo: {
    url: string;
    src: string;
    alt: string;
    title: string;
  };
  menu: NavigationMenuItem[];
  auth: {
    login: { title: string; url: string; };
    signup: { title: string; url: string; };
  };
}

interface HeroSectionContent {
  heroContent: {
    heading: string;
    subtext: string;
    buttonText: string;
    buttonLink: string;
    imageUrl: string;
  };
}

// Type guard to check if content has heroContent
function hasHeroContent(content: unknown): content is HeroSectionContent {
  return (
    typeof content === 'object' &&
    content !== null &&
    'heroContent' in content &&
    typeof (content as Record<string, unknown>).heroContent === 'object'
  );
}

// Type guard to check if content has navigationContent
interface NavigationSectionContent {
  navigationContent: NavigationContentType;
}

function hasNavigationContent(content: unknown): content is NavigationSectionContent {
  return (
    typeof content === 'object' &&
    content !== null &&
    'navigationContent' in content &&
    typeof (content as Record<string, unknown>).navigationContent === 'object'
  );
}

export default function EditDraftPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const draftId = params.id as string;

  // Lab store for multi-section support
  const { loadDraft, getContent, isDirty, markClean } = useLabStore();

  // const [isSaving, setIsSaving] = useState(false);
  const [deviceView, setDeviceView] = useState<DeviceView>('desktop');
  const [isDarkMode] = useState(false);
  // const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab] = useState<'preview' | 'code'>('preview');
  const [autoSaveEnabled] = useState(true);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showOpenSavedModal, setShowOpenSavedModal] = useState(false);
  const [showSaveDraftModal, setShowSaveDraftModal] = useState(false);
  const [selectedThemeId, setSelectedThemeId] = useState<string>('');
  const [selectedSubType, setSelectedSubType] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [showEditDraftModal, setShowEditDraftModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [selectedType, setSelectedType] = useState<'section' | 'page' | 'site' | 'theme'>('section');

  // Hero section state
  const [heroContent, setHeroContent] = useState({
    heading: "Blocks Built With Shadcn & Tailwind",
    subtext: "Finely crafted components built with React, Tailwind and Shadcn UI. Developers can copy and paste these blocks directly into their project.",
    buttonText: "Discover all components",
    buttonLink: "#",
    imageUrl: "",
  });

  // Navigation content state (for testing navigation components)
  const [navigationContent, setNavigationContent] = useState<NavigationContentType>({
    logo: {
      url: "/",
      src: "/logo.png",
      alt: "Logo",
      title: "Test Site"
    },
    menu: [
      { title: "Home", url: "/" },
      { title: "About", url: "/about" },
      {
        title: "Services",
        url: "/services",
        items: [
          { title: "Consulting", url: "/services/consulting", description: "Expert guidance for your business" },
          { title: "Development", url: "/services/development", description: "Custom software solutions" }
        ]
      },
      { title: "Contact", url: "/contact" }
    ],
    auth: {
      login: { title: "Sign In", url: "/login" },
      signup: { title: "Get Started", url: "/signup" }
    }
  });

  const { data: draft, isLoading: isDraftLoading } = useQuery({
    queryKey: ['lab-draft', draftId],
    queryFn: () => labDraftService.getById(draftId),
  });

  // const { data: drafts = [] } = useQuery({
  //   queryKey: ['lab-drafts'],
  //   queryFn: () => labDraftService.getAll(),
  // });


  const { data: types = [] } = useTypes(draft?.type);
  const { data: themes = [] } = useThemes();
  const { data: subtypes = [] } = useTypesByCategory(
    (selectedType === 'section' || selectedType === 'page') ? selectedType : 'section'
  );
  
  // Get the full theme data for the selected theme
  const { data: selectedTheme } = useTheme(selectedThemeId);

  const updateMutation = useMutation({
    mutationFn: (updates: Partial<Omit<LabDraft, 'id' | 'created_at' | 'updated_at'>>) => labDraftService.update(draftId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-draft', draftId] });
    },
  });

  const promoteMutation = useMutation({
    mutationFn: () => labDraftService.promoteToLibrary(draftId, 'unpublished'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-draft', draftId] });
      router.push('/library');
    },
  });

  const updateLibraryMutation = useMutation({
    mutationFn: () => labDraftService.updateLibraryItem(draftId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-draft', draftId] });
      setShowUpdateDialog(false);
    },
  });

  // Check if draft is out of sync with library
  // const isOutOfSync = () => {
  //   if (!draft?.metadata?.library_item_id || !draft?.metadata?.last_synced_content_hash) {
  //     return false;
  //   }
  //   // Compare content hashes to detect actual content changes
  //   return draft.content_hash !== draft.metadata.last_synced_content_hash;
  // };

  // Track if we've loaded this draft to prevent reloading on every save
  const hasLoadedDraftRef = useRef(false);

  // Load saved content into lab store when draft loads (only once)
  useEffect(() => {
    if (draft?.content && !hasLoadedDraftRef.current) {
      // Load the draft into the store (handles both single and multi-section)
      // Only load if type is 'section' or 'page' (types that support multi-section)
      if (draft.type === 'section' || draft.type === 'page') {
        loadDraft(draftId, draft.name, draft.type, draft.content as Record<string, unknown>);
      }
      hasLoadedDraftRef.current = true;

      // For backward compatibility with settings panel, extract content
      if (hasHeroContent(draft.content)) {
        setHeroContent(draft.content.heroContent);
      } else if (hasNavigationContent(draft.content)) {
        setNavigationContent(draft.content.navigationContent);
      }

      // Set the selected type from draft
      if (draft?.type) {
        setSelectedType(draft.type);
      }

      // Set the selected subtype if draft has a type_id
      if (draft?.type_id) {
        setSelectedSubType(draft.type_id);
      }
    }
  }, [draft, draftId, loadDraft]); // Dependencies but only runs once due to hasLoadedDraftRef

  const handleSave = useCallback(async () => {
    if (!draft || !isDirty) return; // Only save if dirty
    try {
      // Get the current content from the lab store
      const contentToSave = getContent();

      await updateMutation.mutateAsync({
        content: contentToSave as unknown as SectionContent | PageContent,
      });

      // Mark as clean after successful save
      markClean();
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  }, [draft, isDirty, getContent, updateMutation, markClean]);


  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled || !draft || !isDirty) return;

    const timeoutId = setTimeout(() => {
      handleSave();
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [isDirty, autoSaveEnabled, draft, handleSave]); // Only trigger on isDirty change, not sections

  const getDeviceWidth = () => {
    switch (deviceView) {
      case 'mobile':
        return 375;
      case 'tablet':
        return 740; // Below @md:768px breakpoint to trigger stacking
      default:
        return null; // null means full width
    }
  };

  // const handleViewInBrowser = () => {
  //   window.open(`/lab/${draftId}/preview`, '_blank');
  // };

  if (isDraftLoading) {
    return <div className="text-center py-8">Loading draft...</div>;
  }

  if (!draft) {
    return <div className="text-center py-8">Draft not found</div>;
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="border-b bg-background" role="banner">
        {/* Top Header Row */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left side - Draft Name and Description */}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold">{draft.name || 'Draft Name'}</h1>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={() => setShowEditDraftModal(true)}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {(draft.metadata?.description as string) || 'Add a description for this draft'}
              </p>
            </div>

            {/* Right side - Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Save status indicator */}
              {isDirty && (
                <span className="text-xs text-amber-600 font-medium mr-2">
                  Unsaved changes
                </span>
              )}

              <Button 
                className="bg-primary text-primary-foreground hover:bg-primary/90" 
                size="sm"
                onClick={() => setShowOpenSavedModal(true)}
              >
                Open Saved
              </Button>

              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90 relative"
                size="sm"
                onClick={() => setShowSaveDraftModal(true)}
              >
                {isDirty && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                )}
                Save Draft
              </Button>

              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                size="sm"
                onClick={() => {
                  // Check if this draft is linked to a library item (either already promoted or created from library)
                  const hasLibraryLink = (draft.status === 'promoted' && draft.metadata?.library_item_id) ||
                                       draft.metadata?.parent_library_id;
                  if (hasLibraryLink) {
                    setShowUpdateDialog(true);
                  } else {
                    promoteMutation.mutate();
                  }
                }}
                disabled={promoteMutation.isPending || updateLibraryMutation.isPending}
              >
                {((draft.status === 'promoted' && draft.metadata?.library_item_id) || draft.metadata?.parent_library_id)
                  ? 'Update Library Item'
                  : 'Promote to Library'}
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Header Row */}
        <div className="border-t px-4 py-2">
          <div className="flex items-center justify-between">
            {/* Left side - Configuration Dropdowns */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Sections</span>
                <Button
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-8"
                  size="sm"
                  onClick={() => {
                    // Get LabCanvas instance and trigger add section at the end
                    const labCanvasElement = document.querySelector('[data-lab-canvas]');
                    if (labCanvasElement) {
                      labCanvasElement.dispatchEvent(new CustomEvent('add-section'));
                    }
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Section
                </Button>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Theme</span>
                <Select value={selectedThemeId} onValueChange={setSelectedThemeId}>
                  <SelectTrigger className="h-8 w-80" aria-label="Theme">
                    <SelectValue placeholder="Select Theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {(themes as ThemeWithNestedColors[])
                      ?.filter(theme => theme.published !== false)
                      ?.map((theme) => (
                        <SelectItem key={theme.id} value={theme.id}>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              {/* Show color swatches */}
                              {theme.variables?.colors?.primary && (
                                <div 
                                  className="w-4 h-4 rounded-full border border-border"
                                  style={{ 
                                    backgroundColor: `hsl(${theme.variables.colors.primary.replace(/\s+/g, ', ')})` 
                                  }}
                                />
                              )}
                              {theme.variables?.colors?.secondary && (
                                <div 
                                  className="w-4 h-4 rounded-full border border-border"
                                  style={{ 
                                    backgroundColor: `hsl(${theme.variables.colors.secondary.replace(/\s+/g, ', ')})` 
                                  }}
                                />
                              )}
                              {theme.variables?.colors?.accent && (
                                <div 
                                  className="w-4 h-4 rounded-full border border-border"
                                  style={{ 
                                    backgroundColor: `hsl(${theme.variables.colors.accent.replace(/\s+/g, ', ')})` 
                                  }}
                                />
                              )}
                            </div>
                            <span>{theme.name}</span>
                          </div>
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Type</span>
                <Select
                  value={selectedType}
                  onValueChange={(value) => {
                    const newType = value as 'section' | 'page' | 'site' | 'theme';
                    setSelectedType(newType);
                    setSelectedSubType(''); // Reset subtype when type changes
                    updateMutation.mutate({ type: newType });
                  }}
                >
                  <SelectTrigger className="h-8 w-28" aria-label="Type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="section">Section</SelectItem>
                    <SelectItem value="page">Page</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Sub Type</span>
                <Select 
                  value={selectedSubType} 
                  onValueChange={(value) => {
                    setSelectedSubType(value);
                    updateMutation.mutate({ type_id: value });
                  }}
                >
                  <SelectTrigger className="h-8 w-32" aria-label="Subtype">
                    <SelectValue placeholder="Select Subtype" />
                  </SelectTrigger>
                  <SelectContent>
                    {subtypes.map((subtype) => (
                      <SelectItem key={subtype.id} value={subtype.id}>
                        {subtype.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Version</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => setShowVersionModal(true)}
                >
                  <History className="h-3 w-3 mr-1" />
                  Version History
                </Button>
              </div>
            </div>

            {/* Right side - Viewport Toggles */}
            <div className="flex items-center gap-1">
              <Button
                variant={deviceView === 'desktop' ? 'default' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setDeviceView('desktop')}
                aria-label="Desktop"
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                variant={deviceView === 'tablet' ? 'default' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setDeviceView('tablet')}
                aria-label="Tablet"
              >
                <Tablet className="h-4 w-4" />
              </Button>
              <Button
                variant={deviceView === 'mobile' ? 'default' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setDeviceView('mobile')}
                aria-label="Mobile"
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Settings Sheet - Moved outside header */}
      <Sheet open={showSettings} onOpenChange={setShowSettings}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="hidden">
            <Settings className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Settings</SheetTitle>
            <SheetDescription>
              Configure your draft settings and properties
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Draft Settings</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="draft-name">Name</Label>
                  <Input
                    id="draft-name"
                    value={draft.name}
                    onChange={(e) => updateMutation.mutate({ name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="draft-description">Description</Label>
                  <Textarea
                    id="draft-description"
                    value={(draft.metadata?.description as string) || ''}
                    onChange={(e) => updateMutation.mutate({
                      metadata: { ...(draft.metadata || {}), description: e.target.value }
                    })}
                    rows={3}
                  />
                </div>
                {(() => {
                  const componentName = draft?.metadata?.component_name as string;
                  
                  // Don't show type selector for navigation components
                  if (componentName !== 'Navbar2' && componentName !== 'Footer2') {
                    return (
                      <>
                        <div>
                          <Label htmlFor="type">Category</Label>
                          <Select
                            value={draft.type_id || ''}
                            onValueChange={(value) => updateMutation.mutate({ type_id: value })}
                                >
                                  <SelectTrigger id="type">
                                    <SelectValue placeholder="Select a category" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {types?.map((type) => (
                                      <SelectItem key={type.id} value={type.id}>
                                        {type.display_name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Categorize this {draft.type} for better organization
                                </p>
                              </div>
                            </>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-3">Content Properties</h3>
                    <div className="space-y-4">
                      {(() => {
                        const componentName = draft?.metadata?.component_name as string;
                        
                        // Navigation component properties
                        if (componentName === 'Navbar2' || componentName === 'Footer2') {
                          return (
                            <>
                              <div className="space-y-4">
                                <h4 className="text-sm font-medium">Navigation Settings</h4>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium mb-2">Logo</h4>
                                <div className="space-y-2">
                                  <div>
                                    <Label>Logo Image</Label>
                                    {navigationContent.logo.src ? (
                                      <div className="space-y-2">
                                        <div className="relative h-20 w-full overflow-hidden rounded-lg bg-muted flex items-center justify-center">
                                          <img
                                            src={navigationContent.logo.src}
                                            alt="Logo"
                                            className="max-h-16 max-w-full object-contain"
                                          />
                                          <Button
                                            size="sm"
                                            variant="destructive"
                                            className="absolute right-2 top-2"
                                            onClick={() => setNavigationContent({
                                              ...navigationContent,
                                              logo: { ...navigationContent.logo, src: '' }
                                            })}
                                          >
                                            Remove
                                          </Button>
                                        </div>
                                        <Input
                                          value={navigationContent.logo.src}
                                          onChange={(e) => setNavigationContent({
                                            ...navigationContent,
                                            logo: { ...navigationContent.logo, src: e.target.value }
                                          })}
                                          placeholder="Or enter a different logo URL"
                                        />
                                      </div>
                                    ) : (
                                      <div className="space-y-2">
                                        <ImageUpload
                                          bucket="lab"
                                          path={`drafts/${draftId}/logos`}
                                          className="h-32"
                                          onUpload={(result) => {
                                            if (result.publicUrl || result.url) {
                                              setNavigationContent({
                                                ...navigationContent,
                                                logo: { 
                                                  ...navigationContent.logo, 
                                                  src: result.publicUrl || result.url || ''
                                                }
                                              });
                                            }
                                          }}
                                        />
                                        <div className="text-center text-sm text-muted-foreground">or</div>
                                        <Input
                                          placeholder="Enter a logo URL"
                                          value={navigationContent.logo.src}
                                          onChange={(e) => setNavigationContent({
                                            ...navigationContent,
                                            logo: { ...navigationContent.logo, src: e.target.value }
                                          })}
                                        />
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <Label htmlFor="logo-title">Brand Name</Label>
                                    <Input
                                      id="logo-title"
                                      value={navigationContent.logo.title}
                                      onChange={(e) => setNavigationContent({
                                        ...navigationContent,
                                        logo: { ...navigationContent.logo, title: e.target.value }
                                      })}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="logo-url">Logo Link URL</Label>
                                    <Input
                                      id="logo-url"
                                      value={navigationContent.logo.url}
                                      onChange={(e) => setNavigationContent({
                                        ...navigationContent,
                                        logo: { ...navigationContent.logo, url: e.target.value }
                                      })}
                                    />
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium mb-2">Menu Items</h4>
                                <p className="text-xs text-muted-foreground mb-2">
                                  Demo menu structure for testing. Customer-facing editor will have full drag-drop functionality.
                                </p>
                                <div className="space-y-2">
                                  {navigationContent.menu.map((item, index) => (
                                    <div key={index} className="p-2 bg-muted rounded text-sm">
                                      {item.title} - {item.url}
                                      {item.items && ` (${item.items.length} subitems)`}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium mb-2">Auth Buttons</h4>
                                <div className="space-y-2">
                                  <div>
                                    <Label htmlFor="login-text">Login Button Text</Label>
                                    <Input
                                      id="login-text"
                                      value={navigationContent.auth.login.title}
                                      onChange={(e) => setNavigationContent({
                                        ...navigationContent,
                                        auth: {
                                          ...navigationContent.auth,
                                          login: { ...navigationContent.auth.login, title: e.target.value }
                                        }
                                      })}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="signup-text">Signup Button Text</Label>
                                    <Input
                                      id="signup-text"
                                      value={navigationContent.auth.signup.title}
                                      onChange={(e) => setNavigationContent({
                                        ...navigationContent,
                                        auth: {
                                          ...navigationContent.auth,
                                          signup: { ...navigationContent.auth.signup, title: e.target.value }
                                        }
                                      })}
                                    />
                                  </div>
                                </div>
                              </div>
                            </>
                          );
                        }
                        
                        // Default hero section properties
                        return (
                          <>
                            <div>
                              <Label htmlFor="heading">Heading</Label>
                              <Input
                                id="heading"
                                value={heroContent.heading}
                                onChange={(e) => setHeroContent({ ...heroContent, heading: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor="subtext">Subtext</Label>
                              <Textarea
                                id="subtext"
                                value={heroContent.subtext}
                                onChange={(e) => setHeroContent({ ...heroContent, subtext: e.target.value })}
                                rows={3}
                              />
                            </div>
                            <div>
                              <Label htmlFor="buttonText">Button Text</Label>
                              <Input
                                id="buttonText"
                                value={heroContent.buttonText}
                                onChange={(e) => setHeroContent({ ...heroContent, buttonText: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor="buttonLink">Button Link</Label>
                              <Input
                                id="buttonLink"
                                value={heroContent.buttonLink}
                                onChange={(e) => setHeroContent({ ...heroContent, buttonLink: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label>Hero Image</Label>
                              {heroContent.imageUrl ? (
                                <div className="space-y-2">
                                  <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                                    <img
                                      src={heroContent.imageUrl}
                                      alt="Hero image"
                                      className="h-full w-full object-cover"
                                    />
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      className="absolute right-2 top-2"
                                      onClick={() => setHeroContent({ ...heroContent, imageUrl: '' })}
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                  <Input
                                    value={heroContent.imageUrl}
                                    onChange={(e) => setHeroContent({ ...heroContent, imageUrl: e.target.value })}
                                    placeholder="Or enter a different image URL"
                                  />
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <ImageUpload
                                    bucket="lab"
                                    path={`drafts/${draftId}/images`}
                                    onUpload={(result) => {
                                      if (result.publicUrl || result.url) {
                                        setHeroContent({ 
                                          ...heroContent, 
                                          imageUrl: result.publicUrl || result.url || ''
                                        });
                                      }
                                    }}
                                  />
                                  <div className="text-center text-sm text-muted-foreground">or</div>
                                  <Input
                                    placeholder="Enter an image URL"
                                    value={heroContent.imageUrl}
                                    onChange={(e) => setHeroContent({ ...heroContent, imageUrl: e.target.value })}
                                  />
                                </div>
                              )}
                            </div>
                          </>
                        );
                      })()}
                      {draft.library_version && (
                        <div>
                          <Label>Current Library Version</Label>
                          <p className="text-sm text-muted-foreground">
                            Version {draft.library_version}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                </div>
              </SheetContent>
            </Sheet>

      {/* Main Content */}
      <div className="flex-1 min-h-0 flex flex-col" data-testid="lab-canvas">
        {/* Preview Area */}
        <div className="flex-1 min-h-0 bg-muted/30 flex flex-col">
          {activeTab === 'preview' ? (
            <ResizablePreview
              presetWidth={getDeviceWidth()}
              minWidth={320}
              maxWidth={1400}
              isDarkMode={isDarkMode}
              data-testid="resizable-preview"
            >
              <LabCanvas theme={selectedTheme} />
            </ResizablePreview>
          ) : (
            <div className="p-8">
              <Card className="max-w-4xl mx-auto">
                <CardHeader>
                  <CardTitle>Component Code</CardTitle>
                  <CardDescription>
                    Copy this code to use the component in your project
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm">
{(() => {
  const componentName = draft?.metadata?.component_name as string;
  
  if (componentName === 'Navbar2' || componentName === 'Footer2') {
    return `<${componentName}
  logo={{
    url: "${navigationContent.logo.url}",
    src: "${navigationContent.logo.src}",
    alt: "${navigationContent.logo.alt}",
    title: "${navigationContent.logo.title}"
  }}
  menu={[
    ${navigationContent.menu.map(item => 
      `{ title: "${item.title}", url: "${item.url}"${item.items ? `, items: [...]` : ''} }`
    ).join(',\n    ')}
  ]}
  auth={{
    login: { title: "${navigationContent.auth.login.title}", url: "${navigationContent.auth.login.url}" },
    signup: { title: "${navigationContent.auth.signup.title}", url: "${navigationContent.auth.signup.url}" }
  }}
/>`;
  }
  
  // Default to HeroTwoColumn
  return `<HeroTwoColumn
  heading="${heroContent.heading}"
  subtext="${heroContent.subtext}"
  buttonText="${heroContent.buttonText}"
  buttonLink="${heroContent.buttonLink}"
/>`;
})()}
                    </code>
                  </pre>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Update Library Dialog */}
      <AlertDialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Library Template</AlertDialogTitle>
            <AlertDialogDescription>
              This will update the template in the library with your latest changes.
              <br /><br />
              <strong>Important:</strong> Existing uses of this template in projects will not be affected. 
              Only new instances dragged from the library will use the updated version.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => updateLibraryMutation.mutate()}>
              Update Template
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <OpenSavedModal
        open={showOpenSavedModal}
        onOpenChange={setShowOpenSavedModal}
      />

      <SaveDraftModal
        open={showSaveDraftModal}
        onOpenChange={setShowSaveDraftModal}
        currentDraftId={draftId}
        currentDraftName={draft?.name || ''}
        currentDraftType={draft?.type as 'section' | 'page' || 'section'}
        currentDraft={draft}
      />

      <EditDraftModal
        open={showEditDraftModal}
        onOpenChange={setShowEditDraftModal}
        draftName={draft.name}
        draftDescription={(draft.metadata?.description as string) || ''}
        onSave={async (name, description) => {
          await updateMutation.mutateAsync({
            name,
            metadata: {
              ...(draft.metadata || {}),
              description,
            },
          });
        }}
      />

      <VersionHistory
        open={showVersionModal}
        onOpenChange={setShowVersionModal}
        currentDraft={draft}
        onLoadVersion={(selectedDraft) => {
          // Navigate to the selected version
          router.push(`/lab/${selectedDraft.id}`);
        }}
      />
    </div>
  );
}