import React, { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTenantStore } from '@/stores/useTenantStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSessionStore } from '@/stores/useSessionStore';
import {
  X,
  Home,
  BookOpen,
  Trophy,
  BarChart2,
  User,
  ShieldCheck,
  Sun,
  Moon,
  Eye,
  Sparkles,
  LogOut,
  Building2,
  Users,
  TrendingUp,
  Award,
  HelpCircle,
  GraduationCap,
} from 'lucide-react';
import { AvatarRenderer } from '../avatar/AvatarRenderer';

export interface MobileDrawerProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly activeSection?: string;
  readonly onNavigate?: (section: string) => void;
  readonly onOpenAuthModal?: () => void;
  readonly onOpenProfileModal?: () => void;
  readonly onOpenLegalModal?: () => void;
  readonly onOpenErasureModal?: () => void;
  readonly onLogout?: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  activeSection = 'practice',
  onNavigate,
  onOpenAuthModal,
  onOpenProfileModal,
  onOpenLegalModal,
  onOpenErasureModal,
  onLogout,
}) => {
  const queryClient = useQueryClient();
  const { currentTenant, isDarkMode, toggleDarkMode, isHighContrast, toggleHighContrast } =
    useTenantStore();
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const clearSession = useSessionStore((s) => s.clearSession);
  const [shouldRender, setShouldRender] = React.useState<boolean>(isOpen);
  const [isClosing, setIsClosing] = React.useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
      return undefined;
    }
    if (shouldRender) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 180);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOpen, shouldRender]);

  const handleLogout = () => {
    clearAuth();
    clearSession();
    queryClient.removeQueries();
    onClose();
    onLogout?.();
  };

  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!shouldRender) {
    return null;
  }

  const isCoordinator = Boolean(
    isAuthenticated &&
      user?.roles?.some(
        (role) =>
          role === 'ROLE_ADMIN' ||
          role === 'ROLE_INSTITUTIONAL_ADMIN'
      )
  );

  const isInstitutional = activeSection === 'institutional';

  const studentNavItems = [
    { id: 'home', label: 'Início', icon: Home, isAnchor: false },
    { id: 'practice', label: 'Praticar Questões', icon: BookOpen, isAnchor: false },
    { id: 'leaderboard', label: 'Ranking Semanal', icon: Trophy, isAnchor: false },
    { id: 'diagnostics', label: 'Diagnóstico & Desempenho', icon: BarChart2, isAnchor: false },
  ];

  const guestNavItems = [
    { id: 'home', label: 'Início', icon: Home, isAnchor: false },
    { id: 'practice', label: 'Praticar Questões', icon: BookOpen, isAnchor: false },
  ];

  const coordinatorNavItems = [
    { id: 'cohort-overview', label: 'Visão Geral da Turma', icon: Users, isAnchor: true },
    { id: 'cohort-radar', label: 'Radar Comparativo', icon: TrendingUp, isAnchor: true },
    { id: 'cohort-areas', label: 'Tópicos Críticos por Área', icon: Award, isAnchor: true },
    { id: 'cohort-distractors', label: 'Análise de Distratores', icon: HelpCircle, isAnchor: true },
    { id: 'home', label: 'Ir para Portal do Aluno', icon: GraduationCap, isAnchor: false },
  ];

  const gateNavItems = [
    { id: 'home', label: 'Voltar ao Portal do Aluno', icon: GraduationCap, isAnchor: false },
  ];

  const navItems = isInstitutional
    ? isCoordinator
      ? coordinatorNavItems
      : gateNavItems
    : [
        ...(isAuthenticated ? studentNavItems : guestNavItems),
        ...(isCoordinator
          ? [{ id: 'institutional', label: 'Painel da Coordenação', icon: Building2, isAnchor: false }]
          : []),
        ...(isAuthenticated
          ? [{ id: 'profile', label: 'Minha Conta', icon: User, isAnchor: false }]
          : []),
      ];

  const handleItemClick = (item: (typeof navItems)[number]) => {
    if (item.isAnchor) {
      const el = document.getElementById(item.id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      onNavigate?.(item.id);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 md:hidden flex"
      role="dialog"
      aria-modal="true"
      aria-hidden={isClosing || undefined}
      aria-labelledby="mobile-drawer-title"
    >
      {/* Dimmed Overlay Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm ${
          isClosing
            ? 'animate-out fade-out duration-150'
            : 'animate-in fade-in duration-200'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in Drawer Container */}
      <div
        className={`relative ml-auto w-full max-w-xs bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col z-10 border-l border-slate-200 dark:border-slate-800 ${
          isClosing
            ? 'animate-out slide-out-to-right duration-150'
            : 'animate-in slide-in-from-right duration-200'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={currentTenant.logoUrl}
              alt=""
              className="h-8 w-8 rounded-brand object-contain"
            />
            <div>
              <h2
                id="mobile-drawer-title"
                className="text-sm font-bold text-slate-900 dark:text-white"
              >
                {currentTenant.name}
              </h2>
              <span
                className={`text-[10px] font-semibold uppercase ${
                  isInstitutional
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-brand-primary'
                }`}
              >
                {isInstitutional
                  ? isCoordinator
                    ? 'Menu da Coordenação'
                    : 'Acesso da Coordenação'
                  : 'Menu de Navegação'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
          {isAuthenticated && user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {user.avatarConfig ? (
                  <AvatarRenderer config={user.avatarConfig} size={40} />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-base">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {user.email}
                  </p>
                  {isCoordinator && (
                    <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30">
                      Coordenador
                    </span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onNavigate) {
                      onNavigate('profile');
                    } else {
                      onOpenProfileModal?.();
                    }
                  }}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-brand border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                  aria-label="Meu Perfil"
                >
                  <User className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Meu Perfil</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-brand border border-slate-200 dark:border-slate-700 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                  aria-label="Sair da conta"
                >
                  <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Sair</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <Sparkles className="h-4 w-4 text-brand-primary" aria-hidden="true" />
                <span>Praticando como Visitante Anônimo</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Crie sua conta para salvar seu XP e progresso.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAuthModal?.();
                }}
                className="w-full mt-2 py-1.5 px-3 rounded-brand bg-brand-primary text-white text-xs font-semibold hover:bg-brand-primary-dark transition-colors shadow-sm"
              >
                Criar Conta ou Entrar
              </button>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav
          className="flex-1 overflow-y-auto p-4 space-y-1.5"
          aria-label={isInstitutional ? 'Navegação móvel da coordenação' : 'Navegação móvel'}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = !isInstitutional && activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-brand text-sm font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-brand-primary text-brand-primary-foreground shadow-sm'
                    : isInstitutional
                      ? 'text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Quick Accessibility Toggles */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Acessibilidade
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={toggleDarkMode}
              className="flex items-center justify-center gap-2 p-2.5 rounded-brand border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDarkMode ? (
                <>
                  <Sun className="h-4 w-4 text-amber-500" aria-hidden="true" />
                  Modo Claro
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-slate-600" aria-hidden="true" />
                  Modo Escuro
                </>
              )}
            </button>
            <button
              type="button"
              onClick={toggleHighContrast}
              className={`flex items-center justify-center gap-2 p-2.5 rounded-brand border text-xs font-medium transition-colors ${
                isHighContrast
                  ? 'border-brand-primary bg-brand-primary/10 text-brand-primary font-bold'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Eye className="h-4 w-4" aria-hidden="true" />
              Alto Contraste
            </button>
          </div>
        </div>

        {/* LGPD Compliance Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenLegalModal?.();
            }}
            className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-brand-primary dark:hover:text-brand-primary flex items-center justify-between w-full text-left transition-colors"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
              <span>LGPD Art. 18 &bull; Dados protegidos</span>
            </div>
            <span className="text-[10px] underline font-medium">Ver Termos</span>
          </button>
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenErasureModal?.();
              }}
              className="text-[10px] text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 underline text-left block w-full transition-colors"
            >
              Exclusão de Conta e Dados (Art. 18, VI)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
