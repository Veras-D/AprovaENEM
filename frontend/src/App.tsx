import React, { useState, useEffect, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RootLayout } from '@/layouts/RootLayout';
import { PracticeHero } from '@/features/practice/PracticeHero';
import { GamificationDashboard } from '@/features/gamification';
import { DiagnosticDashboard } from '@/features/diagnostic';
import { InstitutionalDashboard } from '@/features/institutional';
import { LandingPage } from '@/features/home';
import { useTenantStore } from '@/stores/useTenantStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSessionStore } from '@/stores/useSessionStore';
import type { DiagnosticReportDto } from '@/api/types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const VALID_SECTIONS = ['home', 'practice', 'leaderboard', 'diagnostics', 'institutional'] as const;
type SectionType = (typeof VALID_SECTIONS)[number];

const getInitialSection = (): SectionType => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const sectionParam = params.get('section');
    if (sectionParam && (VALID_SECTIONS as readonly string[]).includes(sectionParam)) {
      return sectionParam as SectionType;
    }
    const hash = window.location.hash.replace('#', '');
    if (hash && (VALID_SECTIONS as readonly string[]).includes(hash)) {
      return hash as SectionType;
    }
  }
  return 'home';
};

export const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>(getInitialSection);
  const { savedDiagnosticReport, diagnosticReport } = useSessionStore();

  const studentDiagnostic = useMemo(() => {
    if (savedDiagnosticReport) return savedDiagnosticReport;
    if (diagnosticReport && 'radar' in diagnosticReport && diagnosticReport.radar) {
      return diagnosticReport as DiagnosticReportDto;
    }
    return undefined;
  }, [savedDiagnosticReport, diagnosticReport]);

  useEffect(() => {
    void useTenantStore.getState().resolveAndApplyTenant();
    useAuthStore.getState().syncAuthFromStorage();
  }, []);

  const handleNavigate = (section: string) => {
    setActiveSection(section);
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        if (section === 'home') {
          url.searchParams.delete('section');
        } else {
          url.searchParams.set('section', section);
        }
        window.history.pushState({}, '', url.toString());
      } catch {
        // Fallback for non-standard environments (e.g. test jsdom)
      }
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setActiveSection(getInitialSection());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <RootLayout activeSection={activeSection} onNavigate={handleNavigate}>
        {activeSection === 'home' ? (
          <LandingPage
            onStartPractice={() => handleNavigate('practice')}
            onNavigate={handleNavigate}
            onOpenAuthModal={() => useAuthStore.getState().openAuthModal('login')}
          />
        ) : activeSection === 'leaderboard' ? (
          <GamificationDashboard
            onStartPractice={() => handleNavigate('practice')}
            onOpenAuthModal={(mode) => useAuthStore.getState().openAuthModal(mode ?? 'login')}
          />
        ) : activeSection === 'diagnostics' ? (
          <DiagnosticDashboard
            studentReport={studentDiagnostic}
            onPracticeTopic={() => handleNavigate('practice')}
            onOpenAuthModal={(mode) => useAuthStore.getState().openAuthModal(mode ?? 'login')}
          />
        ) : activeSection === 'institutional' ? (
          <InstitutionalDashboard
            onNavigate={handleNavigate}
            onOpenAuthModal={() => useAuthStore.getState().openAuthModal('login')}
          />
        ) : (
          <PracticeHero
            onOpenGamification={() => handleNavigate('leaderboard')}
            onOpenDiagnostics={() => handleNavigate('diagnostics')}
            onOpenAuthModal={(mode) => useAuthStore.getState().openAuthModal(mode ?? 'login')}
          />
        )}
      </RootLayout>
    </QueryClientProvider>
  );
};

export default App;
