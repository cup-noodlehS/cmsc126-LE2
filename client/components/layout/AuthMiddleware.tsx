'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth';

export function AuthMiddleware({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  
  useEffect(() => {
    // Give auth middleware time to check user state
    const timer = setTimeout(() => {
      setIsAuthChecking(false);
      
      // Only redirect if user is still not authenticated after the delay
      if (!user) {
        router.push(`/login?redirect=${pathname}`);
      }
    }, 1000); // Wait 1 second to allow AuthUserMiddleware to complete
    
    return () => clearTimeout(timer);
  }, [user, router, pathname]);
  
  // During the check, just return children - AuthUserMiddleware will show a loader
  return children;
}

export default AuthMiddleware