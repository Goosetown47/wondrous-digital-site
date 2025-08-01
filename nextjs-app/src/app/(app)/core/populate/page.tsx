'use client';

import { useState } from 'react';
// import { useRouter } from 'next/navigation'; // May be needed for navigation
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Loader2, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useCreateComponent } from '@/hooks/useCoreComponents';

// Component data
const componentsToAdd = [
  {
    name: 'Button',
    fileName: 'button.tsx',
    dependencies: ['@radix-ui/react-slot', 'class-variance-authority'],
    imports: [
      "import * as React from 'react'",
      "import { Slot } from '@radix-ui/react-slot'",
      "import { cva, type VariantProps } from 'class-variance-authority'",
      "import { cn } from '@/lib/utils'"
    ],
  },
  {
    name: 'Input',
    fileName: 'input.tsx',
    dependencies: [],
    imports: [
      "import * as React from 'react'",
      "import { cn } from '@/lib/utils'"
    ],
  },
  {
    name: 'Card',
    fileName: 'card.tsx',
    dependencies: [],
    imports: [
      "import * as React from 'react'",
      "import { cn } from '@/lib/utils'"
    ],
  },
  {
    name: 'Alert',
    fileName: 'alert.tsx',
    dependencies: ['class-variance-authority'],
    imports: [
      "import * as React from 'react'",
      "import { cva, type VariantProps } from 'class-variance-authority'",
      "import { cn } from '@/lib/utils'"
    ],
  },
  {
    name: 'Dialog',
    fileName: 'dialog.tsx',
    dependencies: ['@radix-ui/react-dialog'],
    imports: [
      "import * as React from 'react'",
      "import * as DialogPrimitive from '@radix-ui/react-dialog'",
      "import { X } from 'lucide-react'",
      "import { cn } from '@/lib/utils'"
    ],
  },
  {
    name: 'Tabs',
    fileName: 'tabs.tsx',
    dependencies: ['@radix-ui/react-tabs'],
    imports: [
      "import * as React from 'react'",
      "import * as TabsPrimitive from '@radix-ui/react-tabs'",
      "import { cn } from '@/lib/utils'"
    ],
  },
  {
    name: 'Accordion',
    fileName: 'accordion.tsx',
    dependencies: ['@radix-ui/react-accordion'],
    imports: [
      "import * as React from 'react'",
      "import * as AccordionPrimitive from '@radix-ui/react-accordion'",
      "import { ChevronDown } from 'lucide-react'",
      "import { cn } from '@/lib/utils'"
    ],
  },
  {
    name: 'Avatar',
    fileName: 'avatar.tsx',
    dependencies: ['@radix-ui/react-avatar'],
    imports: [
      "import * as React from 'react'",
      "import * as AvatarPrimitive from '@radix-ui/react-avatar'",
      "import { cn } from '@/lib/utils'"
    ],
  },
  {
    name: 'Breadcrumb',
    fileName: 'breadcrumb.tsx',
    dependencies: ['@radix-ui/react-slot'],
    imports: [
      "import * as React from 'react'",
      "import { Slot } from '@radix-ui/react-slot'",
      "import { ChevronRight, MoreHorizontal } from 'lucide-react'",
      "import { cn } from '@/lib/utils'"
    ],
  },
  {
    name: 'Tooltip',
    fileName: 'tooltip.tsx',
    dependencies: ['@radix-ui/react-tooltip'],
    imports: [
      "import * as React from 'react'",
      "import * as TooltipPrimitive from '@radix-ui/react-tooltip'",
      "import { cn } from '@/lib/utils'"
    ],
  },
];

export default function PopulateCorePage() {
  // const router = useRouter(); // May be needed for navigation
  const [isPopulating, setIsPopulating] = useState(false);
  const [results, setResults] = useState<Array<{name: string, status: 'success' | 'error', error?: string}>>([]);
  const createComponent = useCreateComponent();

  const populateComponents = async () => {
    setIsPopulating(true);
    setResults([]);
    const newResults = [];

    for (const component of componentsToAdd) {
      try {
        // Fetch the component code
        const response = await fetch(`/api/components/ui/${component.fileName}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch component: ${response.statusText}`);
        }
        const code = await response.text();

        await createComponent.mutateAsync({
          name: component.name,
          type: 'component',
          source: 'shadcn',
          code: code,
          dependencies: component.dependencies,
          imports: component.imports,
          metadata: {
            fileName: component.fileName,
            addedAt: new Date().toISOString(),
          },
        });

        newResults.push({ name: component.name, status: 'success' as const });
      } catch (error: unknown) {
        newResults.push({ 
          name: component.name, 
          status: 'error' as const, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
      
      setResults([...newResults]);
    }

    setIsPopulating(false);
  };

  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;

  return (
    <div>
      <div className="mb-8">
        <Button variant="ghost" size="sm" className="mb-4" asChild>
          <Link href="/core">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Core
          </Link>
        </Button>
        
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Populate Core Components</h1>
          <p className="text-muted-foreground">
            Add the essential shadcn/ui components to the Core library
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Component Population</CardTitle>
          <CardDescription>
            This will add {componentsToAdd.length} essential shadcn/ui components to your Core library.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isPopulating && results.length === 0 && (
            <Button onClick={populateComponents}>
              Start Population
            </Button>
          )}

          {(isPopulating || results.length > 0) && (
            <div className="space-y-4">
              <div className="space-y-2">
                {componentsToAdd.map((component) => {
                  const result = results.find(r => r.name === component.name);
                  
                  return (
                    <div key={component.name} className="flex items-center gap-3">
                      {!result ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : result.status === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className={result?.status === 'error' ? 'text-red-600' : ''}>
                        {component.name}
                      </span>
                      {result?.error && (
                        <span className="text-sm text-red-600">({result.error})</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {!isPopulating && results.length === componentsToAdd.length && (
                <Alert>
                  <AlertDescription>
                    Population complete! {successCount} succeeded, {errorCount} failed.
                  </AlertDescription>
                </Alert>
              )}

              {!isPopulating && successCount > 0 && (
                <Button asChild>
                  <Link href="/core">
                    View Components in Core
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}