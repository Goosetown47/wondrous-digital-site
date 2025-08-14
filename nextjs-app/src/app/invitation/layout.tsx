import { LogoFull } from '@/components/ui/logo';

export default function InvitationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {/* Header with logo */}
      <div className="absolute top-0 left-0 right-0 p-6 z-10">
        <div className="max-w-7xl mx-auto">
          <LogoFull size="md" />
        </div>
      </div>
      
      {/* Main content */}
      {children}
      
      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
        <p className="text-sm text-gray-600">
          © {new Date().getFullYear()} Wondrous Digital. All rights reserved.
        </p>
      </div>
    </div>
  );
}