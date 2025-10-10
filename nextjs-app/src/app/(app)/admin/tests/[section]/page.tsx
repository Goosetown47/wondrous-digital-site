/**
 * Dynamic test page for custom sections
 *
 * Examples:
 * - http://localhost:3000/admin/tests/nav-1
 * - http://localhost:3000/admin/tests/footer-1
 * - http://localhost:3000/admin/tests/hero-1
 */

'use client';

import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';

export default function TestSectionPage() {
  const params = useParams();
  const sectionName = params.section as string;

  // Dynamically import the component based on the URL parameter
  const TestComponent = dynamic(
    () => import(`@/components/test/${sectionName}.tsx`).catch(() => {
      // Return a fallback component if the import fails
      return {
        default: () => (
          <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-700 mb-2">
                Component Not Found
              </h1>
              <p className="text-gray-500">
                Create <code className="bg-gray-100 px-2 py-1 rounded">
                  /src/components/test/{sectionName}.tsx
                </code>
              </p>
            </div>
          </div>
        )
      };
    }),
    {
      ssr: false,
      loading: () => (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse text-gray-400">Loading...</div>
        </div>
      )
    }
  );

  return <TestComponent />;
}
