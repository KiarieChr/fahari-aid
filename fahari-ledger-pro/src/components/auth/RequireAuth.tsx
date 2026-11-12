import React, { useEffect, useState } from 'react';
import { useRouterState, useNavigate } from '@tanstack/react-router';
import { isAuthenticated } from '@/api/auth';

interface RequireAuthProps {
  children: React.ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated() && pathname !== '/login') {
      navigate({ to: '/login', replace: true });
    }
  }, [pathname, navigate]);

  // During SSR and initial client hydration, render children so DOM tree matches perfectly.
  // After mount, if unauthenticated, clear tree while navigate redirects to /login.
  if (mounted && !isAuthenticated() && pathname !== '/login') {
    return null;
  }

  return <>{children}</>;
}
