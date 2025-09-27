'use client';

import { useParams, useRouter } from 'next/navigation';
import { useLibraryItem } from '@/hooks/useLibrary';
import { ComponentRegistry } from '@/lib/component-registry';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Download } from 'lucide-react';
import { Loader2 } from 'lucide-react';

export default function LibraryPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.id as string;

  const { data: item, isLoading, error } = useLibraryItem(itemId);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Library item not found</h2>
          <p className="text-muted-foreground mb-4">The item you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/library')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Library
          </Button>
        </div>
      </div>
    );
  }

  // Get the component from the registry
  // Try multiple possible fields where the component name might be stored
  const componentName =
    item.component_name || // Direct field on library item
    (item.content as Record<string, unknown>)?.code_name as string || // Code name in content
    (item.content as Record<string, unknown>)?.component_name as string || // Component name in content
    (item.metadata as Record<string, unknown>)?.component_name as string || // Component name in metadata
    (item.metadata as Record<string, unknown>)?.code_name as string || // Code name in metadata
    item.name; // Fallback to display name

  // Try to find the component, first as-is, then with spaces removed
  let componentEntry = ComponentRegistry.get(componentName);
  if (!componentEntry && componentName.includes(' ')) {
    // Try removing spaces from the name (e.g., "Services 1" -> "Services1")
    const nameWithoutSpaces = componentName.replace(/\s+/g, '');
    componentEntry = ComponentRegistry.get(nameWithoutSpaces);
  }

  if (!componentEntry) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Component not found</h2>
          <p className="text-muted-foreground mb-4">
            Component "{componentName}" is not registered in the system.
          </p>
          <Button onClick={() => router.push('/library')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Library
          </Button>
        </div>
      </div>
    );
  }

  const Component = componentEntry.component;

  return (
    <div className="min-h-screen bg-background">
      {/* Preview Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/library')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Library
            </Button>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold">{item.name}</h1>
              <span className="text-sm text-muted-foreground">v{item.version || 1}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/lab/${item.source_draft_id || item.id}`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit in Lab
            </Button>
            {item.published && (
              <Button
                size="sm"
                onClick={() => {
                  // Could implement export/download functionality here
                  console.log('Download/use component');
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Use Component
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Component Preview */}
      <main className="w-full">
        {item.type === 'section' ? (
          // For sections, render directly
          <Component
            content={item.content || componentEntry.defaultContent || {}}
            isEditing={false}
          />
        ) : item.type === 'page' ? (
          // For pages, render all sections
          <div>
            {((item.content as { sections?: Array<{ component_name: string; content: Record<string, unknown> }> })?.sections || []).map((section, index: number) => {
              const sectionEntry = ComponentRegistry.get(section.component_name);
              if (!sectionEntry) return null;
              const SectionComponent = sectionEntry.component;
              return (
                <SectionComponent
                  key={index}
                  content={section.content || {}}
                  isEditing={false}
                />
              );
            })}
          </div>
        ) : item.type === 'theme' ? (
          // For themes, show theme preview
          <div className="container py-8">
            <div className="rounded-lg border p-8">
              <h2 className="text-2xl font-semibold mb-4">Theme Preview</h2>
              <p className="text-muted-foreground mb-6">
                This is a theme template. Apply it to a project to see how it affects your site's appearance.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Theme Variables:</h3>
                  <pre className="bg-muted p-4 rounded text-sm overflow-auto">
                    {JSON.stringify((item.content as Record<string, unknown>)?.variables || item.content || {}, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Fallback for unknown types
          <div className="container py-8">
            <div className="rounded-lg border p-8">
              <h2 className="text-2xl font-semibold mb-4">Preview</h2>
              <pre className="bg-muted p-4 rounded text-sm overflow-auto">
                {JSON.stringify(item.content, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}