import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';

import { useEffect } from 'react';

import { testASLModel } from './lib/testAslModel';

import Index from './pages/Index';
import Backend from './pages/Backend';
import Auth from './pages/auth';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

import ProtectedRoute from './components/ProtectedRoute';

const queryClient = new QueryClient();

const App = () => {

  useEffect(() => {
    testASLModel();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>

      <TooltipProvider>

        <Toaster />

        <Sonner />

        <BrowserRouter>

          <Routes>

            {/* Authentication */}
            <Route
              path="/auth"
              element={<Auth />}
            />

            {/* Home */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />

            {/* Dashboard */}
            <Route
              path="/backend"
              element={
                <ProtectedRoute>
                  <Backend />
                </ProtectedRoute>
              }
            />

            {/* Settings */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route
              path="*"
              element={<NotFound />}
            />

          </Routes>

        </BrowserRouter>

      </TooltipProvider>

    </QueryClientProvider>
  );
};

export default App;