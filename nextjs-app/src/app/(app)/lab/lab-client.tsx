'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { labDraftService } from '@/lib/supabase/lab-drafts';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function LabClient() {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'section' | 'page' | 'site' | 'theme'>('all');

  const { data: drafts = [], isLoading } = useQuery({
    queryKey: ['lab-drafts', selectedType],
    queryFn: async () => {
      const allDrafts = await labDraftService.getAll();
      if (selectedType === 'all') return allDrafts;
      return allDrafts.filter(draft => draft.type === selectedType);
    },
  });

  const filteredDrafts = drafts.filter(draft =>
    draft.name.toLowerCase().includes(search.toLowerCase())
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'section':
        return 'bg-blue-500 text-white';
      case 'page':
        return 'bg-green-500 text-white';
      case 'site':
        return 'bg-purple-500 text-white';
      case 'theme':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Lab</h1>
        <p className="text-muted-foreground">
          Create and test new components, pages, sites, and themes
        </p>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all" onClick={() => setSelectedType('all')}>
              All
            </TabsTrigger>
            <TabsTrigger value="section" onClick={() => setSelectedType('section')}>
              Sections
            </TabsTrigger>
            <TabsTrigger value="page" onClick={() => setSelectedType('page')}>
              Pages
            </TabsTrigger>
            <TabsTrigger value="site" onClick={() => setSelectedType('site')}>
              Sites
            </TabsTrigger>
            <TabsTrigger value="theme" onClick={() => setSelectedType('theme')}>
              Themes
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search drafts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-[300px]"
            />
            <Link href="/lab/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create New
              </Button>
            </Link>
          </div>
        </div>

        <TabsContent value={selectedType} className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading drafts...</p>
            </div>
          ) : filteredDrafts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {search
                  ? `No ${selectedType === 'all' ? 'drafts' : selectedType + 's'} found matching "${search}"`
                  : `No ${selectedType === 'all' ? 'drafts' : selectedType + 's'} yet`}
              </p>
              <Link href="/lab/new">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First {selectedType === 'all' ? 'Draft' : selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredDrafts.map((draft) => (
                <Link key={draft.id} href={`/lab/${draft.id}`}>
                  <Card className="cursor-pointer transition-shadow hover:shadow-lg">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{draft.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {draft.metadata?.description as string || 'No description'}
                          </CardDescription>
                        </div>
                        <Badge className={getTypeColor(draft.type)} variant="secondary">
                          {draft.type}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                          Updated {new Date(draft.updated_at).toLocaleDateString()}
                        </span>
                        <Badge variant={draft.status === 'promoted' ? 'default' : 'outline'}>
                          {draft.status === 'promoted' ? 'Promoted' : draft.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}