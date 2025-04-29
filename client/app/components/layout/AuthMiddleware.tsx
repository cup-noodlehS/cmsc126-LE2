'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';

export function AuthMiddleware({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) {
      router.push(`/login?redirect=${window.location.pathname}`);
    }
  }, [user, router]);

  return children;
}

export default AuthMiddleware