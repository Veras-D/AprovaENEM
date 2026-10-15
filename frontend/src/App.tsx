import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RootLayout } from '@/layouts/RootLayout';
import { PracticeHero } from '@/features/practice/PracticeHero';
import { GamificationDashboard } from '@/features/gamification';
import { DiagnosticDashboard } from '@/features/diagnostic';

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
  const [activeSection, setActiveSection] = useState<string>('practice');

  return (
    <QueryClientProvider client={queryClient}>
      <RootLayout activeSection={activeSection} onNavigate={setActiveSection}>
        {activeSection === 'leaderboard' ? (
          <GamificationDashboard onStartPractice={() => setActiveSection('practice')} />
        ) : activeSection === 'diagnostics' ? (
          <DiagnosticDashboard onPracticeTopic={() => setActiveSection('practice')} />
        ) : (
          <PracticeHero onOpenGamification={() => setActiveSection('leaderboard')} />
        )}
      </RootLayout>
    </QueryClientProvider>
  );
};

export default App;
