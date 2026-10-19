import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTenantStore } from '@/stores/useTenantStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSessionStore } from '@/stores/useSessionStore';
import {
  Home,
  BookOpen,
  Trophy,
  BarChart2,
  User,
  Menu,
  Sun,
  Moon,
  LogOut,
  Building2,
  GraduationCap,
  Users,
  TrendingUp,
  Award,
  HelpCircle,
  ArrowLeft,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface NavLinkItem {
  readonly id: string;
  readonly label: string;
  readonly fullLabel?: string;
  readonly icon: LucideIcon;
  readonly isAnchor: boolean;
}

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

  const isCoordinator = Boolean(
    isAuthenticated &&
      user?.roles?.some(
        (role) =>
          role === 'ROLE_ADMIN' ||
          role === 'ROLE_INSTITUTIONAL_ADMIN'
      )
  );

  const isInstitutional = activeSection === 'institutional';

  const handleLogout = () => {
    clearAuth();
    clearSession();
    queryClient.removeQueries();
    onLogout?.();
  };

  const studentNavLinks: readonly NavLinkItem[] = [
    { id: 'home', label: 'Início', icon: Home, isAnchor: false },
    { id: 'practice', label: 'Praticar', icon: BookOpen, isAnchor: false },
    { id: 'leaderboard', label: 'Ranking', icon: Trophy, isAnchor: false },
    { id: 'diagnostics', label: 'Diagnóstico', icon: BarChart2, isAnchor: false },
  ];

  const guestNavLinks: readonly NavLinkItem[] = [
    { id: 'home', label: 'Início', icon: Home, isAnchor: false },
    { id: 'practice', label: 'Praticar', icon: BookOpen, isAnchor: false },
  ];

  const coordinatorNavLinks: readonly NavLinkItem[] = [
    { id: 'cohort-overview', label: 'Turmas', fullLabel: 'Turmas & Métricas', icon: Users, isAnchor: true },
    { id: 'cohort-radar', label: 'Radar', fullLabel: 'Radar Comparativo', icon: TrendingUp, isAnchor: true },
    { id: 'cohort-areas', label: 'Tópicos', fullLabel: 'Tópicos Críticos', icon: Award, isAnchor: true },
    { id: 'cohort-distractors', label: 'Distratores', fullLabel: 'Análise de Distratores', icon: HelpCircle, isAnchor: true },
  ];

  // In institutional mode, ONLY render cohort metric links if user is an authorized coordinator.
  // Unauthenticated visitors and regular students on the login/403 gate see zero cohort links.
  // In student mode, unauthenticated guests only see public exploratory actions (Início, Praticar).
  // Personalized features (Ranking, Diagnóstico) require authentication.
  const navLinks: readonly NavLinkItem[] = isInstitutional
    ? isCoordinator
      ? coordinatorNavLinks
      : []
    : isAuthenticated
      ? studentNavLinks
      : guestNavLinks;

  const handleNavLinkClick = (link: { id: string; isAnchor?: boolean }) => {
    if (link.isAnchor) {
      const el = document.getElementById(link.id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      onNavigate?.(link.id);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Tenant Brand Identity & Logo */}
        <div className="flex items-center gap-3 shrink-0">
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
            onClick={() => {
              if (isInstitutional && isCoordinator) {
                const el = document.getElementById('cohort-overview');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                } else {
                  onNavigate?.('institutional');
                }
              } else {
                onNavigate?.('home');
              }
            }}
            className="flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded-brand p-1 -m-1 transition-opacity hover:opacity-90"
          >
            <img
              src={currentTenant.logoUrl}
              alt={`${currentTenant.name} Logo`}
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-brand object-contain shrink-0"
            />

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white shrink-0">
                  {currentTenant.name}
                </span>
                {isInstitutional ? (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30 shrink-0">
                    Painel da Coordenação
                  </span>
                ) : (
                  <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20 shrink-0">
                    Portal do Aluno
                  </span>
                )}
              </div>
              {!isInstitutional && (
                <p className="text-xs text-slate-500 dark:text-slate-400 hidden lg:block truncate max-w-xs">
                  {currentTenant.tagline}
                </p>
              )}
            </div>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav
          className="hidden md:flex items-center gap-2 lg:gap-4 xl:gap-5 shrink-0"
          aria-label={isInstitutional ? 'Navegação da Coordenação' : 'Navegação Principal'}
        >
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = !isInstitutional && activeSection === link.id;

            return (
              <button
                key={link.id}
                type="button"
                onClick={() => handleNavLinkClick(link)}
                className={`inline-flex items-center gap-1.5 text-xs lg:text-sm font-medium transition-colors py-1 px-1.5 rounded-brand whitespace-nowrap ${
                  isActive
                    ? 'text-brand-primary font-bold border-b-2 border-brand-primary'
                    : isInstitutional
                      ? 'text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                      : 'text-slate-700 dark:text-slate-300 hover:text-brand-primary dark:hover:text-brand-primary'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {link.fullLabel ? (
                  <>
                    <span className="hidden 2xl:inline">{link.fullLabel}</span>
                    <span className="inline 2xl:hidden">{link.label}</span>
                  </>
                ) : (
                  <span>{link.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Controls: Portal Switcher, Theme Toggle & Auth/Guest Indicator */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {isInstitutional ? (
            <button
              type="button"
              onClick={() => onNavigate?.('home')}
              aria-label="Voltar ao Portal do Aluno"
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-brand border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
              title="Voltar ao Portal do Aluno"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-slate-400 shrink-0" aria-hidden="true" />
              <GraduationCap className="h-3.5 w-3.5 text-brand-primary shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">Voltar ao Aluno</span>
            </button>
          ) : isCoordinator ? (
            <button
              type="button"
              onClick={() => onNavigate?.('institutional')}
              className="hidden lg:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-brand border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors cursor-pointer whitespace-nowrap"
              title="Acessar o Painel da Coordenação e Métricas de Turma"
            >
              <Building2 className="h-3.5 w-3.5 text-indigo-500 shrink-0" aria-hidden="true" />
              <span>Painel da Coordenação</span>
            </button>
          ) : null}

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
              <span className="hidden xl:inline font-medium text-xs sm:text-sm max-w-[120px] truncate">
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
          ) : isInstitutional ? null : (
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
