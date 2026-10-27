import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Bell,
  CheckCheck,
  Trophy,
  Flame,
  Target,
  Clock,
  Activity,
  Sparkles,
  ChevronRight,
  X,
  ShieldAlert,
} from 'lucide-react';
import {
  useGamificationProfileQuery,
  useNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useCreateInAppNotificationMutation,
} from '@/api/hooks';
import { useSessionStore } from '@/stores/useSessionStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { NotificationCenterModal } from './NotificationCenterModal';

export type NotificationCategory = 'ALL' | 'ACHIEVEMENT' | 'REMINDER' | 'UPDATE';

export interface StudentNotification {
  readonly id: string;
  readonly category: 'ACHIEVEMENT' | 'REMINDER' | 'UPDATE';
  readonly title: string;
  readonly message: string;
  readonly iconName: 'Trophy' | 'Flame' | 'Target' | 'Clock' | 'Activity' | 'Sparkles' | 'ShieldAlert';
  readonly timestamp: string;
  readonly actionLabel?: string;
  readonly targetSection?: 'practice' | 'leaderboard' | 'diagnostics' | 'profile';
  readonly isRead: boolean;
  readonly createdAt: number;
}

export interface NotificationBellProps {
  readonly onNavigate?: (section: string) => void;
  readonly className?: string;
}

const STORAGE_KEY_READ_NOTIFICATIONS = 'aprovaenem_read_notifications';

const NOTIFICATION_ICONS: Record<string, React.ElementType> = {
  Trophy,
  Flame,
  Target,
  Clock,
  Activity,
  Sparkles,
  ShieldAlert,
};

export const NotificationBell: React.FC<NotificationBellProps> = ({
  onNavigate,
  className = '',
}) => {
  const user = useAuthStore((state) => state.user);
  const storageKey = user?.id ? `${STORAGE_KEY_READ_NOTIFICATIONS}_${user.id}` : STORAGE_KEY_READ_NOTIFICATIONS;

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isCenterModalOpen, setIsCenterModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<NotificationCategory>('ALL');

  // Backend PostgreSQL notifications queries & mutations
  const feedQuery = useNotificationsQuery('ALL');
  const markReadMutation = useMarkNotificationReadMutation();
  const markAllReadMutation = useMarkAllNotificationsReadMutation();
  const createInAppMutation = useCreateInAppNotificationMutation();

  const [localReadIds, setLocalReadIds] = useState<Set<string>>(() => {
    if (typeof localStorage === 'undefined') return new Set();
    try {
      const raw = localStorage.getItem(storageKey);
      return new Set<string>(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  });

  // Re-sync localReadIds whenever storageKey (user) changes
  useEffect(() => {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        setLocalReadIds(new Set<string>(JSON.parse(raw)));
      } else {
        setLocalReadIds(new Set());
      }
    } catch {
      // Storage sandbox
    }
  }, [storageKey]);

  // Combined read IDs from PostgreSQL database records and local storage cache
  const readIds = useMemo(() => {
    const ids = new Set<string>(localReadIds);
    if (feedQuery.data?.notifications) {
      for (const item of feedQuery.data.notifications) {
        if (item.status === 'READ') {
          ids.add(item.id);
          if (item.templateCode) {
            ids.add(item.templateCode);
          }
        }
      }
    }
    return ids;
  }, [localReadIds, feedQuery.data]);

  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const seededTemplatesRef = useRef<Set<string>>(new Set());
  const { mutate: mutateCreateInApp } = createInAppMutation;

  const profileQuery = useGamificationProfileQuery();
  const profile = profileQuery.data;

  const isDiagnosticCompleted = useSessionStore((state) => state.isDiagnosticCompleted);
  const savedDiagnosticReport = useSessionStore((state) => state.savedDiagnosticReport);
  const diagnosticReport = useSessionStore((state) => state.diagnosticReport);

  const hasCompletedDiagnostic =
    isDiagnosticCompleted ||
    Boolean(savedDiagnosticReport) ||
    Boolean(diagnosticReport) ||
    (typeof localStorage !== 'undefined' &&
      localStorage.getItem('aprovaenem_diagnostic_completed') === 'true');

  // Seed diagnostic achievement in backend PostgreSQL database if completed
  useEffect(() => {
    const template = 'ACHIEVEMENT_DIAGNOSTIC';
    if (
      hasCompletedDiagnostic &&
      user?.id &&
      feedQuery.data?.notifications &&
      !seededTemplatesRef.current.has(template)
    ) {
      const alreadyLogged = feedQuery.data.notifications.some(
        (n) => n.templateCode === template
      );
      seededTemplatesRef.current.add(template);
      if (!alreadyLogged) {
        mutateCreateInApp({
          templateCode: template,
          title: 'Conquista: Raio-X Diagnóstico 🎯',
          body: 'Você concluiu sua avaliação diagnóstica TRI! Seu mapa de proficiências e radar pedagógico estão calibrados.',
          metadata: JSON.stringify({
            category: 'ACHIEVEMENT',
            iconName: 'Activity',
            targetSection: 'diagnostics',
            actionLabel: 'Ver Diagnóstico',
          }),
        });
      }
    }
  }, [hasCompletedDiagnostic, user?.id, feedQuery.data?.notifications, mutateCreateInApp]);

  // Seed level achievement in backend PostgreSQL database if student reached level > 1
  useEffect(() => {
    if (profile?.level && profile.level > 1 && user?.id && feedQuery.data?.notifications) {
      const template = `ACHIEVEMENT_LEVEL_${profile.level}`;
      if (seededTemplatesRef.current.has(template)) return;
      const alreadyLogged = feedQuery.data.notifications.some(
        (n) => n.templateCode === template
      );
      seededTemplatesRef.current.add(template);
      if (!alreadyLogged) {
        mutateCreateInApp({
          templateCode: template,
          title: `Nível ${profile.level} Alcançado! 🌟`,
          body: `Parabéns! Você alcançou o Nível ${profile.level} (${profile.levelTitle || 'Estudante Dedicado'}) e acumulou prestígio na sua liga semanal!`,
          metadata: JSON.stringify({
            category: 'ACHIEVEMENT',
            iconName: 'Trophy',
            targetSection: 'leaderboard',
            actionLabel: 'Ver Conquistas',
          }),
        });
      }
    }
  }, [profile?.level, profile?.levelTitle, user?.id, feedQuery.data?.notifications, mutateCreateInApp]);

  // Build the live notifications list reflecting the authenticated student's state & PostgreSQL records
  const notifications: StudentNotification[] = useMemo(() => {
    const now = Date.now();
    const MINUTE_MS = 60 * 1000;
    const HOUR_MS = 60 * MINUTE_MS;
    const DAY_MS = 24 * HOUR_MS;

    const formatSentAt = (sentAt?: string): string => {
      if (!sentAt) return 'Semanal';
      const date = new Date(sentAt);
      if (isNaN(date.getTime())) return 'Hoje';

      const nowDate = new Date(now);
      const startOfToday = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate()).getTime();
      const startOfSentDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
      const diffDays = Math.round((startOfToday - startOfSentDay) / DAY_MS);

      if (diffDays <= 0) return 'Hoje';
      if (diffDays === 1) return 'Ontem';
      if (diffDays < 7) return `Há ${diffDays} dias`;
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    };

    const sortFeed = (items: StudentNotification[]): StudentNotification[] => {
      return [...items].sort((a, b) => {
        // 1. Unread notifications always appear first at the top of the feed
        if (!a.isRead && b.isRead) return -1;
        if (a.isRead && !b.isRead) return 1;

        // 2. Newer notifications (higher createdAt timestamp) appear before older ones
        if (b.createdAt !== a.createdAt) {
          return b.createdAt - a.createdAt;
        }

        // 3. Deterministic tie-breaker
        return a.id.localeCompare(b.id);
      });
    };

    // Build the client-side dynamic/milestone notifications list
    const list: StudentNotification[] = [];

    // Level achievement: recently unlocked milestone
    if (profile?.level && profile.level > 1) {
      list.push({
        id: `achieve-level-${profile.level}`,
        category: 'ACHIEVEMENT',
        title: `Nível ${profile.level} Alcançado! 🌟`,
        message: `Parabéns! Você alcançou o Nível ${profile.level} (${profile.levelTitle || 'Estudante Dedicado'}) e acumulou prestígio na sua liga semanal!`,
        iconName: 'Trophy',
        timestamp: 'Hoje',
        actionLabel: 'Ver Conquistas',
        targetSection: 'leaderboard',
        isRead: readIds.has(`achieve-level-${profile.level}`) || readIds.has(`ACHIEVEMENT_LEVEL_${profile.level}`),
        createdAt: now,
      });
    }

    // 2. Study Reminders (Lembretes) - STABLE IDs
    const dailyProgress = profile?.dailyGoalProgress ?? 0;
    const goalTarget = profile?.dailyGoalTarget ?? 5;
    if (dailyProgress < goalTarget) {
      const remaining = goalTarget - dailyProgress;
      list.push({
        id: 'reminder-daily-goal',
        category: 'REMINDER',
        title: 'Meta Diária de Estudos 🎯',
        message: `Faltam ${remaining} ${remaining === 1 ? 'questão' : 'questões'} para você bater sua meta hoje (${dailyProgress}/${goalTarget} resolvidas).`,
        iconName: 'Target',
        timestamp: 'Hoje',
        actionLabel: 'Praticar Agora',
        targetSection: 'practice',
        isRead: readIds.has('reminder-daily-goal') || readIds.has('DAILY_GOAL_REMINDER'),
        createdAt: now - 15 * MINUTE_MS,
      });
    } else if (dailyProgress >= goalTarget && goalTarget > 0) {
      list.push({
        id: 'reminder-daily-goal',
        category: 'REMINDER',
        title: 'Meta Diária Cumprida! 🎉',
        message: `Excelente disciplina! Você atingiu 100% da sua meta com ${dailyProgress}/${goalTarget} questões hoje.`,
        iconName: 'Target',
        timestamp: 'Hoje',
        actionLabel: 'Ver Pontuação',
        targetSection: 'leaderboard',
        isRead: readIds.has('reminder-daily-goal') || readIds.has('DAILY_GOAL_REMINDER'),
        createdAt: now - 15 * MINUTE_MS,
      });
    }

    const streak = profile?.currentStreakDays ?? 1;
    list.push({
      id: 'reminder-streak',
      category: 'REMINDER',
      title: 'Ofensiva Diária Ativa 🔥',
      message: `Você está com uma sequência de ${streak} ${streak === 1 ? 'dia' : 'dias'} de estudos! Pratique para não quebrar sua rotina.`,
      iconName: 'Flame',
      timestamp: 'Hoje',
      actionLabel: 'Continuar Treino',
      targetSection: 'practice',
      isRead: readIds.has('reminder-streak') || readIds.has('DAILY_STREAK_ACTIVE'),
      createdAt: now - 30 * MINUTE_MS,
    });

    // 1. Achievements (Conquistas)
    if (hasCompletedDiagnostic) {
      list.push({
        id: 'achieve-diagnostic-complete',
        category: 'ACHIEVEMENT',
        title: 'Conquista: Raio-X Diagnóstico 🎯',
        message: 'Você concluiu sua avaliação diagnóstica TRI! Seu mapa de proficiências e radar pedagógico estão calibrados.',
        iconName: 'Activity',
        timestamp: 'Hoje',
        actionLabel: 'Ver Diagnóstico',
        targetSection: 'diagnostics',
        isRead: readIds.has('achieve-diagnostic-complete') || readIds.has('ACHIEVEMENT_DIAGNOSTIC'),
        createdAt: now - 2 * HOUR_MS,
      });
    }

    const hasAnsweredAny = dailyProgress > 0 || (profile?.currentStreakDays ?? 0) > 0 || hasCompletedDiagnostic;
    if (hasAnsweredAny) {
      list.push({
        id: 'achieve-first-question',
        category: 'ACHIEVEMENT',
        title: 'Conquista: Primeiro Passo 🏅',
        message: 'Você deu o pontapé inicial rumo à aprovação no ENEM respondendo às suas primeiras questões!',
        iconName: 'Trophy',
        timestamp: 'Ontem',
        actionLabel: 'Ver Conquistas',
        targetSection: 'leaderboard',
        isRead: readIds.has('achieve-first-question') || readIds.has('ACHIEVEMENT_FIRST_QUESTION'),
        createdAt: now - 1 * DAY_MS,
      });
    }

    if (dailyProgress >= 10 || (profile?.unlockedBadges ?? []).includes('MARATONISTA_QUESTOES')) {
      list.push({
        id: 'achieve-marathoner-bronze',
        category: 'ACHIEVEMENT',
        title: 'Conquista: Maratonista do ENEM 🏆',
        message: 'Parabéns! Você alcançou a marca de 10 questões resolvidas na plataforma com dedicação.',
        iconName: 'Trophy',
        timestamp: 'Há 3 dias',
        actionLabel: 'Ver Conquistas',
        targetSection: 'leaderboard',
        isRead: readIds.has('achieve-marathoner-bronze') || readIds.has('ACHIEVEMENT_MARATHONER_BRONZE'),
        createdAt: now - 3 * DAY_MS,
      });
    }

    // Freeze Shield Consumed Notification (Aviso)
    if (profile && !profile.streakFreezeAvailable) {
      list.push({
        id: 'update-streak-freeze-consumed',
        category: 'UPDATE',
        title: 'Escudo de Congelamento Utilizado 🛡️',
        message: 'Seu escudo de emergência mensal salvou sua sequência de estudos! Ele recarregará no 1º dia do próximo mês.',
        iconName: 'ShieldAlert',
        timestamp: 'Há 4 dias',
        actionLabel: 'Ver Sequência & Ligas',
        targetSection: 'leaderboard',
        isRead: readIds.has('update-streak-freeze-consumed') || readIds.has('STREAK_FREEZE_CONSUMED'),
        createdAt: now - 4 * DAY_MS,
      });
    }

    // 3. Platform & League Updates (Avisos Importantes) - STABLE IDs
    const league = profile?.weeklyLeague ?? 'BRONZE';
    list.push({
      id: 'update-weekly-league',
      category: 'UPDATE',
      title: `Disputa Semanal da Liga ${league} ⚡`,
      message: 'A pontuação da rodada semanal reinicia domingo às 23:59 BRT. Resolva simulados para subir de liga!',
      iconName: 'Clock',
      timestamp: 'Há 5 dias',
      actionLabel: 'Ver Classificação',
      targetSection: 'leaderboard',
      isRead: readIds.has('update-weekly-league') || readIds.has('WEEKLY_LEAGUE_UPDATE'),
      createdAt: now - 5 * DAY_MS,
    });

    list.push({
      id: 'update-socratic-tutor',
      category: 'UPDATE',
      title: 'Tutor IA Socrático Pedagógico ✨',
      message: 'Travou em uma questão difícil? Abra o Tutor IA nas questões para pistas conceituais guiadas sem respostas prontas.',
      iconName: 'Sparkles',
      timestamp: 'Há 6 dias',
      actionLabel: 'Experimentar no Simulado',
      targetSection: 'practice',
      isRead: readIds.has('update-socratic-tutor') || readIds.has('SOCRATIC_TUTOR_TIP'),
      createdAt: now - 6 * DAY_MS,
    });

    // If backend database returned notification feed items, deduplicate and merge them
    if (feedQuery.data?.notifications && feedQuery.data.notifications.length > 0) {
      const backendTemplates = new Set<string>();
      const backendItems: StudentNotification[] = [];

      for (const n of feedQuery.data.notifications) {
        const dedupKey = n.templateCode || n.title;
        if (backendTemplates.has(dedupKey)) {
          continue;
        }
        backendTemplates.add(dedupKey);

        let category: 'ACHIEVEMENT' | 'REMINDER' | 'UPDATE' = 'UPDATE';
        let iconName: 'Trophy' | 'Flame' | 'Target' | 'Clock' | 'Activity' | 'Sparkles' | 'ShieldAlert' = 'Clock';
        let targetSection: 'practice' | 'leaderboard' | 'diagnostics' | 'profile' | undefined = undefined;
        let actionLabel = 'Ver Detalhes';

        if (n.metadata) {
          try {
            const meta = JSON.parse(n.metadata);
            if (meta.category) category = meta.category;
            if (meta.iconName) iconName = meta.iconName;
            if (meta.targetSection) targetSection = meta.targetSection;
            if (meta.actionLabel) actionLabel = meta.actionLabel;
          } catch {
            // Keep defaults
          }
        }

        // Infer category, icon, targetSection, and actionLabel from templateCode if missing in metadata
        if (n.templateCode.includes('ACHIEV') || n.templateCode.includes('WELCOME')) {
          category = 'ACHIEVEMENT';
          iconName = n.templateCode.includes('DIAG') ? 'Activity' : 'Trophy';
          if (!targetSection) {
            targetSection = n.templateCode.includes('DIAG') ? 'diagnostics' : 'leaderboard';
          }
          if (actionLabel === 'Ver Detalhes') {
            actionLabel = n.templateCode.includes('DIAG') ? 'Ver Diagnóstico' : 'Ver Conquistas';
          }
        } else if (n.templateCode.includes('GOAL') || n.templateCode.includes('STREAK')) {
          category = 'REMINDER';
          iconName = n.templateCode.includes('STREAK') ? 'Flame' : 'Target';
          if (!targetSection) {
            targetSection = 'practice';
          }
          if (actionLabel === 'Ver Detalhes') {
            actionLabel = 'Praticar Agora';
          }
        } else if (n.templateCode.includes('EMAIL_VERIFICATION')) {
          category = 'UPDATE';
          iconName = 'ShieldAlert';
          if (!targetSection) {
            targetSection = 'profile';
          }
          if (actionLabel === 'Ver Detalhes') {
            actionLabel = 'Ver Perfil';
          }
        } else if (n.templateCode.includes('LEAGUE')) {
          category = 'UPDATE';
          iconName = 'Clock';
          if (!targetSection) {
            targetSection = 'leaderboard';
          }
          if (actionLabel === 'Ver Detalhes') {
            actionLabel = 'Ver Classificação';
          }
        } else if (n.templateCode.includes('TUTOR')) {
          category = 'UPDATE';
          iconName = 'Sparkles';
          if (!targetSection) {
            targetSection = 'practice';
          }
          if (actionLabel === 'Ver Detalhes') {
            actionLabel = 'Experimentar no Simulado';
          }
        }

        // Sanitize legacy ": null" suffix in email verification notifications
        const cleanedBody = n.body.replace(/:\s*null\s*$/i, '.');
        const createdAt = n.sentAt ? new Date(n.sentAt).getTime() : now;

        backendItems.push({
          id: n.id,
          category,
          title: n.title,
          message: cleanedBody,
          iconName,
          timestamp: formatSentAt(n.sentAt),
          actionLabel,
          targetSection: targetSection ?? 'leaderboard',
          isRead: n.status === 'READ' || readIds.has(n.id) || readIds.has(n.templateCode),
          createdAt: isNaN(createdAt) ? now : createdAt,
        });
      }

      return sortFeed(backendItems);
    }

    return sortFeed(list);
  }, [feedQuery.data, hasCompletedDiagnostic, profile, readIds]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'ALL') return notifications;
    return notifications.filter((n) => n.category === activeTab);
  }, [notifications, activeTab]);

  // Click outside to close popover
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const markAllAsRead = () => {
    const allIds = new Set(readIds);
    for (const n of notifications) {
      allIds.add(n.id);
    }
    setLocalReadIds(allIds);
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(Array.from(allIds)));
      } catch {
        // Storage sandbox
      }
    }
    // Persist mark all as read to PostgreSQL database
    markAllReadMutation.mutate();
  };

  const handleNotificationClick = (item: StudentNotification) => {
    const next = new Set(readIds);
    next.add(item.id);
    setLocalReadIds(next);
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(Array.from(next)));
      } catch {
        // Storage sandbox
      }
    }

    // If ID matches UUID format, persist to PostgreSQL database
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id);
    if (isUuid) {
      markReadMutation.mutate(item.id);
    }

    if (item.targetSection) {
      setIsOpen(false);
      onNavigate?.(item.targetSection);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Bell Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={`Notificações: ${unreadCount} ${unreadCount === 1 ? 'não lida' : 'não lidas'}`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        title="Central de Notificações, Conquistas e Lembretes"
        className="relative p-2 rounded-brand text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary cursor-pointer"
      >
        <Bell className="h-4.5 w-4.5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            className="absolute top-1 right-1 flex items-center justify-center min-w-[17px] h-[17px] px-1 text-[10px] font-bold text-white bg-rose-600 rounded-full border-2 border-white dark:border-slate-900 shadow-2xs"
            aria-hidden="true"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Floating Notification Popover Dropdown */}
      {isOpen && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label="Central de Notificações do Aluno"
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-brand border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
        >
          {/* Header */}
          <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 bg-slate-50/70 dark:bg-slate-800/40">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
                <Bell className="h-3.5 w-3.5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                  Notificações & Lembretes
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {unreadCount === 0 ? 'Tudo atualizado' : `${unreadCount} ${unreadCount === 1 ? 'nova pendente' : 'novas pendentes'}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  title="Marcar todas como lidas"
                  aria-label="Marcar todas como lidas"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-primary hover:underline px-2 py-1 rounded-sm cursor-pointer"
                >
                  <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="hidden sm:inline">Marcar lidas</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Fechar notificações"
                className="p-1 rounded-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none cursor-pointer"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div
            className="flex items-center gap-1 px-3 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 text-xs overflow-x-auto scrollbar-none"
            role="tablist"
            aria-label="Filtro de notificações"
          >
            {(
              [
                { id: 'ALL', label: 'Todas' },
                { id: 'ACHIEVEMENT', label: 'Conquistas' },
                { id: 'REMINDER', label: 'Lembretes' },
                { id: 'UPDATE', label: 'Avisos' },
              ] as const
            ).map((tab) => {
              const count =
                tab.id === 'ALL'
                  ? notifications.length
                  : notifications.filter((n) => n.category === tab.id).length;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-brand-primary text-white font-bold shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {tab.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 sm:max-h-96 overflow-y-auto scrollbar-none divide-y divide-slate-100 dark:divide-slate-800">
            {filteredNotifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                Nenhuma notificação encontrada nesta categoria.
              </div>
            ) : (
              filteredNotifications.map((item) => {
                const IconComponent = NOTIFICATION_ICONS[item.iconName] || Trophy;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`p-3.5 transition-colors flex items-start gap-3 cursor-pointer group ${
                      item.isRead
                        ? 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        : 'bg-amber-50/40 dark:bg-amber-950/20 hover:bg-amber-50/70 dark:hover:bg-amber-950/30'
                    }`}
                  >
                    {/* Category Icon */}
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-2xs ${
                        item.iconName === 'ShieldAlert'
                          ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                          : item.category === 'ACHIEVEMENT'
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                            : item.category === 'REMINDER'
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                              : 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                      }`}
                    >
                      <IconComponent className="h-4 w-4" aria-hidden="true" />
                    </div>

                    {/* Notification Body */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-brand-primary transition-colors">
                          {item.title}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">
                            {item.timestamp}
                          </span>
                          {!item.isRead && (
                            <span
                              className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0"
                              aria-label="Não lida"
                            />
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {item.message}
                      </p>

                      {item.actionLabel && (
                        <div className="pt-1 flex items-center text-[11px] font-semibold text-brand-primary group-hover:underline">
                          <span>{item.actionLabel}</span>
                          <ChevronRight className="h-3 w-3 ml-0.5" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setIsCenterModalOpen(true);
              }}
              className="text-xs text-brand-primary hover:underline font-semibold cursor-pointer"
            >
              Ver todas as notificações &rarr;
            </button>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onNavigate?.('leaderboard');
              }}
              className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium cursor-pointer"
            >
              Ranking &amp; Conquistas
            </button>
          </div>
        </div>
      )}

      {/* Full Notification Center Modal */}
      <NotificationCenterModal
        isOpen={isCenterModalOpen}
        onClose={() => setIsCenterModalOpen(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAllAsRead={markAllAsRead}
        onNotificationClick={handleNotificationClick}
        onNavigate={onNavigate}
      />
    </div>
  );
};
