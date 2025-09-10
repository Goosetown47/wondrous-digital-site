'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { labDraftService } from '@/lib/supabase/lab-drafts';
import { coreComponentsService } from '@/lib/supabase/core-components';
import { useTypes } from '@/hooks/useTypes';
import { useThemes } from '@/hooks/useThemes';
import { 
  ArrowLeft, Save, Upload, Plus, Settings, Maximize, 
  Monitor, Tablet, Smartphone, Moon, Sun, ChevronDown,
  Check, ExternalLink, Layers
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ResizablePreview } from '@/components/lab/resizable-preview';
import { HeroTwoColumn } from '@/components/sections/hero-two-column';
import { Navbar2 } from '@/components/core/navigation/navbar2';
import { Footer2 } from '@/components/core/navigation/footer2';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ImageUpload } from '@/components/lab/image-upload';
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
import type { LabDraft, CoreComponent } from '@/types/builder';
import { ComponentSelectorModal } from '@/components/lab/ComponentSelectorModal';

type DeviceView = 'desktop' | 'tablet' | 'mobile';

// Extended theme type from API response
interface ExtendedTheme {
  id: string;
  name: string;
  published?: boolean;
  class_name?: string;
  variables?: Record<string, unknown>;
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

  const [isSaving, setIsSaving] = useState(false);
  const [deviceView, setDeviceView] = useState<DeviceView>('desktop');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [autoSaveEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showComponentSelector, setShowComponentSelector] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<CoreComponent | null>(null);
  const [selectedThemeId, setSelectedThemeId] = useState<string>('default');

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

  const { data: drafts = [] } = useQuery({
    queryKey: ['lab-drafts'],
    queryFn: () => labDraftService.getAll(),
  });

  const { data: coreComponents = [] } = useQuery({
    queryKey: ['core-components'],
    queryFn: () => coreComponentsService.getAll(),
  });

  const { data: types = [] } = useTypes(draft?.type);
  const { data: themes = [] } = useThemes();

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
  const isOutOfSync = () => {
    if (!draft?.metadata?.library_item_id || !draft?.metadata?.last_synced_content_hash) {
      return false;
    }
    // Compare content hashes to detect actual content changes
    return draft.content_hash !== draft.metadata.last_synced_content_hash;
  };

  // Load saved content and component when draft loads
  useEffect(() => {
    if (draft?.content) {
      if (hasHeroContent(draft.content)) {
        setHeroContent(draft.content.heroContent);
      } else if (hasNavigationContent(draft.content)) {
        setNavigationContent(draft.content.navigationContent);
      }
    }
    
    // Load the selected component from metadata
    if (draft?.metadata?.component_name) {
      // Find the component in core components to set as selected
      coreComponents.find(c => c.name === draft.metadata.component_name);
    }
  }, [draft, coreComponents]);

  const handleSave = useCallback(async () => {
    if (!draft) return;
    setIsSaving(true);
    try {
      // Determine what content to save based on component type
      const componentName = draft.metadata?.component_name as string;
      let contentToSave = {};
      
      if (componentName === 'Navbar2' || componentName === 'Footer2') {
        contentToSave = {
          ...(typeof draft.content === 'object' ? draft.content : {}),
          navigationContent,
        };
      } else {
        contentToSave = {
          ...(typeof draft.content === 'object' ? draft.content : {}),
          heroContent,
        };
      }
      
      await updateMutation.mutateAsync({
        content: contentToSave,
      });
      setTimeout(() => setIsSaving(false), 500);
    } catch (error) {
      console.error('Failed to save draft:', error);
      setIsSaving(false);
    }
  }, [draft, heroContent, navigationContent, updateMutation]);

  // Handle component selection from modal
  const handleSelectComponent = useCallback(async (component: CoreComponent) => {
    setSelectedComponent(component);
    
    // Update draft metadata with the selected component
    try {
      await updateMutation.mutateAsync({
        metadata: {
          ...(draft?.metadata || {}),
          component_name: component.name,
          component_type: component.type,
          component_source: component.source,
        },
      });
    } catch (error) {
      console.error('Failed to update component selection:', error);
    }
  }, [draft, updateMutation]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled || !draft) return;

    const timeoutId = setTimeout(() => {
      handleSave();
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [heroContent, navigationContent, autoSaveEnabled, draft, handleSave]);

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

  const handleViewInBrowser = () => {
    window.open(`/lab/${draftId}/preview`, '_blank');
  };

  if (isDraftLoading) {
    return <div className="text-center py-8">Loading draft...</div>;
  }

  if (!draft) {
    return <div className="text-center py-8">Draft not found</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left side */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/lab">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  {draft.name}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {drafts.map((d) => (
                  <DropdownMenuItem
                    key={d.id}
                    onClick={() => router.push(`/lab/${d.id}`)}
                  >
                    {d.name}
                    {d.id === draft.id && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Building:</span>
              <Select 
                value={draft.type} 
                onValueChange={(value) => updateMutation.mutate({ type: value as 'section' | 'page' | 'site' | 'theme' })}
              >
                <SelectTrigger className="h-8 w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="section">Section</SelectItem>
                  <SelectItem value="page">Page</SelectItem>
                  <SelectItem value="site">Site</SelectItem>
                  <SelectItem value="theme">Theme</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Badge variant={draft.status === 'promoted' ? 'default' : 'secondary'}>
              {draft.status}
            </Badge>
            {draft.library_version && (
              <Badge variant="outline">v{draft.library_version}</Badge>
            )}
            {draft.status === 'promoted' && isOutOfSync() && (
              <Badge variant="destructive">Out of Sync</Badge>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {isSaving && (
              <span className="text-sm text-muted-foreground">Saving...</span>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowComponentSelector(true)}
            >
              <Layers className="mr-2 h-4 w-4" />
              {selectedComponent || draft?.metadata?.component_name ? 
                `Component: ${selectedComponent?.name || draft?.metadata?.component_name}` : 
                'Add Component'
              }
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/lab/new">
                <Plus className="mr-2 h-4 w-4" />
                New Draft
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
            {draft.status === 'promoted' && draft.metadata?.library_item_id ? (
              <Button 
                size="sm" 
                onClick={() => setShowUpdateDialog(true)}
                disabled={updateLibraryMutation.isPending}
              >
                <Upload className="mr-2 h-4 w-4" />
                {updateLibraryMutation.isPending ? 'Updating...' : 'Update in Library'}
              </Button>
            ) : (
              <Button 
                size="sm" 
                onClick={() => promoteMutation.mutate()}
                disabled={promoteMutation.isPending}
              >
                <Upload className="mr-2 h-4 w-4" />
                {promoteMutation.isPending ? 'Promoting...' : 'Promote to Library'}
              </Button>
            )}
            <Sheet open={showSettings} onOpenChange={setShowSettings}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
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

                  <div>
                    <h3 className="font-semibold mb-3">Components</h3>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-2">
                        {coreComponents.map((component: CoreComponent) => (
                          <Card key={component.id} className="cursor-pointer hover:bg-muted/50">
                            <CardHeader className="p-3">
                              <CardTitle className="text-sm">{component.name}</CardTitle>
                              <CardDescription className="text-xs">
                                {component.type}
                              </CardDescription>
                            </CardHeader>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Sub-header with controls */}
        <div className="border-t px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'preview' | 'code')}>
                <TabsList className="h-8">
                  <TabsTrigger value="preview" className="text-xs">Preview</TabsTrigger>
                  <TabsTrigger value="code" className="text-xs">Code</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                >
                  {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>

                <Select value={selectedThemeId} onValueChange={setSelectedThemeId}>
                  <SelectTrigger className="h-8 w-40">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    {(themes as ExtendedTheme[])
                      ?.filter(theme => theme.published !== false)
                      ?.map((theme) => (
                        <SelectItem key={theme.id} value={theme.id}>
                          {theme.name}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant={deviceView === 'desktop' ? 'default' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setDeviceView('desktop')}
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                variant={deviceView === 'tablet' ? 'default' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setDeviceView('tablet')}
              >
                <Tablet className="h-4 w-4" />
              </Button>
              <Button
                variant={deviceView === 'mobile' ? 'default' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setDeviceView('mobile')}
              >
                <Smartphone className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="mx-2 h-6" />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleViewInBrowser}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {/* Preview Area */}
        <div className="h-full bg-muted/30 overflow-auto">
          {activeTab === 'preview' ? (
            <ResizablePreview
              presetWidth={getDeviceWidth()}
              minWidth={320}
              maxWidth={1400}
              isDarkMode={isDarkMode}
              className={(themes as ExtendedTheme[])?.find(t => t.id === selectedThemeId)?.class_name || ''}
            >
              {(() => {
                const componentName = selectedComponent?.name || (draft?.metadata?.component_name as string);
                
                // Render navigation components
                if (componentName === 'Navbar2') {
                  return <Navbar2 {...navigationContent} />;
                } else if (componentName === 'Footer2') {
                  return <Footer2 {...navigationContent} />;
                } else if (!componentName) {
                  // No component selected yet
                  return (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <Layers className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Component Selected</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Click "Add Component" in the header to select a component from the Core library
                      </p>
                      <Button onClick={() => setShowComponentSelector(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Select Component
                      </Button>
                    </div>
                  );
                }
                
                // Default to HeroTwoColumn for other sections
                return (
                  <HeroTwoColumn
                    {...heroContent}
                    editable={true}
                    onHeadingChange={(heading) => setHeroContent({ ...heroContent, heading })}
                    onSubtextChange={(subtext) => setHeroContent({ ...heroContent, subtext })}
                    onButtonTextChange={(buttonText) => setHeroContent({ ...heroContent, buttonText })}
                    onImageChange={(file) => {
                      // Handle image upload here
                      console.log('Image uploaded:', file);
                    }}
                  />
                );
              })()}
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

      {/* Component Selector Modal */}
      <ComponentSelectorModal
        open={showComponentSelector}
        onOpenChange={setShowComponentSelector}
        onSelectComponent={handleSelectComponent}
        currentComponentName={selectedComponent?.name || (draft?.metadata?.component_name as string)}
      />
    </div>
  );
}