import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowRight, Layers, Rocket, Database } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Next.js Multi-Tenant PageBuilder
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Visual website builder with multi-tenant architecture. One app serving thousands of customer sites.
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
            <Database className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Database Backed</h3>
            <p className="text-gray-600 text-sm">
              All content saved to Supabase for multi-tenant support
            </p>
          </Card>

          <Card className="p-6">
            <Rocket className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Instant Sites</h3>
            <p className="text-gray-600 text-sm">
              Each project gets its own URL with custom domain support
            </p>
          </Card>
        </div>

        <div className="text-center space-y-4">
          <div>
            <Button size="lg" asChild>
              <Link href="/setup">
                Get Started
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <p className="text-sm text-gray-500 mt-4">
              Create projects and start building websites
            </p>
          </div>
        </div>

        <div className="mt-16 border-t pt-8">
          <h2 className="text-2xl font-semibold mb-4">Architecture Status</h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="w-4 h-4 bg-green-500 rounded-full mr-3"></span>
              <span>✓ Core PageBuilder with drag-and-drop</span>
            </div>
            <div className="flex items-center">
              <span className="w-4 h-4 bg-green-500 rounded-full mr-3"></span>
              <span>✓ Inline text editing</span>
            </div>
            <div className="flex items-center">
              <span className="w-4 h-4 bg-green-500 rounded-full mr-3"></span>
              <span>✓ Supabase integration with auto-save</span>
            </div>
            <div className="flex items-center">
              <span className="w-4 h-4 bg-green-500 rounded-full mr-3"></span>
              <span>✓ Dynamic site rendering</span>
            </div>
            <div className="flex items-center">
              <span className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></span>
              <span>⚡ Multi-project support (testing)</span>
            </div>
            <div className="flex items-center">
              <span className="w-4 h-4 bg-gray-300 rounded-full mr-3"></span>
              <span>○ Domain-based routing (coming next)</span>
            </div>
            <div className="flex items-center">
              <span className="w-4 h-4 bg-gray-300 rounded-full mr-3"></span>
              <span>○ Custom domain support (coming next)</span>
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">Test the Multi-Tenant System</h3>
          <ol className="space-y-2 text-sm">
            <li>1. Go to <Link href="/setup" className="text-blue-600 underline">Setup</Link> and create multiple projects</li>
            <li>2. Build different content in each project</li>
            <li>3. View each project at <code className="bg-white px-2 py-1 rounded">/sites/[project-id]</code></li>
            <li>4. All served from this single Next.js app!</li>
          </ol>
        </div>
      </div>
    </main>
  );
}