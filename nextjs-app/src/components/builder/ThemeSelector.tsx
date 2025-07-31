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
import { cn } from '@/lib/utils';

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
          {themes?.map((theme) => (
            <SelectItem key={theme.id} value={theme.id}>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {/* Show color swatches */}
                  {theme.variables?.colors?.primary && (
                    <div 
                      className="w-4 h-4 rounded border border-border"
                      style={{ 
                        backgroundColor: `hsl(${theme.variables.colors.primary})` 
                      }}
                    />
                  )}
                  {theme.variables?.colors?.secondary && (
                    <div 
                      className="w-4 h-4 rounded border border-border"
                      style={{ 
                        backgroundColor: `hsl(${theme.variables.colors.secondary})` 
                      }}
                    />
                  )}
                  {theme.variables?.colors?.accent && (
                    <div 
                      className="w-4 h-4 rounded border border-border"
                      style={{ 
                        backgroundColor: `hsl(${theme.variables.colors.accent})` 
                      }}
                    />
                  )}
                </div>
                <span className="truncate">{theme.name}</span>
                {currentThemeId === theme.id && (
                  <Check className="h-3 w-3 ml-auto" />
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isApplying && (
        <span className="text-xs text-muted-foreground">Applying...</span>
      )}
    </div>
  );
}