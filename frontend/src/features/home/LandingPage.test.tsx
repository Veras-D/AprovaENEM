import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LandingPage } from './LandingPage';
import { useTenantStore } from '@/stores/useTenantStore';
import { DEFAULT_TENANT } from '@/tenants/default';

describe('LandingPage component', () => {
  const onStartPractice = vi.fn();
  const onNavigate = vi.fn();
  const onOpenAuthModal = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useTenantStore.setState({
      currentTenant: {
        ...DEFAULT_TENANT,
        name: 'AprovaENEM Social',
        tagline: 'Preparatório Popular Acessível para o ENEM',
      },
      isDarkMode: false,
    });
  });

  it('renders tenant-adapted hero heading, badge, and tagline', () => {
    render(
      <LandingPage
        onStartPractice={onStartPractice}
        onNavigate={onNavigate}
        onOpenAuthModal={onOpenAuthModal}
      />
    );

    expect(screen.getByText(/Portal Oficial • AprovaENEM Social/i)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: /Preparação Completa, Inteligente e Acessível para o ENEM/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Preparatório Popular Acessível para o ENEM/i)
    ).toBeInTheDocument();
  });

  it('calls onStartPractice when clicking primary CTA buttons', () => {
    render(
      <LandingPage
        onStartPractice={onStartPractice}
        onNavigate={onNavigate}
        onOpenAuthModal={onOpenAuthModal}
      />
    );

    const startBtns = screen.getAllByRole('button', { name: /Começar Simulado Agora|Iniciar Simulado ENEM/i });
    expect(startBtns.length).toBeGreaterThan(0);

    fireEvent.click(startBtns[0]!);
    expect(onStartPractice).toHaveBeenCalledTimes(1);
  });

  it('calls onNavigate with diagnostics when clicking Mapeamento Diagnóstico', () => {
    render(
      <LandingPage
        onStartPractice={onStartPractice}
        onNavigate={onNavigate}
        onOpenAuthModal={onOpenAuthModal}
      />
    );

    const diagBtn = screen.getByRole('button', { name: /Mapeamento Diagnóstico/i });
    fireEvent.click(diagBtn);
    expect(onNavigate).toHaveBeenCalledWith('diagnostics');
  });

  it('renders all 4 educational pillars and calls appropriate handlers', () => {
    render(
      <LandingPage
        onStartPractice={onStartPractice}
        onNavigate={onNavigate}
        onOpenAuthModal={onOpenAuthModal}
      />
    );

    expect(screen.getByText('Simulado Oficial INEP & KaTeX')).toBeInTheDocument();
    expect(screen.getByText('Tutor IA Socrático Pedagógico')).toBeInTheDocument();
    expect(screen.getByText('Acessibilidade Universal (WCAG 2.1 AA)')).toBeInTheDocument();
    expect(screen.getByText('Diagnóstico TRI & Gamificação')).toBeInTheDocument();

    const rankingCardBtn = screen.getByRole('button', { name: /Ver Ranking & Métricas/i });
    fireEvent.click(rankingCardBtn);
    expect(onNavigate).toHaveBeenCalledWith('leaderboard');
  });

  it('calls onOpenAuthModal when clicking Criar Conta / Entrar', () => {
    render(
      <LandingPage
        onStartPractice={onStartPractice}
        onNavigate={onNavigate}
        onOpenAuthModal={onOpenAuthModal}
      />
    );

    const authBtn = screen.getByRole('button', { name: /Criar Conta \/ Entrar/i });
    fireEvent.click(authBtn);
    expect(onOpenAuthModal).toHaveBeenCalledTimes(1);
  });
});
