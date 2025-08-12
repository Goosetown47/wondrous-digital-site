import { requireAdminOrStaff } from '@/lib/auth/server-checks';
import LibraryPageContent from './library-client';

export default async function LibraryPage() {
  // This will redirect to /dashboard if user is not admin or staff
  await requireAdminOrStaff();
  
  // If we get here, user is authorized
  return <LibraryPageContent />;
}