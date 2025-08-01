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

export default function LabPage() {
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
        return 'bg-blue-500';
      case 'page':
        return 'bg-green-500';
      case 'site':
        return 'bg-purple-500';
      case 'theme':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Lab</h1>
        <p className="text-muted-foreground">
          Internal workspace for creating templates and themes
        </p>
      </div>

      <div className="mb-6 flex gap-4">
        <Input
          placeholder="Search drafts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Button asChild>
          <Link href="/lab/new">
            <Plus className="mr-2 h-4 w-4" />
            New Draft
          </Link>
        </Button>
      </div>

      <Tabs value={selectedType} onValueChange={(value: string) => setSelectedType(value as 'all' | 'section' | 'page' | 'site' | 'theme')}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="section">Sections</TabsTrigger>
          <TabsTrigger value="page">Pages</TabsTrigger>
          <TabsTrigger value="site">Sites</TabsTrigger>
          <TabsTrigger value="theme">Themes</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedType} className="mt-6">
          {isLoading ? (
            <div className="text-center py-8">Loading drafts...</div>
          ) : filteredDrafts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No {selectedType === 'all' ? '' : selectedType} drafts found
              </p>
              <Button asChild variant="outline">
                <Link href="/lab/new">Create your first draft</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredDrafts.map((draft) => (
                <Card key={draft.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getTypeColor(draft.type)}>
                        {draft.type}
                      </Badge>
                      <Badge variant="outline">
                        v{draft.version}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{draft.name}</CardTitle>
                    <CardDescription>
                      {draft.metadata?.description || 'No description'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button asChild variant="default" size="sm" className="flex-1">
                        <Link href={`/lab/${draft.id}`}>Edit</Link>
                      </Button>
                      <Button variant="outline" size="sm">
                        Preview
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}