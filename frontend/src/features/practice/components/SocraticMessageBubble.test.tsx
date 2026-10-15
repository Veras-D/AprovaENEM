import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SocraticMessageBubble } from './SocraticMessageBubble';
import type { SocraticMessageItemDto } from '@/api/types';

describe('SocraticMessageBubble', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders user message properly with appropriate aria-label and timestamp', () => {
    const userMsg: SocraticMessageItemDto = {
      id: 'msg-u1',
      role: 'user',
      content: 'Qual fórmula de cinemática devo usar?',
      timestamp: '2026-10-15T10:30:00Z',
    };

    render(<SocraticMessageBubble message={userMsg} />);

    expect(screen.getByRole('group', { name: /Sua pergunta/i })).toBeInTheDocument();
    expect(screen.getByText('Qual fórmula de cinemática devo usar?')).toBeInTheDocument();
  });

  it('renders assistant message with tutor header and bot icon', () => {
    const tutorMsg: SocraticMessageItemDto = {
      id: 'msg-a1',
      role: 'assistant',
      content: 'Pense na relação entre deslocamento e velocidade média: $v = \\frac{\\Delta s}{\\Delta t}$.',
      timestamp: '2026-10-15T10:30:05Z',
    };

    render(<SocraticMessageBubble message={tutorMsg} />);

    expect(screen.getByRole('group', { name: /Resposta do Tutor Socrático/i })).toBeInTheDocument();
    expect(screen.getByText('Tutor Socrático')).toBeInTheDocument();
    expect(screen.queryByText(/Resposta base INEP/i)).not.toBeInTheDocument();
  });

  it('renders fallback badge when isFallback is true', () => {
    const fallbackMsg: SocraticMessageItemDto = {
      id: 'msg-a2',
      role: 'assistant',
      content: 'Esta é uma resolução conceitual base do INEP.',
      timestamp: '2026-10-15T10:31:00Z',
      isFallback: true,
    };

    render(<SocraticMessageBubble message={fallbackMsg} />);

    expect(screen.getByText(/Resposta base INEP/i)).toBeInTheDocument();
  });

  it('copies message text to clipboard when copy button is clicked', async () => {
    const tutorMsg: SocraticMessageItemDto = {
      id: 'msg-a3',
      role: 'assistant',
      content: 'Copie este texto explicativo.',
      timestamp: '2026-10-15T10:32:00Z',
    };

    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<SocraticMessageBubble message={tutorMsg} />);

    const copyBtn = screen.getByRole('button', { name: /Copiar resposta do tutor/i });
    fireEvent.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalledWith('Copie este texto explicativo.');
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Resposta copiada/i })).toBeInTheDocument();
    });
  });
});
