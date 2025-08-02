'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { HslColorPicker } from 'react-colorful';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Palette } from 'lucide-react';
import { TailwindPalette } from './tailwind-palette';

interface ColorPickerProps {
  label: string;
  value: string; // Space-separated HSL format: "222 47% 11%"
  onChange: (value: string) => void;
  showTailwindPalette?: boolean;
}

interface HslColor {
  h: number;
  s: number;
  l: number;
}

// Convert space-separated HSL string to react-colorful format
// Input: "222 47% 11%" Output: { h: 222, s: 47, l: 11 }
const parseHSLString = (hslString: string): HslColor => {
  const parts = hslString.split(' ');
  return {
    h: parseFloat(parts[0]) || 0,
    s: parseFloat(parts[1]?.replace('%', '')) || 0,
    l: parseFloat(parts[2]?.replace('%', '')) || 0,
  };
};

// Convert react-colorful format to space-separated HSL string
const formatHSLString = (color: HslColor): string => {
  return `${Math.round(color.h)} ${Math.round(color.s)}% ${Math.round(color.l)}%`;
};

// Convert HSL to Hex
const hslToHex = (h: number, s: number, l: number): string => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

// Convert Hex to HSL
const hexToHsl = (hex: string): HslColor => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 0, l: 0 };
  
  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;
  
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
};

export function ColorPicker({ 
  label, 
  value, 
  onChange,
  showTailwindPalette = true 
}: ColorPickerProps) {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isTailwindOpen, setIsTailwindOpen] = useState(false);
  const [color, setColor] = useState<HslColor>(parseHSLString(value));
  const [hexValue, setHexValue] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  
  // Debounced onChange to prevent rapid updates
  const debouncedOnChange = useCallback((newValue: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      onChange(newValue);
    }, 50);
  }, [onChange]);

  // Update local state when prop changes
  useEffect(() => {
    const newColor = parseHSLString(value);
    // Only update if values actually changed to prevent loops
    if (newColor.h !== color.h || newColor.s !== color.s || newColor.l !== color.l) {
      setColor(newColor);
      setHexValue(hslToHex(newColor.h, newColor.s, newColor.l));
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Handle color change from react-colorful
  const handleColorChange = (newColor: HslColor) => {
    setColor(newColor);
    setHexValue(hslToHex(newColor.h, newColor.s, newColor.l));
    debouncedOnChange(formatHSLString(newColor));
  };

  // Handle hex input change
  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    setHexValue(hex);
    
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
      const hslColor = hexToHsl(hex);
      setColor(hslColor);
      debouncedOnChange(formatHSLString(hslColor));
    }
  };

  // Handle Tailwind color selection
  const handleTailwindColorSelect = (hslValue: string) => {
    onChange(hslValue);
    setIsTailwindOpen(false);
  };

  const displayColor = `hsl(${color.h}, ${color.s}%, ${color.l}%)`;

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex items-center gap-2">
        {/* Color Swatch - Opens color picker */}
        <Popover open={isColorPickerOpen} onOpenChange={setIsColorPickerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-10 w-10 p-0"
              aria-label="Pick color"
            >
              <div 
                className="h-7 w-7 rounded"
                style={{ backgroundColor: displayColor }}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="start">
            <div className="space-y-4">
              {/* react-colorful HSL picker */}
              <div className="h-[200px]">
                <HslColorPicker color={color} onChange={handleColorChange} />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Tailwind Palette Button */}
        {showTailwindPalette && (
          <Popover open={isTailwindOpen} onOpenChange={setIsTailwindOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                aria-label="Choose from Tailwind palette"
              >
                <Palette className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-3" align="start">
              <div className="space-y-2">
                <h4 className="text-sm font-medium mb-2">Tailwind Colors</h4>
                <TailwindPalette
                  onColorSelect={handleTailwindColorSelect}
                  onClose={() => setIsTailwindOpen(false)}
                />
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Hex Input */}
        <Input
          value={hexValue}
          onChange={handleHexChange}
          className="font-mono text-sm h-10 flex-1"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}