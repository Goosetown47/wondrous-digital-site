import { AppSidebar } from '@/components/navigation/app-sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AuthProvider } from '@/providers/auth-provider';
import { Toaster } from 'sonner';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <div className="relative flex h-screen w-full">
          <AppSidebar />
          <main className="flex-1 overflow-y-auto">
            <div className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b bg-background px-6">
              <SidebarTrigger />
            </div>
            <div className="flex-1 p-6">
              {children}
            </div>
          </main>
        </div>
        <Toaster />
      </SidebarProvider>
    </AuthProvider>
  );
}