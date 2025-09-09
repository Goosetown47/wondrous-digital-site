'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useModuleThemeClient } from '@/hooks/use-module-theme-client';
import { useModuleThemeStore } from '@/stores/module-theme-store';
import { Palette, Settings, Shield } from 'lucide-react';

export default function ThemeTestPage() {
  const { currentModule, colors, isClient } = useModuleThemeClient();
  const store = useModuleThemeStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-module-primary">
          Module Theme Test Page
        </h1>
        <p className="text-muted-foreground mt-1">
          Test the module-based theming system
        </p>
      </div>

      {/* Module Switcher */}
      <Card>
        <CardHeader>
          <CardTitle>Current Module: {currentModule}</CardTitle>
          <CardDescription>
            Switch between modules to see theme changes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={() => store.setModule('dashboard')}
              variant={currentModule === 'dashboard' ? 'default' : 'outline'}
              className={currentModule !== 'dashboard' ? 'text-black' : ''}
            >
              <Settings className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button
              onClick={() => store.setModule('builder')}
              variant={currentModule === 'builder' ? 'default' : 'outline'}
              className={currentModule !== 'builder' ? 'text-black' : ''}
            >
              <Palette className="mr-2 h-4 w-4" />
              Builder
            </Button>
            <Button
              onClick={() => store.setModule('admin')}
              variant={currentModule === 'admin' ? 'default' : 'outline'}
              className={currentModule !== 'admin' ? 'text-black' : ''}
            >
              <Shield className="mr-2 h-4 w-4" />
              Admin
            </Button>
          </div>

          {isClient && (
            <div className="grid grid-cols-4 gap-2 p-4 border rounded-lg">
              <div>
                <p className="text-xs font-medium mb-1">Primary</p>
                <div 
                  className="h-10 rounded border flex items-center justify-center text-xs font-mono"
                  style={{ backgroundColor: colors.primary, color: 'white' }}
                >
                  {colors.primary}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium mb-1">Secondary</p>
                <div 
                  className="h-10 rounded border flex items-center justify-center text-xs font-mono"
                  style={{ backgroundColor: colors.secondary, color: 'white' }}
                >
                  {colors.secondary}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium mb-1">Accent</p>
                <div 
                  className="h-10 rounded border flex items-center justify-center text-xs font-mono"
                  style={{ backgroundColor: colors.accent }}
                >
                  {colors.accent}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium mb-1">Background</p>
                <div 
                  className="h-10 rounded border flex items-center justify-center text-xs font-mono"
                  style={{ backgroundColor: colors.background }}
                >
                  {colors.background}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Component Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Themed Components</CardTitle>
          <CardDescription>
            Components that adapt to the current module theme
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Buttons */}
          <div>
            <h3 className="text-sm font-medium mb-3">Buttons</h3>
            <div className="flex gap-2">
              <Button variant="default">
                Primary Button
              </Button>
              <Button variant="secondary">
                Secondary Button
              </Button>
              <Button variant="outline">
                Outline Button
              </Button>
              <Button variant="ghost">
                Tertiary Button
              </Button>
            </div>
          </div>

          {/* Badge - Remove hover by using a wrapper div */}
          <div>
            <h3 className="text-sm font-medium mb-3">Badge</h3>
            <div className="flex gap-2">
              <div className="pointer-events-none">
                <Badge variant="secondary" className="pointer-events-auto cursor-default">
                  Default Badge
                </Badge>
              </div>
              <div className="pointer-events-none">
                <Badge variant="secondary" className="pointer-events-auto cursor-default">
                  Another Badge
                </Badge>
              </div>
              <div className="pointer-events-none">
                <Badge variant="secondary" className="pointer-events-auto cursor-default">
                  Status Badge
                </Badge>
              </div>
            </div>
          </div>

          {/* Typography */}
          <div>
            <h3 className="text-sm font-medium mb-3">Typography</h3>
            <h1 className="text-2xl font-bold mb-2 text-module-primary">
              H1 Heading with Module Primary Color
            </h1>
            <h2 className="text-xl font-semibold mb-2">
              H2 Heading with Default Color
            </h2>
            <h3 className="text-lg font-medium mb-2">
              H3 Heading with Default Color
            </h3>
            <p className="text-base">
              Regular paragraph text with default color
            </p>
          </div>

          {/* Icons */}
          <div>
            <h3 className="text-sm font-medium mb-3">Icons (All Primary Color)</h3>
            <div className="flex gap-4">
              <Settings className="h-6 w-6 text-module-primary" />
              <Palette className="h-6 w-6 text-module-primary" />
              <Shield className="h-6 w-6 text-module-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Module Detection */}
      <Card>
        <CardHeader>
          <CardTitle>Module Detection</CardTitle>
          <CardDescription>
            The theme automatically detects the module based on the URL
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Current Path:</span> {' '}
              <code className="px-2 py-1 bg-muted rounded">
                /dashboard/theme-test
              </code>
            </div>
            <div>
              <span className="font-medium">Detected Module:</span> {' '}
              <Badge variant="secondary" className="pointer-events-none cursor-default">
                {currentModule}
              </Badge>
            </div>
            <div>
              <span className="font-medium">Is Admin:</span> {' '}
              <Badge variant="secondary" className="pointer-events-none cursor-default">
                {store.isAdminModule() ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}