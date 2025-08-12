import { requireAdminOrStaff } from '@/lib/auth/server-checks';
import CoreClient from './core-client';

export default async function CorePage() {
  // This will redirect to /dashboard if user is not admin or staff
  await requireAdminOrStaff();
  
  // If we get here, user is authorized
  return <CoreClient />;
}