import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import { Navigate } from 'react-router-dom';

import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({
  children,
}: ProtectedRouteProps) => {

  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {

    const checkAuth = async () => {

      const {
        data: { session },
      } = await supabase.auth.getSession();

      setAuthenticated(!!session);
      setLoading(false);
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {

        setAuthenticated(!!session);
        setLoading(false);

      }
    );

    return () => {
      subscription.unsubscribe();
    };

  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">

        <p className="text-muted-foreground">
          Checking authentication...
        </p>

      </div>
    );
  }

  if (!authenticated) {
    return (
      <Navigate
        to="/auth"
        replace
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;