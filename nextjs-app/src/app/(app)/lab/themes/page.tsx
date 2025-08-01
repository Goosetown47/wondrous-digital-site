'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Palette } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { labDraftService } from '@/lib/supabase/lab-drafts';
import type { ThemeVariables } from '@/types/builder';

export default function ThemesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch theme drafts
  const { data: drafts = [], isLoading } = useQuery({
    queryKey: ['lab-drafts', 'theme'],
    queryFn: async () => {
      const allDrafts = await labDraftService.getAll();
      return allDrafts.filter(draft => draft.type === 'theme');
    },
  });

  const filteredDrafts = drafts.filter(draft =>
    draft.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateTheme = () => {
    router.push('/lab/themes/new');
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Theme Builder</h2>
          <p className="text-muted-foreground">
            Create and customize themes for your projects
          </p>
        </div>
        <Button onClick={handleCreateTheme}>
          <Plus className="mr-2 h-4 w-4" />
          New Theme
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search themes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading themes...</div>
      ) : filteredDrafts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Palette className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="text-xl mb-2">No themes yet</CardTitle>
            <CardDescription className="text-center mb-4">
              Get started by creating your first theme
            </CardDescription>
            <Button onClick={handleCreateTheme}>
              <Plus className="mr-2 h-4 w-4" />
              Create Theme
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDrafts.map((draft) => (
            <Card key={draft.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <Link href={`/lab/themes/${draft.id}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{draft.name}</CardTitle>
                    <Badge variant={draft.status === 'ready' ? 'default' : 'secondary'}>
                      {draft.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    Version {draft.version} • Updated {new Date(draft.updated_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <div className="grid grid-cols-5 gap-1 flex-1">
                      {/* Show color swatches if available */}
                      {draft.type === 'theme' && draft.content && (
                        <>
                          {(draft.content as ThemeVariables).primary && (
                            <div
                              className="h-8 w-full rounded"
                              style={{ backgroundColor: `hsl(${(draft.content as ThemeVariables).primary})` }}
                            />
                          )}
                          {(draft.content as ThemeVariables).secondary && (
                            <div
                              className="h-8 w-full rounded"
                              style={{ backgroundColor: `hsl(${(draft.content as ThemeVariables).secondary})` }}
                            />
                          )}
                          {(draft.content as ThemeVariables).accent && (
                            <div
                              className="h-8 w-full rounded"
                              style={{ backgroundColor: `hsl(${(draft.content as ThemeVariables).accent})` }}
                            />
                          )}
                          {(draft.content as ThemeVariables).muted && (
                            <div
                              className="h-8 w-full rounded"
                              style={{ backgroundColor: `hsl(${(draft.content as ThemeVariables).muted})` }}
                            />
                          )}
                          {(draft.content as ThemeVariables).destructive && (
                            <div
                              className="h-8 w-full rounded"
                              style={{ backgroundColor: `hsl(${(draft.content as ThemeVariables).destructive})` }}
                            />
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}