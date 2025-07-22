import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowRight, Layers, Eye, Rocket } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Next.js PageBuilder
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Visual website builder with drag-and-drop editing, live preview, and
            one-click deployment to Netlify.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6">
            <Layers className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Drag & Drop</h3>
            <p className="text-gray-600 text-sm">
              Build pages visually with our intuitive drag-and-drop interface
            </p>
          </Card>

          <Card className="p-6">
            <Eye className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Live Preview</h3>
            <p className="text-gray-600 text-sm">
              See your changes in real-time with server-side rendering
            </p>
          </Card>

          <Card className="p-6">
            <Rocket className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Deploy Instantly</h3>
            <p className="text-gray-600 text-sm">
              One-click deployment to Netlify with static site generation
            </p>
          </Card>
        </div>

        <div className="text-center">
          <Button size="lg" asChild>
            <Link href="/builder/test-project">
              Start Building
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
          <p className="text-sm text-gray-500 mt-4">
            No signup required. Start with a test project.
          </p>
        </div>

        <div className="mt-16 border-t pt-8">
          <h2 className="text-2xl font-semibold mb-4">Core Functionality Status</h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="w-4 h-4 bg-green-500 rounded-full mr-3"></span>
              <span>✓ Basic drag-and-drop sections</span>
            </div>
            <div className="flex items-center">
              <span className="w-4 h-4 bg-green-500 rounded-full mr-3"></span>
              <span>✓ Inline text editing</span>
            </div>
            <div className="flex items-center">
              <span className="w-4 h-4 bg-green-500 rounded-full mr-3"></span>
              <span>✓ State management with Zustand</span>
            </div>
            <div className="flex items-center">
              <span className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></span>
              <span>⚡ Preview system (basic implementation)</span>
            </div>
            <div className="flex items-center">
              <span className="w-4 h-4 bg-gray-300 rounded-full mr-3"></span>
              <span>○ Netlify deployment (coming next)</span>
            </div>
            <div className="flex items-center">
              <span className="w-4 h-4 bg-gray-300 rounded-full mr-3"></span>
              <span>○ Supabase integration (coming next)</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}