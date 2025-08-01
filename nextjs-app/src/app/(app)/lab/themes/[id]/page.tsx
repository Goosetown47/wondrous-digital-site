'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Toggle } from '@/components/ui/toggle';
import { Badge } from '@/components/ui/badge';
import { labDraftService } from '@/lib/supabase/lab-drafts';
import { 
  ArrowLeft, Save, Upload, Copy, Download,
  Sun, Moon, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { ThemePreview } from '@/components/theme-builder/theme-preview';
import { ThemePreviewProvider } from '@/components/theme-builder/theme-preview-provider';
import { ColorPicker } from '@/components/theme-builder/color-picker';
import { ColorGroupSection } from '@/components/theme-builder/color-group-section';

export default function EditThemePage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const themeId = params.id as string;

  const [isSaving, setIsSaving] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [themeVariables, setThemeVariables] = useState<any>({});
  const [isDarkMode, setIsDarkMode] = useState(false);

  const { data: draft, isLoading: isDraftLoading } = useQuery({
    queryKey: ['lab-draft', themeId],
    queryFn: () => labDraftService.getById(themeId),
  });

  const updateMutation = useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: (updates: any) => labDraftService.update(themeId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-draft', themeId] });
    },
  });

  const promoteMutation = useMutation({
    mutationFn: async () => {
      // First save the theme to ensure latest changes are persisted
      if (!draft) throw new Error('No draft found');
      
      console.log('Saving theme before promotion...');
      await updateMutation.mutateAsync({
        content: {
          ...draft.content,
          variables: themeVariables,
          description: draft.content?.description || `Theme with ${Object.keys(themeVariables.colors || {}).length} colors`,
        },
      });
      
      console.log('Starting theme promotion for:', themeId);
      return labDraftService.promoteToLibrary(themeId, 'unpublished');
    },
    onSuccess: (data) => {
      console.log('Theme promoted successfully:', data);
      router.push('/library?tab=theme');
    },
    onError: (error: Error) => {
      console.error('Failed to promote theme:', {
        message: error.message || error.toString(),
        error: error
      });
      // You could add a toast notification here
      alert(`Failed to promote theme: ${error.message || 'Unknown error'}. Check console for details.`);
    },
  });

  // Load theme variables when draft loads
  useEffect(() => {
    if (draft?.content?.variables) {
      setThemeVariables(draft.content.variables);
    }
  }, [draft]);

  const handleSave = async () => {
    if (!draft) return;
    setIsSaving(true);
    try {
      const updateData = {
        content: {
          ...draft.content,
          variables: themeVariables,
          description: draft.content?.description || `Theme with ${Object.keys(themeVariables.colors || {}).length} colors`,
        },
      };
      console.log('Saving theme with data:', updateData);
      await updateMutation.mutateAsync(updateData);
      setTimeout(() => setIsSaving(false), 500);
    } catch (error) {
      console.error('Failed to save theme:', error);
      setIsSaving(false);
    }
  };

  const handleColorChange = (colorKey: string, value: string) => {
    setThemeVariables({
      ...themeVariables,
      colors: {
        ...themeVariables.colors,
        [colorKey]: value,
      },
    });
  };

  const handleRadiusChange = (value: number[]) => {
    setThemeVariables({
      ...themeVariables,
      radius: `${value[0]}rem`,
    });
  };

  const getCSSVariables = () => {
    let css = ':root {\n';
    
    if (themeVariables.colors) {
      Object.entries(themeVariables.colors).forEach(([key, value]) => {
        css += `  --${key}: ${value};\n`;
      });
    }
    
    if (themeVariables.radius) {
      css += `  --radius: ${themeVariables.radius};\n`;
    }
    
    css += '}\n\n';
    
    // Add dark mode variables if applicable
    if (themeVariables.darkColors) {
      css += '.dark {\n';
      Object.entries(themeVariables.darkColors).forEach(([key, value]) => {
        css += `  --${key}: ${value};\n`;
      });
      css += '}';
    }
    
    return css;
  };

  const handleCopyCSS = async () => {
    try {
      await navigator.clipboard.writeText(getCSSVariables());
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy CSS:', error);
    }
  };

  if (isDraftLoading) {
    return <div className="text-center py-8">Loading theme...</div>;
  }

  if (!draft) {
    return <div className="text-center py-8">Theme not found</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Unified Header */}
      <header className="border-b bg-background">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left section */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/lab/themes">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">{draft.name}</h2>
              <Badge variant={draft.status === 'ready' ? 'default' : 'secondary'}>
                {draft.status}
              </Badge>
            </div>
          </div>


          {/* Right section */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 mr-4">
              <Toggle 
                variant="outline" 
                size="sm"
                pressed={isDarkMode}
                onPressedChange={setIsDarkMode}
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Toggle>
              <Button variant="ghost" size="sm" onClick={() => handleCopyCSS()}>
                <Copy className="mr-2 h-4 w-4" />
                Copy CSS
              </Button>
              <Button variant="ghost" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2 ml-4">
              {isSaving && (
                <span className="text-sm text-muted-foreground">Saving...</span>
              )}
              <Button variant="outline" size="sm" onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
              {draft.status !== 'promoted' && (
                <Button 
                  size="sm" 
                  onClick={() => promoteMutation.mutate()}
                  disabled={promoteMutation.isPending}
                >
                  {promoteMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Promoting...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Promote to Library
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Editor */}
        <div className="w-1/2 border-r flex flex-col">

        {/* Editor Content */}
        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="colors" className="h-full">
            <TabsList className="w-full justify-start rounded-none border-b h-auto p-0">
              <TabsTrigger value="colors" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                Colors
              </TabsTrigger>
              <TabsTrigger value="typography" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                Typography
              </TabsTrigger>
              <TabsTrigger value="sizing" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                Sizing
              </TabsTrigger>
              <TabsTrigger value="effects" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                Effects
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="colors" className="p-6 space-y-4">
            {/* Primary Colors */}
            <ColorGroupSection 
              title="Primary Colors" 
              description="Core colors used throughout your application"
              defaultOpen={true}
            >
              <ColorPicker
                label="Primary"
                value={themeVariables.colors?.primary || '222.2 47.4% 11.2%'}
                onChange={(value) => handleColorChange('primary', value)}
              />
              <ColorPicker
                label="Primary Foreground"
                value={themeVariables.colors?.['primary-foreground'] || '210 40% 98%'}
                onChange={(value) => handleColorChange('primary-foreground', value)}
              />
            </ColorGroupSection>

            {/* Secondary Colors */}
            <ColorGroupSection 
              title="Secondary Colors" 
              description="Secondary color palette"
              defaultOpen={true}
            >
              <ColorPicker
                label="Secondary"
                value={themeVariables.colors?.secondary || '210 40% 96.1%'}
                onChange={(value) => handleColorChange('secondary', value)}
              />
              <ColorPicker
                label="Secondary Foreground"
                value={themeVariables.colors?.['secondary-foreground'] || '222.2 47.4% 11.2%'}
                onChange={(value) => handleColorChange('secondary-foreground', value)}
              />
            </ColorGroupSection>

            {/* Accent Colors */}
            <ColorGroupSection 
              title="Accent Colors" 
              description="Accent and highlight colors"
              defaultOpen={false}
            >
              <ColorPicker
                label="Accent"
                value={themeVariables.colors?.accent || '210 40% 96.1%'}
                onChange={(value) => handleColorChange('accent', value)}
              />
              <ColorPicker
                label="Accent Foreground"
                value={themeVariables.colors?.['accent-foreground'] || '222.2 47.4% 11.2%'}
                onChange={(value) => handleColorChange('accent-foreground', value)}
              />
            </ColorGroupSection>

            {/* Base Colors */}
            <ColorGroupSection 
              title="Base Colors" 
              description="Background and foreground colors"
              defaultOpen={false}
            >
              <ColorPicker
                label="Background"
                value={themeVariables.colors?.background || '0 0% 100%'}
                onChange={(value) => handleColorChange('background', value)}
              />
              <ColorPicker
                label="Foreground"
                value={themeVariables.colors?.foreground || '222.2 84% 4.9%'}
                onChange={(value) => handleColorChange('foreground', value)}
              />
            </ColorGroupSection>

            {/* Card Colors */}
            <ColorGroupSection 
              title="Card Colors" 
              description="Card component colors"
              defaultOpen={false}
            >
              <ColorPicker
                label="Card"
                value={themeVariables.colors?.card || '0 0% 100%'}
                onChange={(value) => handleColorChange('card', value)}
              />
              <ColorPicker
                label="Card Foreground"
                value={themeVariables.colors?.['card-foreground'] || '222.2 84% 4.9%'}
                onChange={(value) => handleColorChange('card-foreground', value)}
              />
            </ColorGroupSection>

            {/* Popover Colors */}
            <ColorGroupSection 
              title="Popover Colors" 
              description="Popover and dropdown colors"
              defaultOpen={false}
            >
              <ColorPicker
                label="Popover"
                value={themeVariables.colors?.popover || '0 0% 100%'}
                onChange={(value) => handleColorChange('popover', value)}
              />
              <ColorPicker
                label="Popover Foreground"
                value={themeVariables.colors?.['popover-foreground'] || '222.2 84% 4.9%'}
                onChange={(value) => handleColorChange('popover-foreground', value)}
              />
            </ColorGroupSection>

            {/* State Colors */}
            <ColorGroupSection 
              title="State Colors" 
              description="Colors for different UI states"
              defaultOpen={false}
            >
              <ColorPicker
                label="Muted"
                value={themeVariables.colors?.muted || '210 40% 96.1%'}
                onChange={(value) => handleColorChange('muted', value)}
              />
              <ColorPicker
                label="Muted Foreground"
                value={themeVariables.colors?.['muted-foreground'] || '215.4 16.3% 46.9%'}
                onChange={(value) => handleColorChange('muted-foreground', value)}
              />
              <ColorPicker
                label="Destructive"
                value={themeVariables.colors?.destructive || '0 84.2% 60.2%'}
                onChange={(value) => handleColorChange('destructive', value)}
              />
              <ColorPicker
                label="Destructive Foreground"
                value={themeVariables.colors?.['destructive-foreground'] || '210 40% 98%'}
                onChange={(value) => handleColorChange('destructive-foreground', value)}
              />
            </ColorGroupSection>

            {/* UI Colors */}
            <ColorGroupSection 
              title="UI Colors" 
              description="Border, input, and focus colors"
              defaultOpen={false}
            >
              <ColorPicker
                label="Border"
                value={themeVariables.colors?.border || '214.3 31.8% 91.4%'}
                onChange={(value) => handleColorChange('border', value)}
              />
              <ColorPicker
                label="Input"
                value={themeVariables.colors?.input || '214.3 31.8% 91.4%'}
                onChange={(value) => handleColorChange('input', value)}
              />
              <ColorPicker
                label="Ring"
                value={themeVariables.colors?.ring || '222.2 84% 4.9%'}
                onChange={(value) => handleColorChange('ring', value)}
              />
            </ColorGroupSection>
            </TabsContent>
            
            <TabsContent value="typography" className="p-6">
              <div className="text-center py-12 text-muted-foreground">
                <p>Typography settings coming soon</p>
                <p className="text-sm mt-2">Font families, sizes, and weights will be configured here</p>
              </div>
            </TabsContent>
            
            <TabsContent value="sizing" className="p-6">
              <div className="text-center py-12 text-muted-foreground">
                <p>Sizing settings coming soon</p>
                <p className="text-sm mt-2">Line height, spacing, padding, and margins will be configured here</p>
              </div>
            </TabsContent>
            
            <TabsContent value="effects" className="p-6 space-y-4">
              {/* Border Radius */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Border Radius</CardTitle>
                  <CardDescription>Control the roundness of corners</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Radius</Label>
                      <span className="text-sm text-muted-foreground">
                        {themeVariables.radius || '0.5rem'}
                      </span>
                    </div>
                    <Slider
                      value={[parseFloat(themeVariables.radius || '0.5')]}
                      onValueChange={handleRadiusChange}
                      max={2}
                      step={0.1}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-sm">More effects coming soon: shadows, blur, transitions, etc.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

        {/* Right Panel - Preview */}
        <div className="w-1/2 bg-muted/30 overflow-hidden">
          <ThemePreviewProvider 
            variables={themeVariables} 
            isDarkMode={isDarkMode}
            className="h-full"
          >
            <ThemePreview variables={themeVariables} showHeader={false} />
          </ThemePreviewProvider>
        </div>
      </div>
    </div>
  );
}