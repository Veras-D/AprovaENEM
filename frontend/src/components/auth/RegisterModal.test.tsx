import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RegisterModal } from './RegisterModal';
import { authService } from '@/api/services/auth.service';
import {
  MOCK_AUTH_LOGIN_RESPONSE,
  MOCK_FORGOT_PASSWORD_RESPONSE,
  MOCK_RESET_PASSWORD_RESPONSE,
  MOCK_VERIFY_EMAIL_RESPONSE,
  MOCK_RESEND_VERIFICATION_RESPONSE,
} from '@/api/mocks/mock-data';

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
      expect(screen.getByText(/Confirme seu E-mail/i)).toBeInTheDocument();
      expect(screen.getByText(/lucas@escola.gov.br/i)).toBeInTheDocument();
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

  it('should switch to forgot password mode when clicking Esqueci minha senha in login mode', () => {
    renderWithProviders(<RegisterModal isOpen={true} onClose={handleClose} initialMode="login" />);

    const forgotBtn = screen.getByRole('button', { name: /Esqueci minha senha/i });
    expect(forgotBtn).toBeInTheDocument();

    fireEvent.click(forgotBtn);

    expect(screen.getByText('Recuperar Minha Senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Voltar ao Login/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Enviar Instruções de Recuperação/i })).toBeInTheDocument();
  });

  it('should validate and dispatch forgot password request', async () => {
    vi.spyOn(authService, 'forgotPassword').mockResolvedValueOnce(MOCK_FORGOT_PASSWORD_RESPONSE);

    renderWithProviders(<RegisterModal isOpen={true} onClose={handleClose} initialMode="forgot-password" />);

    const submitBtn = screen.getByRole('button', { name: /Enviar Instruções de Recuperação/i });

    // Empty email
    fireEvent.click(submitBtn);
    expect(screen.getByText(/Informe um e-mail válido para recuperação/i)).toBeInTheDocument();

    // Fill valid email
    fireEvent.change(screen.getByLabelText(/E-mail do Estudante/i), { target: { value: 'aluno@escola.gov.br' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Instruções de recuperação enviadas com sucesso/i)).toBeInTheDocument();
    });

    expect(authService.forgotPassword).toHaveBeenCalledWith('aluno@escola.gov.br');
  });

  it('should advance to token input and reset password successfully after requesting recovery', async () => {
    vi.spyOn(authService, 'forgotPassword').mockResolvedValueOnce(MOCK_FORGOT_PASSWORD_RESPONSE);
    vi.spyOn(authService, 'resetPassword').mockResolvedValueOnce(MOCK_RESET_PASSWORD_RESPONSE);

    renderWithProviders(<RegisterModal isOpen={true} onClose={handleClose} initialMode="forgot-password" />);

    // Verify "Já possui um token de recuperação? Clique aqui" is NOT rendered
    expect(screen.queryByRole('button', { name: /Já possui um token de recuperação/i })).not.toBeInTheDocument();

    // Fill valid email and request instructions
    fireEvent.change(screen.getByLabelText(/E-mail do Estudante/i), { target: { value: 'aluno@escola.gov.br' } });
    fireEvent.click(screen.getByRole('button', { name: /Enviar Instruções de Recuperação/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/Token \/ Código de Recuperação/i)).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/^Nova Senha/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirmar Nova Senha/i)).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /Redefinir Minha Senha/i });

    // Fill token and mismatched passwords
    fireEvent.change(screen.getByLabelText(/Token \/ Código de Recuperação/i), { target: { value: 'token-abc-123' } });
    fireEvent.change(screen.getByLabelText(/^Nova Senha/i), { target: { value: 'StrongPass@2026' } });
    fireEvent.change(screen.getByLabelText(/Confirmar Nova Senha/i), { target: { value: 'DifferentPass@2026' } });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/As senhas não coincidem/i)).toBeInTheDocument();

    // Fix confirmation password
    fireEvent.change(screen.getByLabelText(/Confirmar Nova Senha/i), { target: { value: 'StrongPass@2026' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Senha redefinida com sucesso/i)).toBeInTheDocument();
    });

    expect(authService.resetPassword).toHaveBeenCalledWith({
      token: 'token-abc-123',
      newPassword: 'StrongPass@2026',
    });
  });

  it('allows going back to email request from token screen', async () => {
    vi.spyOn(authService, 'forgotPassword').mockResolvedValueOnce(MOCK_FORGOT_PASSWORD_RESPONSE);

    renderWithProviders(<RegisterModal isOpen={true} onClose={handleClose} initialMode="forgot-password" />);

    fireEvent.change(screen.getByLabelText(/E-mail do Estudante/i), { target: { value: 'aluno@escola.gov.br' } });
    fireEvent.click(screen.getByRole('button', { name: /Enviar Instruções de Recuperação/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Não recebeu o token\? Solicitar novo e-mail/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Não recebeu o token\? Solicitar novo e-mail/i }));

    expect(screen.getByLabelText(/E-mail do Estudante/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Enviar Instruções de Recuperação/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Já possui um token de recuperação/i })).not.toBeInTheDocument();
  });

  it('should return to login when clicking Voltar ao Login', () => {
    renderWithProviders(<RegisterModal isOpen={true} onClose={handleClose} initialMode="forgot-password" />);

    const backBtn = screen.getByRole('button', { name: /Voltar ao Login/i });
    fireEvent.click(backBtn);

    expect(screen.getByText('Acessar Minha Conta')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Entrar na Plataforma/i })).toBeInTheDocument();
  });

  it('should handle email verification with valid token in verify-email mode', async () => {
    vi.spyOn(authService, 'verifyEmail').mockResolvedValueOnce(MOCK_VERIFY_EMAIL_RESPONSE);

    renderWithProviders(
      <RegisterModal
        isOpen={true}
        onClose={handleClose}
        initialMode="verify-email"
        initialEmail="lucas@escola.gov.br"
      />
    );

    expect(screen.getByText('Confirme seu E-mail')).toBeInTheDocument();
    expect(screen.getByText('lucas@escola.gov.br')).toBeInTheDocument();

    const tokenInput = screen.getByLabelText(/Possui o código ou token de confirmação\?/i);
    fireEvent.change(tokenInput, { target: { value: 'tok-abc-xyz-456' } });

    const submitBtn = screen.getByRole('button', { name: /Confirmar E-mail/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/E-mail confirmado com sucesso!/i)).toBeInTheDocument();
    });

    expect(authService.verifyEmail).toHaveBeenCalledWith('tok-abc-xyz-456');
  });

  it('should handle resending verification email in verify-email mode', async () => {
    vi.spyOn(authService, 'resendVerification').mockResolvedValueOnce(MOCK_RESEND_VERIFICATION_RESPONSE);

    renderWithProviders(
      <RegisterModal
        isOpen={true}
        onClose={handleClose}
        initialMode="verify-email"
        initialEmail="lucas@escola.gov.br"
      />
    );

    const resendBtn = screen.getByRole('button', { name: /Reenviar E-mail/i });
    fireEvent.click(resendBtn);

    await waitFor(() => {
      expect(screen.getByText(/Um novo link de confirmação foi enviado/i)).toBeInTheDocument();
    });

    expect(authService.resendVerification).toHaveBeenCalledWith('lucas@escola.gov.br');
  });

  it('should clean all input fields when modal is closed and reopened', () => {
    const { rerender } = renderWithProviders(
      <RegisterModal isOpen={true} onClose={handleClose} initialMode="login" />
    );

    const emailInput = screen.getByLabelText(/E-mail do Estudante/i);
    const passwordInput = screen.getByLabelText(/^Senha/i);

    fireEvent.change(emailInput, { target: { value: 'student@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'SecretPass123!' } });

    expect(emailInput).toHaveValue('student@example.com');
    expect(passwordInput).toHaveValue('SecretPass123!');

    // Close the modal
    rerender(
      <QueryClientProvider client={queryClient}>
        <RegisterModal isOpen={false} onClose={handleClose} initialMode="login" />
      </QueryClientProvider>
    );

    // Reopen the modal
    rerender(
      <QueryClientProvider client={queryClient}>
        <RegisterModal isOpen={true} onClose={handleClose} initialMode="login" />
      </QueryClientProvider>
    );

    const reopenedEmail = screen.getByLabelText(/E-mail do Estudante/i);
    const reopenedPassword = screen.getByLabelText(/^Senha/i);

    expect(reopenedEmail).toHaveValue('');
    expect(reopenedPassword).toHaveValue('');
  });

  it('should clean password fields when switching between modes', () => {
    renderWithProviders(<RegisterModal isOpen={true} onClose={handleClose} initialMode="register" />);

    const regPassword = screen.getByLabelText(/Senha Segura/i);
    const regConfirm = screen.getByLabelText(/Confirmar Senha/i);

    fireEvent.change(regPassword, { target: { value: 'Password@123' } });
    fireEvent.change(regConfirm, { target: { value: 'Password@123' } });

    // Switch to login
    fireEvent.click(screen.getByRole('button', { name: 'Já Possuo Conta' }));

    const loginPassword = screen.getByLabelText(/^Senha/i);
    expect(loginPassword).toHaveValue('');
  });
});
