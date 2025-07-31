'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { labDraftService } from '@/lib/supabase/lab-drafts';

const themePresets = [
  { name: 'Default', id: 'default', description: 'Clean and modern default theme' },
  { name: 'Dark', id: 'dark', description: 'Dark mode optimized theme' },
  { name: 'Vibrant', id: 'vibrant', description: 'Bold and colorful theme' },
  { name: 'Minimal', id: 'minimal', description: 'Simple and elegant theme' },
  { name: 'Custom', id: 'custom', description: 'Start from scratch' },
];

export default function NewThemePage() {
  const router = useRouter();
  const [themeName, setThemeName] = useState('');
  const [preset, setPreset] = useState('default');
  const [isCreating, setIsCreating] = useState(false);

  const createMutation = useMutation({
    mutationFn: (draft: any) => labDraftService.create(draft),
    onSuccess: (data) => {
      router.push(`/lab/themes/${data.id}`);
    },
  });

  const handleCreateTheme = async () => {
    if (!themeName.trim()) return;

    setIsCreating(true);
    try {
      // Get default theme variables based on preset
      const defaultVariables = getDefaultThemeVariables(preset);

      await createMutation.mutateAsync({
        name: themeName,
        type: 'theme',
        content: {
          variables: defaultVariables,
          metadata: {
            preset,
          },
        },
        status: 'draft',
      });
    } catch (error) {
      console.error('Failed to create theme:', error);
      setIsCreating(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/lab/themes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Create New Theme</h2>
          <p className="text-muted-foreground">
            Start with a preset or create a custom theme from scratch
          </p>
        </div>
      </div>

      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Theme Details</CardTitle>
            <CardDescription>
              Choose a name and starting preset for your theme
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme-name">Theme Name</Label>
              <Input
                id="theme-name"
                placeholder="My Custom Theme"
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preset">Starting Preset</Label>
              <Select value={preset} onValueChange={setPreset}>
                <SelectTrigger id="preset">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {themePresets.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-sm text-muted-foreground">{p.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" asChild>
            <Link href="/lab/themes">Cancel</Link>
          </Button>
          <Button 
            onClick={handleCreateTheme} 
            disabled={!themeName.trim() || isCreating}
          >
            {isCreating ? 'Creating...' : 'Create Theme'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Helper function to get default theme variables based on preset
function getDefaultThemeVariables(preset: string) {
  const baseVariables = {
    colors: {
      background: '0 0% 100%',
      foreground: '222.2 84% 4.9%',
      card: '0 0% 100%',
      'card-foreground': '222.2 84% 4.9%',
      popover: '0 0% 100%',
      'popover-foreground': '222.2 84% 4.9%',
      primary: '222.2 47.4% 11.2%',
      'primary-foreground': '210 40% 98%',
      secondary: '210 40% 96.1%',
      'secondary-foreground': '222.2 47.4% 11.2%',
      muted: '210 40% 96.1%',
      'muted-foreground': '215.4 16.3% 46.9%',
      accent: '210 40% 96.1%',
      'accent-foreground': '222.2 47.4% 11.2%',
      destructive: '0 84.2% 60.2%',
      'destructive-foreground': '210 40% 98%',
      border: '214.3 31.8% 91.4%',
      input: '214.3 31.8% 91.4%',
      ring: '222.2 84% 4.9%',
    },
    radius: '0.5rem',
  };

  // Customize based on preset
  switch (preset) {
    case 'dark':
      return {
        ...baseVariables,
        colors: {
          ...baseVariables.colors,
          background: '222.2 84% 4.9%',
          foreground: '210 40% 98%',
          card: '222.2 84% 4.9%',
          'card-foreground': '210 40% 98%',
          popover: '222.2 84% 4.9%',
          'popover-foreground': '210 40% 98%',
          primary: '210 40% 98%',
          'primary-foreground': '222.2 47.4% 11.2%',
          secondary: '217.2 32.6% 17.5%',
          'secondary-foreground': '210 40% 98%',
          muted: '217.2 32.6% 17.5%',
          'muted-foreground': '215 20.2% 65.1%',
          accent: '217.2 32.6% 17.5%',
          'accent-foreground': '210 40% 98%',
          destructive: '0 62.8% 30.6%',
          'destructive-foreground': '210 40% 98%',
          border: '217.2 32.6% 17.5%',
          input: '217.2 32.6% 17.5%',
          ring: '212.7 26.8% 83.9%',
        },
      };
    case 'vibrant':
      return {
        ...baseVariables,
        colors: {
          ...baseVariables.colors,
          primary: '262.1 83.3% 57.8%',
          secondary: '173.4 80.4% 40%',
          accent: '24.6 95% 53.1%',
        },
      };
    case 'minimal':
      return {
        ...baseVariables,
        colors: {
          ...baseVariables.colors,
          primary: '0 0% 9%',
          secondary: '0 0% 96%',
          accent: '0 0% 96%',
        },
        radius: '0',
      };
    default:
      return baseVariables;
  }
}