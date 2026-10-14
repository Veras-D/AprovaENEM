import React from 'react';
import { useTenantStore } from '@/stores/useTenantStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSessionStore } from '@/stores/useSessionStore';
import { BookOpen, Trophy, BarChart2, ShieldCheck, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface RootLayoutProps {
  readonly children: React.ReactNode;
}

export const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  const currentTenant = useTenantStore((s) => s.currentTenant);
  const { user, isAuthenticated } = useAuthStore();
  const anonymousSessionId = useSessionStore((s) => s.anonymousSessionId);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-brand">
      {/* Top Application Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Tenant Brand Identity */}
          <div className="flex items-center gap-3">
            <img
              src={currentTenant.logoUrl}
              alt={`${currentTenant.name} Logo`}
              className="h-9 w-9 rounded-brand object-contain"
            />
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                {currentTenant.name}
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                  White-Label
                </span>
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                {currentTenant.tagline}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Navegação Principal">
            <a
              href="#practice"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-brand-primary dark:hover:text-brand-primary transition-colors"
            >
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              Praticar
            </a>
            <a
              href="#leaderboard"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-brand-primary dark:hover:text-brand-primary transition-colors"
            >
              <Trophy className="h-4 w-4" aria-hidden="true" />
              Ranking
            </a>
            <a
              href="#diagnostics"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-brand-primary dark:hover:text-brand-primary transition-colors"
            >
              <BarChart2 className="h-4 w-4" aria-hidden="true" />
              Diagnóstico
            </a>
          </nav>

          {/* User Auth or Guest Anonymous Session Indicator */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                <div className="h-8 w-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline font-medium">{user.name}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 hidden lg:inline">
                  Sessão Anônima:{' '}
                  <code className="text-[11px] font-mono text-slate-600 dark:text-slate-300">
                    {anonymousSessionId.slice(0, 12)}...
                  </code>
                </span>
                <Button size="sm" variant="outline">
                  <User className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                  Entrar
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
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
