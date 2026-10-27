import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  Search,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { NotificationCategory, StudentNotification } from './NotificationBell';

export interface NotificationCenterModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly notifications: readonly StudentNotification[];
  readonly unreadCount: number;
  readonly onMarkAllAsRead: () => void;
  readonly onNotificationClick: (item: StudentNotification) => void;
  readonly onNavigate?: (section: string) => void;
}

const NOTIFICATION_ICONS: Record<string, React.ElementType> = {
  Trophy,
  Flame,
  Target,
  Clock,
  Activity,
  Sparkles,
  ShieldAlert,
};

const CATEGORY_LABELS: Record<Exclude<NotificationCategory, 'ALL'>, string> = {
  ACHIEVEMENT: 'Conquista',
  REMINDER: 'Lembrete',
  UPDATE: 'Aviso',
};

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  onMarkAllAsRead,
  onNotificationClick,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<NotificationCategory>('ALL');
  const [onlyUnread, setOnlyUnread] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedElement.current = document.activeElement as HTMLElement;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      previouslyFocusedElement.current?.focus();
    };
  }, [isOpen, onClose]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      if (activeTab !== 'ALL' && item.category !== activeTab) {
        return false;
      }
      if (onlyUnread && item.isRead) {
        return false;
      }
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchMessage = item.message.toLowerCase().includes(q);
        return matchTitle || matchMessage;
      }
      return true;
    });
  }, [notifications, activeTab, onlyUnread, searchQuery]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-center-title"
      data-testid="notification-center-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 m-0"
      ref={modalRef}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-2xl max-h-[88vh] flex flex-col rounded-brand border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-800/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
              <Bell className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="notification-center-title"
                className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100"
              >
                Central de Notificações
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Histórico completo de conquistas, lembretes de estudo e avisos da plataforma ({notifications.length}{' '}
                {notifications.length === 1 ? 'registro' : 'registros'})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllAsRead}
                aria-label="Marcar todas as notificações como lidas"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:bg-brand-primary/10 px-2.5 py-1.5 rounded-brand transition-colors cursor-pointer"
              >
                <CheckCheck className="h-4 w-4" aria-hidden="true" />
                <span>Marcar todas como lidas</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar central de notificações"
              className="p-1.5 rounded-brand text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary cursor-pointer"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Search & Filters Bar */}
        <div className="px-4 sm:px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search
                className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar em notificações, conquistas ou lembretes..."
                aria-label="Buscar notificações"
                className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-brand border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            {/* Only Unread Toggle */}
            <button
              type="button"
              onClick={() => setOnlyUnread((prev) => !prev)}
              aria-pressed={onlyUnread}
              className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-brand text-xs font-semibold border transition-colors cursor-pointer shrink-0 ${
                onlyUnread
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-300'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Filter className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Apenas não lidas ({unreadCount})</span>
            </button>
          </div>

          {/* Category Filter Tabs */}
          <div
            className="flex items-center gap-1.5 overflow-x-auto scrollbar-none"
            role="tablist"
            aria-label="Categorias da central de notificações"
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
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
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
        </div>

        {/* Full Scrollable Notifications Feed */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-2">
              <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                <Bell className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Nenhuma notificação encontrada
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tente ajustar o filtro ou termo de busca para visualizar todo o histórico.
              </p>
            </div>
          ) : (
            filteredNotifications.map((item) => {
              const IconComponent = NOTIFICATION_ICONS[item.iconName] || Trophy;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onNotificationClick(item);
                    if (item.targetSection) {
                      onClose();
                    }
                  }}
                  className={`p-4 sm:px-5 transition-colors flex items-start gap-3.5 cursor-pointer group ${
                    item.isRead
                      ? 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      : 'bg-amber-50/40 dark:bg-amber-950/20 hover:bg-amber-50/70 dark:hover:bg-amber-950/30'
                  }`}
                >
                  {/* Category Icon */}
                  <div
                    className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 shadow-2xs ${
                      item.iconName === 'ShieldAlert'
                        ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                        : item.category === 'ACHIEVEMENT'
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                          : item.category === 'REMINDER'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                    }`}
                  >
                    <IconComponent className="h-4.5 w-4.5" aria-hidden="true" />
                  </div>

                  {/* Notification Body */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-primary transition-colors">
                          {item.title}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {CATEGORY_LABELS[item.category]}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          {item.timestamp}
                        </span>
                        {!item.isRead && (
                          <span
                            className="h-2 w-2 rounded-full bg-rose-500 shrink-0"
                            aria-label="Não lida"
                          />
                        )}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.message}
                    </p>

                    {item.actionLabel && (
                      <div className="pt-1 flex items-center text-xs font-semibold text-brand-primary group-hover:underline">
                        <span>{item.actionLabel}</span>
                        <ChevronRight className="h-3.5 w-3.5 ml-0.5" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Secondary Shortcut to Ranking & Conquistas */}
        <div className="p-3.5 sm:px-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigate?.('leaderboard');
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:underline cursor-pointer"
          >
            <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Ir para Conquistas &amp; Ranking da Liga &rarr;</span>
          </button>

          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
};
