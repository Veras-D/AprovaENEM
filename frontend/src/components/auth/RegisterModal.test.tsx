import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RegisterModal } from './RegisterModal';
import { authService } from '@/api/services/auth.service';
import { MOCK_AUTH_LOGIN_RESPONSE } from '@/api/mocks/mock-data';

describe('RegisterModal Component', () => {
  const handleClose = vi.fn();
  let queryClient: QueryClient;

  const renderWithProviders = (ui: React.ReactElement) => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    });

    return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render anything when isOpen is false', () => {
    const { container } = renderWithProviders(
      <RegisterModal isOpen={false} onClose={handleClose} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('should render dialog with data minimization disclosure in register mode', () => {
    renderWithProviders(<RegisterModal isOpen={true} onClose={handleClose} initialMode="register" />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText('Criar Conta de Estudante')).toBeInTheDocument();

    // Data minimization banner
    expect(screen.getByText(/Privacidade Garantida \(LGPD Art\. 6º, III\):/i)).toBeInTheDocument();
    expect(screen.getByText(/Não exigimos CPF, RG ou telefone/i)).toBeInTheDocument();
  });

  it('should enforce mandatory LGPD consent checkbox before allowing registration', () => {
    renderWithProviders(<RegisterModal isOpen={true} onClose={handleClose} initialMode="register" />);

    const submitBtn = screen.getByRole('button', { name: /Criar Minha Conta Gratuita/i });
    const consentCheckbox = screen.getByRole('checkbox', {
      name: /Declaro que li e concordo com os Termos de Uso e a Política de Privacidade/i,
    });

    // Button must be disabled initially
    expect(submitBtn).toBeDisabled();
    expect(consentCheckbox).not.toBeChecked();

    // Check the box
    fireEvent.click(consentCheckbox);
    expect(consentCheckbox).toBeChecked();
    expect(submitBtn).not.toBeDisabled();

    // Uncheck the box
    fireEvent.click(consentCheckbox);
    expect(consentCheckbox).not.toBeChecked();
    expect(submitBtn).toBeDisabled();
  });

  it('should open Terms and Privacy modal when clicking links in consent text', () => {
    renderWithProviders(<RegisterModal isOpen={true} onClose={handleClose} initialMode="register" />);

    const termsBtn = screen.getByRole('button', { name: 'Termos de Uso' });
    fireEvent.click(termsBtn);

    // Terms & Privacy modal opens with Terms tab active
    expect(screen.getByText('Termos de Uso e Privacidade LGPD')).toBeInTheDocument();
    expect(screen.getByText(/1\. Finalidade Educacional e Princípio da Equidade/i)).toBeInTheDocument();

    // Close the terms modal
    const closeLegalBtn = screen.getByRole('button', { name: 'Fechar termos e privacidade' });
    fireEvent.click(closeLegalBtn);

    // Click Privacy link
    const privacyBtn = screen.getByRole('button', { name: 'Política de Privacidade (LGPD)' });
    fireEvent.click(privacyBtn);

    expect(screen.getByText(/Minimização Extrema de Dados \(LGPD Art\. 6º, III\)/i)).toBeInTheDocument();
  });

  it('should validate form input fields on register attempt', async () => {
    renderWithProviders(<RegisterModal isOpen={true} onClose={handleClose} initialMode="register" />);

    const consentCheckbox = screen.getByRole('checkbox', {
      name: /Declaro que li e concordo com os Termos de Uso e a Política de Privacidade/i,
    });
    fireEvent.click(consentCheckbox);

    const submitBtn = screen.getByRole('button', { name: /Criar Minha Conta Gratuita/i });

    // Submit with empty name
    fireEvent.click(submitBtn);
    expect(screen.getByText(/Por favor, informe seu nome completo/i)).toBeInTheDocument();

    // Fill short name
    fireEvent.change(screen.getByLabelText(/Nome Completo ou Social/i), { target: { value: 'Lucas Silva' } });
    fireEvent.click(submitBtn);
    expect(screen.getByText(/Por favor, informe um endereço de e-mail válido/i)).toBeInTheDocument();

    // Fill valid email and short password
    fireEvent.change(screen.getByLabelText(/E-mail do Estudante/i), { target: { value: 'lucas@escola.gov.br' } });
    fireEvent.change(screen.getByLabelText(/Senha Segura/i), { target: { value: '123' } });
    fireEvent.click(submitBtn);
    expect(screen.getByText(/A senha deve ter no mínimo 8 caracteres/i)).toBeInTheDocument();

    // Fill 8+ char password missing uppercase and special char
    fireEvent.change(screen.getByLabelText(/Senha Segura/i), { target: { value: 'password123' } });
    fireEvent.click(submitBtn);
    expect(
      screen.getByText(/A senha deve conter pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial/i)
    ).toBeInTheDocument();

    // Fill minimum acceptable 8-char password and verify strength bar is at "Razoável (Mínimo aceito)" (~55%)
    fireEvent.change(screen.getByLabelText(/Senha Segura/i), { target: { value: 'Abcdef1@' } });
    expect(screen.getByText('Razoável (Mínimo aceito)')).toBeInTheDocument();

    // Fill high-entropy long password and verify strength bar reaches "Forte e Segura"
    fireEvent.change(screen.getByLabelText(/Senha Segura/i), { target: { value: 'Estudante#Enem2026!' } });
    expect(screen.getByText('Forte e Segura')).toBeInTheDocument();

    // Mismatched confirmation password
    fireEvent.change(screen.getByLabelText(/Confirmar Senha/i), { target: { value: 'Different@123' } });
    fireEvent.click(submitBtn);
    expect(screen.getByText(/As senhas informadas não coincidem/i)).toBeInTheDocument();
  });

  it('should switch between Register and Login modes', () => {
    renderWithProviders(<RegisterModal isOpen={true} onClose={handleClose} initialMode="register" />);

    expect(screen.getByText('Criar Conta de Estudante')).toBeInTheDocument();

    // Switch to Login mode
    fireEvent.click(screen.getByRole('button', { name: 'Já Possuo Conta' }));
    expect(screen.getByText('Acessar Minha Conta')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Entrar na Plataforma/i })).toBeInTheDocument();

    // Switch back to Register mode
    fireEvent.click(screen.getByRole('button', { name: 'Criar Conta Gratuita' }));
    expect(screen.getByText('Criar Conta de Estudante')).toBeInTheDocument();
  });

  it('should submit registration successfully and show success status', async () => {
    vi.spyOn(authService, 'register').mockResolvedValueOnce(MOCK_AUTH_LOGIN_RESPONSE);

    renderWithProviders(<RegisterModal isOpen={true} onClose={handleClose} initialMode="register" />);

    fireEvent.change(screen.getByLabelText(/Nome Completo ou Social/i), { target: { value: 'Lucas Silva' } });
    fireEvent.change(screen.getByLabelText(/E-mail do Estudante/i), { target: { value: 'lucas@escola.gov.br' } });
    fireEvent.change(screen.getByLabelText(/Senha Segura/i), { target: { value: 'Password@123' } });
    fireEvent.change(screen.getByLabelText(/Confirmar Senha/i), { target: { value: 'Password@123' } });
    fireEvent.change(screen.getByLabelText(/Tipo de Escola/i), { target: { value: 'PUBLIC_SCHOOL' } });
    fireEvent.change(screen.getByLabelText(/Curso \/ Meta no SISU/i), { target: { value: 'Medicina' } });

    const consentCheckbox = screen.getByRole('checkbox', {
      name: /Declaro que li e concordo com os Termos de Uso e a Política de Privacidade/i,
    });
    fireEvent.click(consentCheckbox);

    const submitBtn = screen.getByRole('button', { name: /Criar Minha Conta Gratuita/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Conta criada com sucesso! Migrando seus simulados anteriores/i)).toBeInTheDocument();
    });

    expect(authService.register).toHaveBeenCalledWith({
      fullName: 'Lucas Silva',
      email: 'lucas@escola.gov.br',
      password: 'Password@123',
      schoolType: 'PUBLIC_SCHOOL',
      targetDegree: 'Medicina',
    });
  });

  it('should toggle password visibility when clicking eye button', () => {
    renderWithProviders(<RegisterModal isOpen={true} onClose={handleClose} initialMode="register" />);

    const passwordInput = screen.getByLabelText(/Senha Segura/i);
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleBtn = screen.getByRole('button', { name: 'Exibir senha' });
    fireEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute('type', 'text');

    fireEvent.click(screen.getByRole('button', { name: 'Ocultar senha' }));
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should close when Escape key is pressed', () => {
    renderWithProviders(<RegisterModal isOpen={true} onClose={handleClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should validate and handle login flow successfully', async () => {
    vi.spyOn(authService, 'login').mockResolvedValueOnce(MOCK_AUTH_LOGIN_RESPONSE);

    renderWithProviders(<RegisterModal isOpen={true} onClose={handleClose} initialMode="login" />);

    const submitBtn = screen.getByRole('button', { name: /Entrar na Plataforma/i });

    // Submit with empty email
    fireEvent.click(submitBtn);
    expect(screen.getByText(/Informe um e-mail válido/i)).toBeInTheDocument();

    // Fill valid email but empty password
    fireEvent.change(screen.getByLabelText(/E-mail do Estudante/i), { target: { value: 'lucas@escola.gov.br' } });
    fireEvent.click(submitBtn);
    expect(screen.getByText(/Informe sua senha/i)).toBeInTheDocument();

    // Fill password and submit
    fireEvent.change(screen.getByLabelText(/^Senha/i), { target: { value: 'password123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Login realizado com sucesso! Carregando seu perfil/i)).toBeInTheDocument();
    });

    expect(authService.login).toHaveBeenCalledWith({
      email: 'lucas@escola.gov.br',
      password: 'password123',
    });
  });

  it('should display error message when login fails with API error', async () => {
    vi.spyOn(authService, 'login').mockRejectedValueOnce(new Error('Credenciais incorretas'));

    renderWithProviders(<RegisterModal isOpen={true} onClose={handleClose} initialMode="login" />);

    fireEvent.change(screen.getByLabelText(/E-mail do Estudante/i), { target: { value: 'lucas@escola.gov.br' } });
    fireEvent.change(screen.getByLabelText(/^Senha/i), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /Entrar na Plataforma/i }));

    await waitFor(() => {
      expect(screen.getByText('Credenciais incorretas')).toBeInTheDocument();
    });
  });

  it('should display error message when registration fails with API error', async () => {
    vi.spyOn(authService, 'register').mockRejectedValueOnce(new Error('Este e-mail já está cadastrado'));

    renderWithProviders(<RegisterModal isOpen={true} onClose={handleClose} initialMode="register" />);

    fireEvent.change(screen.getByLabelText(/Nome Completo ou Social/i), { target: { value: 'Beatriz Costa' } });
    fireEvent.change(screen.getByLabelText(/E-mail do Estudante/i), { target: { value: 'beatriz@escola.gov.br' } });
    fireEvent.change(screen.getByLabelText(/Senha Segura/i), { target: { value: 'Password@123' } });
    fireEvent.change(screen.getByLabelText(/Confirmar Senha/i), { target: { value: 'Password@123' } });

    const consentCheckbox = screen.getByRole('checkbox', {
      name: /Declaro que li e concordo com os Termos de Uso e a Política de Privacidade/i,
    });
    fireEvent.click(consentCheckbox);

    fireEvent.click(screen.getByRole('button', { name: /Criar Minha Conta Gratuita/i }));

    await waitFor(() => {
      expect(screen.getByText('Este e-mail já está cadastrado')).toBeInTheDocument();
    });
  });
});
