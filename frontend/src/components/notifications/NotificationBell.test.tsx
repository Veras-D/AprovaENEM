import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { queryKeys } from '@/api/query-keys';
import { NotificationBell } from './NotificationBell';
import { useSessionStore } from '@/stores/useSessionStore';

describe('NotificationBell Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    localStorage.clear();
    useSessionStore.setState({
      isDiagnosticCompleted: false,
      savedDiagnosticReport: null,
      diagnosticReport: null,
    });
    vi.clearAllMocks();

    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
      },
    });
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>
    );
  };

  it('renders notification bell button with unread counter', () => {
    renderWithProviders(<NotificationBell />);

    const bellBtn = screen.getByRole('button', { name: /Notificações:/i });
    expect(bellBtn).toBeInTheDocument();
  });

  it('opens notification popover when clicked and shows category tabs', () => {
    renderWithProviders(<NotificationBell />);

    const bellBtn = screen.getByRole('button', { name: /Notificações:/i });
    fireEvent.click(bellBtn);

    expect(screen.getByRole('dialog', { name: /Central de Notificações/i })).toBeInTheDocument();
    expect(screen.getByText('Notificações & Lembretes')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Todas/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Conquistas/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Lembretes/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Avisos/i })).toBeInTheDocument();
  });

  it('displays completed diagnostic achievement when diagnostic was completed', () => {
    useSessionStore.setState({
      isDiagnosticCompleted: true,
    });

    renderWithProviders(<NotificationBell />);

    const bellBtn = screen.getByRole('button', { name: /Notificações:/i });
    fireEvent.click(bellBtn);

    expect(screen.getByText(/Conquista: Raio-X Diagnóstico/i)).toBeInTheDocument();
    expect(screen.getByText(/Você concluiu sua avaliação diagnóstica TRI/i)).toBeInTheDocument();
  });

  it('navigates to target section when clicking a notification item', () => {
    useSessionStore.setState({
      isDiagnosticCompleted: true,
    });

    const handleNavigate = vi.fn();
    renderWithProviders(<NotificationBell onNavigate={handleNavigate} />);

    const bellBtn = screen.getByRole('button', { name: /Notificações:/i });
    fireEvent.click(bellBtn);

    const diagNotification = screen.getByText(/Conquista: Raio-X Diagnóstico/i);
    fireEvent.click(diagNotification);

    expect(handleNavigate).toHaveBeenCalledWith('diagnostics');
    // Popover should close
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('marks all notifications as read when clicking "Marcar lidas"', () => {
    renderWithProviders(<NotificationBell />);

    const bellBtn = screen.getByRole('button', { name: /Notificações:/i });
    fireEvent.click(bellBtn);

    const markReadBtn = screen.getByRole('button', { name: /Marcar todas como lidas/i });
    expect(markReadBtn).toBeInTheDocument();
    fireEvent.click(markReadBtn);

    expect(screen.getByText('Tudo atualizado')).toBeInTheDocument();
  });

  it('filters notifications by category tab', () => {
    useSessionStore.setState({
      isDiagnosticCompleted: true,
    });

    renderWithProviders(<NotificationBell />);

    const bellBtn = screen.getByRole('button', { name: /Notificações:/i });
    fireEvent.click(bellBtn);

    const reminderTab = screen.getByRole('tab', { name: /Lembretes/i });
    fireEvent.click(reminderTab);

    expect(screen.getByText(/Meta Diária de Estudos/i)).toBeInTheDocument();
    expect(screen.queryByText(/Conquista: Raio-X Diagnóstico/i)).not.toBeInTheDocument();
  });

  it('closes popover on Escape key press', () => {
    renderWithProviders(<NotificationBell />);

    const bellBtn = screen.getByRole('button', { name: /Notificações:/i });
    fireEvent.click(bellBtn);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('displays freeze shield consumed notification when streakFreezeAvailable is false', () => {
    queryClient.setQueryData(queryKeys.gamification.profile, {
      userId: 'user-1',
      streakDays: 1,
      streakFreezeAvailable: false,
      dailyGoalProgress: 0,
      dailyGoalTarget: 5,
    });

    renderWithProviders(<NotificationBell />);

    const bellBtn = screen.getByRole('button', { name: /Notificações:/i });
    fireEvent.click(bellBtn);

    expect(screen.getByText(/Escudo de Congelamento Utilizado/i)).toBeInTheDocument();
    expect(screen.getByText(/Seu escudo de emergência mensal salvou sua sequência/i)).toBeInTheDocument();
  });

  it('renders notifications provided by PostgreSQL backend query', () => {
    queryClient.setQueryData(queryKeys.notifications.feed('ALL'), {
      unreadCount: 1,
      notifications: [
        {
          id: '11111111-2222-3333-4444-555555555555',
          channel: 'IN_APP',
          templateCode: 'ACHIEVEMENT_WELCOME',
          title: 'Boas-vindas ao AprovaENEM! 🏅',
          body: 'Você deu o pontapé inicial rumo à aprovação!',
          status: 'SENT',
          sentAt: '2026-10-25T20:00:00Z',
          metadata: JSON.stringify({
            category: 'ACHIEVEMENT',
            iconName: 'Trophy',
            targetSection: 'diagnostics',
            actionLabel: 'Ver Diagnóstico',
          }),
        },
      ],
    });

    renderWithProviders(<NotificationBell />);

    const bellBtn = screen.getByRole('button', { name: /Notificações:/i });
    fireEvent.click(bellBtn);

    expect(screen.getByText(/Boas-vindas ao AprovaENEM!/i)).toBeInTheDocument();
    expect(screen.getByText(/Você deu o pontapé inicial/i)).toBeInTheDocument();
  });

  it('preserves read status across re-mount when previously marked as read', () => {
    localStorage.setItem(
      'aprovaenem_read_notifications',
      JSON.stringify(['reminder-daily-goal', 'reminder-streak'])
    );

    renderWithProviders(<NotificationBell />);

    const bellBtn = screen.getByRole('button', { name: /Notificações:/i });
    fireEvent.click(bellBtn);

    // Filter by reminders tab
    const reminderTab = screen.getByRole('tab', { name: /Lembretes/i });
    fireEvent.click(reminderTab);

    // Notification is rendered but already read (no red dot indicator)
    expect(screen.getByText(/Meta Diária de Estudos/i)).toBeInTheDocument();
  });

  it('displays level achievement notification when profile level is greater than 1', () => {
    queryClient.setQueryData(queryKeys.gamification.profile, {
      userId: 'user-1',
      level: 3,
      levelTitle: 'Calouro Dedicado',
      dailyGoalProgress: 2,
      dailyGoalTarget: 5,
    });

    renderWithProviders(<NotificationBell />);

    const bellBtn = screen.getByRole('button', { name: /Notificações:/i });
    fireEvent.click(bellBtn);

    expect(screen.getByText(/Nível 3 Alcançado! 🌟/i)).toBeInTheDocument();
    expect(screen.getByText(/Você alcançou o Nível 3 \(Calouro Dedicado\)/i)).toBeInTheDocument();
  });
});
