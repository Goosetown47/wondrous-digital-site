import { AuthProvider } from '@/providers/auth-provider';
import { Toaster } from 'sonner';

export default function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      {children}
      <Toaster />
    </AuthProvider>
  );
}