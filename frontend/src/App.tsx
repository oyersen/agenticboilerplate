import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './auth/KeycloakContext';
import { SocketProvider } from './core/socket/SocketContext';
import { ToastProvider } from './components/ui/ToastProvider';
import { AppRouter } from './router';
import { useFeaturesStore } from './store/featuresStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 2, // 2 minutes cache
    },
  },
});

/** Boots feature flags on first render */
const AppBootstrap: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const fetchFeatures = useFeaturesStore((s) => s.fetchFeatures);
  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppBootstrap>
          <SocketProvider>
            <ToastProvider>
              <AppRouter />
            </ToastProvider>
          </SocketProvider>
        </AppBootstrap>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;

