import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AvatarCreator } from './AvatarCreator';
import { DEFAULT_AVATAR_CONFIG } from '@/types';

describe('AvatarCreator Component', () => {
  it('renders avatar creator with preview and category tabs', () => {
    const onSave = vi.fn();
    render(<AvatarCreator initialConfig={DEFAULT_AVATAR_CONFIG} onSave={onSave} />);

    expect(screen.getByText(/personalize seu avatar/i)).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /pele/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /cabelo/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /rosto/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /roupas/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /acessórios/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /fundo/i })).toBeInTheDocument();
  });

  it('switches tabs and allows selecting options', () => {
    const onSave = vi.fn();
    render(<AvatarCreator initialConfig={DEFAULT_AVATAR_CONFIG} onSave={onSave} />);

    // Switch to hair tab
    fireEvent.click(screen.getByRole('tab', { name: /cabelo/i }));
    expect(screen.getByText(/estilo de penteado:/i)).toBeInTheDocument();

    // Select curly hair
    fireEvent.click(screen.getByRole('button', { name: /cacheado \/ black/i }));

    // Switch to accessories tab
    fireEvent.click(screen.getByRole('tab', { name: /acessórios/i }));
    expect(screen.getByRole('button', { name: /capelo sisu/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /capelo sisu/i }));

    // Save avatar
    fireEvent.click(screen.getByRole('button', { name: /salvar meu avatar/i }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        hairStyle: 'curly',
        accessory: 'graduationCap',
      })
    );
  });

  it('randomizes avatar configuration when clicking the randomize button', () => {
    const onSave = vi.fn();
    render(<AvatarCreator initialConfig={DEFAULT_AVATAR_CONFIG} onSave={onSave} />);

    const randomBtn = screen.getByRole('button', { name: /aleatório/i });
    fireEvent.click(randomBtn);

    // Clicking save passes the randomized configuration
    fireEvent.click(screen.getByRole('button', { name: /salvar meu avatar/i }));
    expect(onSave).toHaveBeenCalledTimes(1);
  });
});
