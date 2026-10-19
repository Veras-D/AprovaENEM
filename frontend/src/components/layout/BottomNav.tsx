import React from 'react';
import {
  Home,
  BookOpen,
  Trophy,
  BarChart2,
  Menu,
  Users,
  TrendingUp,
  Award,
  HelpCircle,
  GraduationCap,
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';

export interface BottomNavProps {
  readonly activeSection?: string;
  readonly onNavigate?: (section: string) => void;
  readonly onOpenDrawer: () => void;
}

/**
 * Mobile-First Sticky Bottom Navigation Bar for Smartphones.
 * Provides accessible, thumb-friendly touch targets (>= 44x44px) for one-handed operation.
 * Dynamically switches between Student Portal items and Coordinator Portal sections.
 */
export const BottomNav: React.FC<BottomNavProps> = ({
  activeSection = 'practice',
  onNavigate,
  onOpenDrawer,
}) => {
  const { user, isAuthenticated } = useAuthStore();
  const isCoordinator = Boolean(
    isAuthenticated &&
      user?.roles?.some(
        (role) =>
          role === 'ROLE_ADMIN' ||
          role === 'ROLE_INSTITUTIONAL_ADMIN'
      )
  );

  const isInstitutional = activeSection === 'institutional';

  const studentItems = [
    { id: 'home', label: 'Início', icon: Home, isAnchor: false },
    { id: 'practice', label: 'Praticar', icon: BookOpen, isAnchor: false },
    { id: 'leaderboard', label: 'Ranking', icon: Trophy, isAnchor: false },
    { id: 'diagnostics', label: 'Diagnóstico', icon: BarChart2, isAnchor: false },
  ];

  const guestItems = [
    { id: 'home', label: 'Início', icon: Home, isAnchor: false },
    { id: 'practice', label: 'Praticar', icon: BookOpen, isAnchor: false },
  ];

  const coordinatorItems = [
    { id: 'cohort-overview', label: 'Turmas', icon: Users, isAnchor: true },
    { id: 'cohort-radar', label: 'Radar', icon: TrendingUp, isAnchor: true },
    { id: 'cohort-areas', label: 'Tópicos', icon: Award, isAnchor: true },
    { id: 'cohort-distractors', label: 'Distratores', icon: HelpCircle, isAnchor: true },
  ];

  const gateItems = [
    { id: 'home', label: 'Voltar ao Aluno', icon: GraduationCap, isAnchor: false },
  ];

  const items = isInstitutional
    ? isCoordinator
      ? coordinatorItems
      : gateItems
    : isAuthenticated
      ? studentItems
      : guestItems;

  const handleItemClick = (item: (typeof items)[number]) => {
    if (item.isAnchor) {
      const el = document.getElementById(item.id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      onNavigate?.(item.id);
    }
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-lg px-2 py-1"
      aria-label={isInstitutional ? 'Navegação móvel da coordenação' : 'Navegação móvel inferior'}
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = !isInstitutional && activeSection === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleItemClick(item)}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-brand transition-all text-xs font-medium ${
                isActive
                  ? 'text-brand-primary font-bold'
                  : isInstitutional
                    ? 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className={`h-5 w-5 mb-0.5 transition-transform ${
                  isActive
                    ? 'scale-110 text-brand-primary stroke-[2.5]'
                    : isInstitutional
                      ? 'stroke-2 text-indigo-600 dark:text-indigo-400'
                      : 'stroke-2'
                }`}
                aria-hidden="true"
              />
              <span>{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-0.5 animate-pulse" />
              )}
            </button>
          );
        })}

        {/* Mobile Drawer Trigger ("Mais" / Menu) */}
        <button
          type="button"
          onClick={onOpenDrawer}
          className="flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-brand text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors text-xs font-medium"
          aria-label="Mais: Abrir menu de opções"
        >
          <Menu className="h-5 w-5 mb-0.5 stroke-2" aria-hidden="true" />
          <span>Mais</span>
        </button>
      </div>
    </nav>
  );
};
