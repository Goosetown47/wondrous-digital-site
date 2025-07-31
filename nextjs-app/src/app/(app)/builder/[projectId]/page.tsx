'use client';

import { useParams, useRouter } from 'next/navigation';
import { useHomepage } from '@/hooks/usePages';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function BuilderRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  
  const { data: homepage, isLoading, error } = useHomepage(projectId);

  useEffect(() => {
    if (homepage?.id) {
      console.log('✅ [Builder] Homepage ready, redirecting:', homepage.id);
      router.push(`/builder/${projectId}/${homepage.id}`);
    }
  }, [homepage, projectId, router]);

  if (error) {
    console.error('❌ [Builder] Error getting homepage:', error);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load project</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading project...</p>
      </div>
    </div>
  );
}