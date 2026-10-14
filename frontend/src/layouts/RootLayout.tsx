import React, { useState } from 'react';
import { useTenantStore } from '@/stores/useTenantStore';
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
import { ShieldCheck } from 'lucide-react';

export interface RootLayoutProps {
  readonly children: React.ReactNode;
}

export const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  const currentTenant = useTenantStore((s) => s.currentTenant);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('practice');

  const handleNavigate = (section: string) => {
    setActiveSection(section);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-brand">
      {/* Keyboard Accessibility: Skip link to bypass header blocks (WCAG 2.1 SC 2.4.1) */}
      <SkipToContent />

      {/* Invisible Daltonism SVG Filters */}
      <ColorBlindFilters />

      {/* ADHD & Dyslexia Visual Reading Ruler */}
      <ReadingRuler />

      {/* VLibras 3D Avatar Brazilian Sign Language Translation */}
      <VLibras />

      {/* Low-Bandwidth / 3G/4G Data Saver Optimization Banner */}
      <BandwidthNotice />

      {/* Top Application Header */}
      <Header
        onOpenDrawer={() => setIsDrawerOpen(true)}
        activeSection={activeSection}
        onNavigate={handleNavigate}
      />

      {/* Mobile Slide-Over Drawer Navigation */}
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeSection={activeSection}
        onNavigate={handleNavigate}
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
              Privacidade LGPD (Lei nº 13.709/2018) &bull; Dados protegidos com minimização rigorosa
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            {currentTenant.name} &bull; Parceria com a Recode Pro &bull; ODS 4 (Educação de Qualidade) & ODS 10 (Redução das Desigualdades)
          </p>
        </div>
      </footer>
    </div>
  );
};
