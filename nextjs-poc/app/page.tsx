export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Next.js Static Site POC</h1>
        
        <p className="text-lg mb-8 text-gray-600">
          This is a proof of concept to test static site generation from React components.
        </p>
        
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold mb-4">Test Dynamic Site Generation</h2>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Replace the project ID below with an actual project ID from your database that has site_styles configured.
            </p>
          </div>
          
          <a 
            href="/sites/f77e582f-69ed-4565-a07d-521693d25095/preview" 
            className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h3 className="text-xl font-medium mb-2">Dynamic Project Preview</h3>
            <p className="text-gray-600">This fetches site styles from Supabase at build time</p>
            <p className="text-sm text-gray-500 mt-2">Project ID: f77e582f-69ed-4565-a07d-521693d25095</p>
          </a>
        </div>
      </main>
    </div>
  );
}