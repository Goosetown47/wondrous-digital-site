// Utility functions for theme color transformations

// Parse HSL string to components
export const parseHSL = (hslString: string): { h: number; s: number; l: number } => {
  const parts = hslString.split(' ');
  return {
    h: parseFloat(parts[0]) || 0,
    s: parseFloat(parts[1]) || 0,
    l: parseFloat(parts[2]) || 0,
  };
};

// Format HSL components to CSS variable format
export const formatHSL = (h: number, s: number, l: number): string => {
  return `${h} ${s}% ${l}%`;
};

// Generate dark mode colors from light mode colors
export const generateDarkModeColors = (lightColors: Record<string, string>): Record<string, string> => {
  const darkColors: Record<string, string> = {};
  
  Object.entries(lightColors).forEach(([key, value]) => {
    const hsl = parseHSL(value);
    
    // Different transformation strategies based on the color type
    if (key === 'background' || key === 'card' || key === 'popover') {
      // Dark backgrounds
      darkColors[key] = formatHSL(hsl.h, hsl.s * 0.8, 5);
    } else if (key === 'foreground' || key.includes('-foreground')) {
      // Light text on dark background
      darkColors[key] = formatHSL(hsl.h, hsl.s * 0.1, 98);
    } else if (key === 'primary') {
      // Primary color stays similar but slightly lighter for dark mode
      darkColors[key] = formatHSL(hsl.h, hsl.s * 0.9, Math.min(hsl.l * 1.2, 70));
    } else if (key === 'muted' || key === 'secondary' || key === 'accent') {
      // Muted colors become darker
      darkColors[key] = formatHSL(hsl.h, hsl.s * 0.5, 15);
    } else if (key === 'destructive') {
      // Destructive color slightly darker
      darkColors[key] = formatHSL(hsl.h, hsl.s * 0.8, hsl.l * 0.7);
    } else if (key === 'border' || key === 'input') {
      // Borders darker in dark mode
      darkColors[key] = formatHSL(hsl.h, hsl.s * 0.5, 15);
    } else if (key === 'ring') {
      // Focus ring lighter in dark mode
      darkColors[key] = formatHSL(hsl.h, hsl.s * 0.5, 70);
    } else {
      // Default transformation
      darkColors[key] = value;
    }
  });
  
  return darkColors;
};