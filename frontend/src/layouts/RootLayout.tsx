import React, { useState } from 'react';
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
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [internalSection, setInternalSection] = useState<string>('practice');

  const activeSection = controlledSection ?? internalSection;

  const isAuthModalOpen = useAuthStore((s) => s.isAuthModalOpen);
  const authModalMode = useAuthStore((s) => s.authModalMode);
  const openAuthModal = useAuthStore((s) => s.openAuthModal);
  const closeAuthModal = useAuthStore((s) => s.closeAuthModal);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState<boolean>(false);
  const [legalModalTab, setLegalModalTab] = useState<'terms' | 'privacy'>('terms');
  const [isErasureModalOpen, setIsErasureModalOpen] = useState<boolean>(false);

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
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
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
              {isAuthenticated && (
                <>
                  <span className="mx-1.5">&bull;</span>
                  <button
                    type="button"
                    onClick={openErasureModal}
                    className="hover:text-rose-600 dark:hover:text-rose-400 underline transition-colors focus:outline-none focus:ring-1 focus:ring-rose-500 rounded"
                  >
                    Exclusão de Conta (Art. 18)
                  </button>
                </>
              )}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
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
    </div>
  );
};
