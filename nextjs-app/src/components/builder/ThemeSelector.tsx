'use client';

import { useState } from 'react';
import { Check, Palette, X } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  SelectSeparator
} from '@/components/ui/select';
import { useThemes, useProjectTheme } from '@/hooks/useThemes';

interface ThemeWithNestedColors {
  id: string;
  name: string;
  variables?: {
    colors?: {
      primary?: string;
      secondary?: string;
      accent?: string;
      [key: string]: string | undefined;
    };
    radius?: string;
  };
}

interface ThemeSelectorProps {
  projectId: string;
  currentThemeId?: string | null;
}

export function ThemeSelector({ projectId, currentThemeId }: ThemeSelectorProps) {
  const { data: themes, isLoading } = useThemes();
  const { setTheme, isApplying } = useProjectTheme(projectId, currentThemeId);
  const [selectedThemeId, setSelectedThemeId] = useState<string>(currentThemeId || 'none');

  const handleThemeChange = async (value: string) => {
    const themeId = value === 'none' ? null : value;
    setSelectedThemeId(value);
    await setTheme(themeId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Palette className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading themes...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Palette className="h-4 w-4 text-muted-foreground" />
      <Select 
        value={selectedThemeId} 
        onValueChange={handleThemeChange}
        disabled={isApplying}
      >
        <SelectTrigger className="w-[240px] h-9">
          <SelectValue placeholder="Select theme" />
        </SelectTrigger>
        <SelectContent className="max-w-[280px]">
          <SelectItem value="none">
            <div className="flex items-center gap-2">
              <X className="h-3 w-3" />
              <span>No theme</span>
            </div>
          </SelectItem>
          <SelectSeparator />
          {themes?.map((theme) => {
            // Cast to our nested structure type
            const themeWithColors = theme as ThemeWithNestedColors;
            return (
              <SelectItem key={themeWithColors.id} value={themeWithColors.id}>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {/* Show color swatches */}
                    {themeWithColors.variables?.colors?.primary && (
                      <div 
                        className="w-4 h-4 rounded border border-border"
                        style={{ 
                          backgroundColor: `hsl(${themeWithColors.variables.colors.primary.replace(/\s+/g, ', ')})` 
                        }}
                      />
                    )}
                    {themeWithColors.variables?.colors?.secondary && (
                      <div 
                        className="w-4 h-4 rounded border border-border"
                        style={{ 
                          backgroundColor: `hsl(${themeWithColors.variables.colors.secondary.replace(/\s+/g, ', ')})` 
                        }}
                      />
                    )}
                    {themeWithColors.variables?.colors?.accent && (
                      <div 
                        className="w-4 h-4 rounded border border-border"
                        style={{ 
                          backgroundColor: `hsl(${themeWithColors.variables.colors.accent.replace(/\s+/g, ', ')})` 
                        }}
                      />
                    )}
                  </div>
                  <span className="truncate">{themeWithColors.name}</span>
                  {currentThemeId === themeWithColors.id && (
                    <Check className="h-3 w-3 ml-auto" />
                  )}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      {isApplying && (
        <span className="text-xs text-muted-foreground">Applying...</span>
      )}
    </div>
  );
}