import React, { useState, useEffect } from 'react';
import { useTenantStore } from '@/stores/useTenantStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { MobileDrawer } from '@/components/layout/MobileDrawer';
import { BandwidthNotice } from '@/components/layout/BandwidthNotice';
import {
  SkipToContent,
  ColorBlindFilters,
  ReadingRuler,
  VLibras,
  AccessibilityToolbar,
} from '@/components/accessibility';
import { RegisterModal } from '@/components/auth';
import { TermsAndPrivacyModal, AccountErasureModal } from '@/components/legal';
import { LevelUpModal } from '@/features/gamification/components/LevelUpModal';
import { ShieldCheck } from 'lucide-react';

export interface RootLayoutProps {
  readonly children: React.ReactNode;
  readonly activeSection?: string;
  readonly onNavigate?: (section: string) => void;
}

export const RootLayout: React.FC<RootLayoutProps> = ({
  children,
  activeSection: controlledSection,
  onNavigate: controlledOnNavigate,
}) => {
  const currentTenant = useTenantStore((s) => s.currentTenant);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [internalSection, setInternalSection] = useState<string>('practice');

  const activeSection = controlledSection ?? internalSection;

  const isAuthModalOpen = useAuthStore((s) => s.isAuthModalOpen);
  const authModalMode = useAuthStore((s) => s.authModalMode);
  const openAuthModal = useAuthStore((s) => s.openAuthModal);
  const closeAuthModal = useAuthStore((s) => s.closeAuthModal);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState<boolean>(false);
  const [legalModalTab, setLegalModalTab] = useState<'terms' | 'privacy'>('terms');
  const [isErasureModalOpen, setIsErasureModalOpen] = useState<boolean>(false);
  const [pendingLevelUp, setPendingLevelUp] = useState<{
    newLevel: number;
    previousLevel?: number;
    levelTitle?: string;
    weeklyLeague?: string;
  } | null>(null);
  const [isTabLevelUpModalOpen, setIsTabLevelUpModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleOpenErasure = () => setIsErasureModalOpen(true);
    window.addEventListener('aprovaenem:open-erasure-modal', handleOpenErasure);
    return () => window.removeEventListener('aprovaenem:open-erasure-modal', handleOpenErasure);
  }, []);

  // When switching away from the 'practice' tab, check if there is a queued level-up celebration
  useEffect(() => {
    if (!isAuthenticated || activeSection === 'practice' || typeof localStorage === 'undefined') {
      return;
    }
    const pendingKey = `aprovaenem_pending_level_up_${user?.id || 'anon'}`;
    const pendingRaw = localStorage.getItem(pendingKey);
    if (pendingRaw) {
      try {
        const parsed = JSON.parse(pendingRaw) as {
          newLevel: number;
          previousLevel?: number;
          levelTitle?: string;
          weeklyLeague?: string;
        };
        if (parsed && typeof parsed.newLevel === 'number') {
          setPendingLevelUp(parsed);
          setIsTabLevelUpModalOpen(true);
          localStorage.removeItem(pendingKey);
        }
      } catch {
        localStorage.removeItem(pendingKey);
      }
    }
  }, [activeSection, isAuthenticated, user?.id]);

  const openLegalModal = (tab: 'terms' | 'privacy' = 'terms') => {
    setLegalModalTab(tab);
    setIsLegalModalOpen(true);
  };

  const openErasureModal = () => {
    setIsErasureModalOpen(true);
  };

  const handleNavigate = (section: string) => {
    if (controlledOnNavigate) {
      controlledOnNavigate(section);
    } else {
      setInternalSection(section);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-brand m-0 p-0">
      {/* Keyboard Accessibility: Skip link to bypass header blocks (WCAG 2.1 SC 2.4.1) */}
      <SkipToContent />

      {/* Top Application Header */}
      <Header
        onOpenDrawer={() => setIsDrawerOpen(true)}
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onOpenAuthModal={() => openAuthModal('login')}
        onOpenProfileModal={() => handleNavigate('profile')}
      />

      {/* Low-Bandwidth / 3G/4G Data Saver Optimization Banner */}
      <BandwidthNotice />

      {/* Invisible Daltonism SVG Filters */}
      <ColorBlindFilters />

      {/* ADHD & Dyslexia Visual Reading Ruler */}
      <ReadingRuler />

      {/* VLibras 3D Avatar Brazilian Sign Language Translation */}
      <VLibras />

      {/* Mobile Slide-Over Drawer Navigation */}
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onOpenAuthModal={() => openAuthModal('register')}
        onOpenProfileModal={() => {
          setIsDrawerOpen(false);
          handleNavigate('profile');
        }}
        onOpenLegalModal={() => openLegalModal('privacy')}
        onOpenErasureModal={openErasureModal}
      />

      {/* Main Page Content (with bottom padding for sticky mobile nav) */}
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8 focus:outline-none"
      >
        {children}
      </main>

      {/* Universal Floating Accessibility Toolbar Widget */}
      <AccessibilityToolbar />

      {/* Sticky Bottom Navigation Bar for Smartphones */}
      <BottomNav
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onOpenDrawer={() => setIsDrawerOpen(true)}
      />

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 mb-14 md:mb-0 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-slate-500 dark:text-slate-400 text-center md:text-left">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
            <span>
              Privacidade LGPD (Lei nº 13.709/2018) &bull;{' '}
              <button
                type="button"
                onClick={() => openLegalModal('terms')}
                className="hover:text-brand-primary underline transition-colors focus:outline-none focus:ring-1 focus:ring-brand-primary rounded"
              >
                Termos de Uso e Privacidade
              </button>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center md:text-right">
            {currentTenant.name} &bull; Parceria com a Recode Pro &bull; ODS 4 (Educação de Qualidade) & ODS 10 (Redução das Desigualdades)
          </p>
        </div>
      </footer>

      {/* Student Authentication & Registration Modal */}
      <RegisterModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        initialMode={authModalMode}
      />

      {/* Standalone Terms of Use and LGPD Privacy Modal */}
      <TermsAndPrivacyModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        initialTab={legalModalTab}
        onOpenErasureModal={openErasureModal}
      />

      {/* Self-Service Account Erasure Modal (LGPD Art. 18, VI) */}
      <AccountErasureModal
        isOpen={isErasureModalOpen}
        onClose={() => setIsErasureModalOpen(false)}
      />

      {/* Queued Level-Up Celebration Modal displayed on tab switch */}
      {pendingLevelUp && (
        <LevelUpModal
          isOpen={isTabLevelUpModalOpen}
          onClose={() => {
            setIsTabLevelUpModalOpen(false);
            setPendingLevelUp(null);
          }}
          newLevel={pendingLevelUp.newLevel}
          previousLevel={pendingLevelUp.previousLevel}
          levelTitle={pendingLevelUp.levelTitle}
          weeklyLeague={pendingLevelUp.weeklyLeague}
          awardedXp={50}
          onContinuePractice={() => handleNavigate('practice')}
          onOpenGamification={() => handleNavigate('leaderboard')}
        />
      )}

    </div>
  );
};
