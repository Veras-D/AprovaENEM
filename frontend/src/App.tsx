import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RootLayout } from '@/layouts/RootLayout';
import { PracticeHero } from '@/features/practice/PracticeHero';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RootLayout>
        <PracticeHero />
      </RootLayout>
    </QueryClientProvider>
  );
};

export default App;
