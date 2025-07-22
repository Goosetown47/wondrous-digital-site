'use client';

import { HeroSection } from '@/components/sections/HeroSection';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useBuilderStore } from '@/stores/builderStore';
import type { HeroContent } from '@/schemas/section';

export default function PreviewPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { sections } = useBuilderStore();

  return (
    <div className="min-h-screen">
      {/* Preview toolbar */}
      <div className="bg-gray-900 text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/builder/${projectId}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Builder
              </Link>
            </Button>
            <span className="text-sm opacity-75">Preview Mode</span>
          </div>
          <Button variant="secondary" size="sm">
            <ExternalLink className="w-4 h-4 mr-2" />
            Deploy
          </Button>
        </div>
      </div>

      {/* Render sections from store */}
      {sections.length === 0 ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-gray-500 mb-2">No sections to preview</p>
            <Button variant="outline" asChild>
              <Link href={`/builder/${projectId}`}>
                Go back to builder
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        sections.map((section) => {
          if (section.type === 'hero') {
            return (
              <HeroSection
                key={section.id}
                content={section.content as HeroContent}
                isEditing={false}
              />
            );
          }
          return null;
        })
      )}
    </div>
  );
}