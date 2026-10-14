import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TermsAndPrivacyModal } from './TermsAndPrivacyModal';

describe('TermsAndPrivacyModal Component', () => {
  const handleClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render anything when isOpen is false', () => {
    const { container } = render(
      <TermsAndPrivacyModal isOpen={false} onClose={handleClose} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('should render dialog with accessible attributes when isOpen is true', () => {
    render(<TermsAndPrivacyModal isOpen={true} onClose={handleClose} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'legal-modal-title');
    expect(screen.getByText('Termos de Uso e Privacidade LGPD')).toBeInTheDocument();
  });

  it('should display Terms of Use content by default and allow switching to Privacy & LGPD', () => {
    render(<TermsAndPrivacyModal isOpen={true} onClose={handleClose} />);

    // By default, Terms of Use tab is active
    expect(screen.getByRole('tab', { name: /Termos de Uso/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText(/1\. Finalidade Educacional e Princípio da Equidade/i)).toBeInTheDocument();

    // Click Privacy & LGPD tab
    const privacyTab = screen.getByRole('tab', { name: /Política de Privacidade & LGPD/i });
    fireEvent.click(privacyTab);

    expect(privacyTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText(/Minimização Extrema de Dados \(LGPD Art\. 6º, III\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Proteção Integral do Adolescente \(Art\. 14 da LGPD\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Portabilidade \(Art\. 18, V\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Eliminação Definitiva \(Art\. 18, VI\)/i)).toBeInTheDocument();
  });

  it('should support initialTab="privacy" on open', () => {
    render(<TermsAndPrivacyModal isOpen={true} onClose={handleClose} initialTab="privacy" />);

    expect(screen.getByRole('tab', { name: /Política de Privacidade & LGPD/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText(/Compromisso de Não-Comercialização/i)).toBeInTheDocument();
  });

  it('should call onClose when close button or "Entendido e Fechar" is clicked', () => {
    render(<TermsAndPrivacyModal isOpen={true} onClose={handleClose} />);

    const closeBtn = screen.getByRole('button', { name: 'Fechar termos e privacidade' });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    const entendidoBtn = screen.getByRole('button', { name: 'Entendido e Fechar' });
    fireEvent.click(entendidoBtn);
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('should call onClose when Escape key is pressed', () => {
    render(<TermsAndPrivacyModal isOpen={true} onClose={handleClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should handle keyboard Tab focus cycling inside modal', () => {
    render(<TermsAndPrivacyModal isOpen={true} onClose={handleClose} />);

    const closeBtn = screen.getByRole('button', { name: 'Fechar termos e privacidade' });
    const entendidoBtn = screen.getByRole('button', { name: 'Entendido e Fechar' });

    entendidoBtn.focus();
    expect(document.activeElement).toBe(entendidoBtn);

    // Tab on last element should cycle to first
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: false });
    expect(document.activeElement).toBe(closeBtn);

    // Shift+Tab on first element should cycle to last
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(entendidoBtn);
  });
});
