import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTenantStore } from '@/stores/useTenantStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSessionStore } from '@/stores/useSessionStore';
import { Home, BookOpen, Trophy, BarChart2, User, Menu, Sun, Moon, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface HeaderProps {
  readonly onOpenDrawer: () => void;
  readonly activeSection?: string;
  readonly onNavigate?: (section: string) => void;
  readonly onOpenAuthModal?: () => void;
  readonly onLogout?: () => void;
}

/**
 * Mobile-First Responsive Application Header.
 * Displays tenant branding, responsive navigation, dark mode quick-toggle,
 * and hamburger drawer trigger for mobile viewports.
 */
export const Header: React.FC<HeaderProps> = ({
  onOpenDrawer,
  activeSection = 'practice',
  onNavigate,
  onOpenAuthModal,
  onLogout,
}) => {
  const queryClient = useQueryClient();
  const { currentTenant, isDarkMode, toggleDarkMode } = useTenantStore();
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const clearSession = useSessionStore((s) => s.clearSession);

  const handleLogout = () => {
    clearAuth();
    clearSession();
    queryClient.removeQueries();
    onLogout?.();
  };

  const navLinks = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'practice', label: 'Praticar', icon: BookOpen },
    { id: 'leaderboard', label: 'Ranking', icon: Trophy },
    { id: 'diagnostics', label: 'Diagnóstico', icon: BarChart2 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Tenant Brand Identity & Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenDrawer}
            className="p-2 -ml-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            aria-label="Abrir menu de navegação"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate?.('home')}
            className="flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded-brand p-1 -m-1 transition-opacity hover:opacity-90"
          >
            <img
              src={currentTenant.logoUrl}
              alt={`${currentTenant.name} Logo`}
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-brand object-contain shrink-0"
            />

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white truncate">
                  {currentTenant.name}
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20 shrink-0">
                  Portal do Aluno
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden lg:block truncate max-w-md">
                {currentTenant.tagline}
              </p>
            </div>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Navegação Principal">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeSection === link.id;

            return (
              <button
                key={link.id}
                type="button"
                onClick={() => onNavigate?.(link.id)}
                className={`inline-flex items-center gap-2 text-sm font-medium transition-colors py-1 ${
                  isActive
                    ? 'text-brand-primary font-bold border-b-2 border-brand-primary'
                    : 'text-slate-700 dark:text-slate-300 hover:text-brand-primary dark:hover:text-brand-primary'
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Action Controls: Theme Toggle & Auth/Guest Indicator */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="p-2 rounded-brand text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            aria-label={isDarkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4 text-amber-500" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4 text-slate-600" aria-hidden="true" />
            )}
          </button>

          {/* User Auth or Guest Anonymous Session Indicator */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
              <div className="h-8 w-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline font-medium text-xs sm:text-sm max-w-[120px] truncate">
                {user.name}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 rounded-brand hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                aria-label="Sair da conta"
                title="Sair da conta"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden md:inline">Sair</span>
              </button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="text-xs px-2.5 sm:px-3"
              onClick={onOpenAuthModal}
            >
              <User className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
              Entrar
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
