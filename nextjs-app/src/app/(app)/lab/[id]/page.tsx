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
import { 
  ArrowLeft, Save, Upload, Plus, Settings, Maximize, 
  Monitor, Tablet, Smartphone, Moon, Sun, ChevronDown,
  Check, ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ResizablePreview } from '@/components/lab/resizable-preview';
import { HeroTwoColumn } from '@/components/sections/hero-two-column';
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

type DeviceView = 'desktop' | 'tablet' | 'mobile';

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

  // Hero section state
  const [heroContent, setHeroContent] = useState({
    heading: "Blocks Built With Shadcn & Tailwind",
    subtext: "Finely crafted components built with React, Tailwind and Shadcn UI. Developers can copy and paste these blocks directly into their project.",
    buttonText: "Discover all components",
    buttonLink: "#",
    imageUrl: "",
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

  // Load saved content when draft loads
  useEffect(() => {
    if (draft?.content && hasHeroContent(draft.content)) {
      setHeroContent(draft.content.heroContent);
    }
  }, [draft]);

  const handleSave = useCallback(async () => {
    if (!draft) return;
    setIsSaving(true);
    try {
      await updateMutation.mutateAsync({
        content: {
          ...(typeof draft.content === 'object' ? draft.content : {}),
          heroContent,
        },
      });
      setTimeout(() => setIsSaving(false), 500);
    } catch (error) {
      console.error('Failed to save draft:', error);
      setIsSaving(false);
    }
  }, [draft, heroContent, updateMutation]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled || !draft) return;

    const timeoutId = setTimeout(() => {
      handleSave();
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [heroContent, autoSaveEnabled, draft, handleSave]);

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

            <Badge variant="outline">{draft.type}</Badge>
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
                      <div>
                        <Label htmlFor="type">Type</Label>
                        <Select
                          value={draft.type_id || ''}
                          onValueChange={(value) => updateMutation.mutate({ type_id: value })}
                        >
                          <SelectTrigger id="type">
                            <SelectValue placeholder="Select a type" />
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
                      {draft.type === 'section' && (
                        <div>
                          <Label htmlFor="component-name">Component Name</Label>
                          <Input
                            id="component-name"
                            value={(draft.metadata?.component_name as string) || ''}
                            onChange={(e) => updateMutation.mutate({
                              metadata: { ...(draft.metadata || {}), component_name: e.target.value }
                            })}
                            placeholder="e.g., HeroTwoColumn"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            React component name for rendering this section
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-3">Content Properties</h3>
                    <div className="space-y-4">
                      {/* TODO: This section editor is hardcoded for HeroTwoColumn sections.
                          The lab should dynamically render different property editors based on the section type.
                          For now, we'll show these fields only when it's a hero section. */}
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

                <Select defaultValue="default">
                  <SelectTrigger className="h-8 w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="neobrutalism">Neo Brutalism</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
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
            >
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
{`<HeroTwoColumn
  heading="${heroContent.heading}"
  subtext="${heroContent.subtext}"
  buttonText="${heroContent.buttonText}"
  buttonLink="${heroContent.buttonLink}"
/>`}
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
    </div>
  );
}