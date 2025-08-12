import { requireAdminOrStaff } from '@/lib/auth/server-checks';
import LabClient from './lab-client';

export default async function LabPage() {
  // This will redirect to /dashboard if user is not admin or staff
  await requireAdminOrStaff();
  
  // If we get here, user is authorized
  return <LabClient />;
}