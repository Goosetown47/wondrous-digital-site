'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProjectsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard since projects are managed manually
    router.replace('/dashboard');
  }, [router]);

  return null;
}