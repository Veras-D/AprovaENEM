import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ShieldCheck,
  UserPlus,
  LogIn,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  KeyRound,
  ArrowLeft,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { TermsAndPrivacyModal } from '@/components/legal/TermsAndPrivacyModal';
import {
  useLoginMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
} from '@/api/hooks';
import { useAuthStore } from '@/stores/useAuthStore';
import type { ApiError } from '@/api/client';

const SCHOOL_TYPE_OPTIONS = [
  { value: 'PUBLIC_SCHOOL', label: 'Escola Pública' },
  { value: 'PRIVATE_SCHOLARSHIP', label: 'Bolsista em Particular' },
  { value: 'PRIVATE_REGULAR', label: 'Escola Particular' },
] as const;

export interface RegisterModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly initialMode?: 'register' | 'login' | 'forgot-password' | 'verify-email';
  readonly initialEmail?: string;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'register',
  initialEmail = '',
}) => {
  const [mode, setMode] = useState<'register' | 'login' | 'forgot-password' | 'verify-email'>(initialMode);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);

  // Form Fields
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [schoolType, setSchoolType] = useState<'PUBLIC_SCHOOL' | 'PRIVATE_SCHOLARSHIP' | 'PRIVATE_REGULAR'>('PUBLIC_SCHOOL');
  const [targetDegree, setTargetDegree] = useState<string>('');

  // Password Recovery Fields
  const [resetToken, setResetToken] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');
  const [hasResetToken, setHasResetToken] = useState<boolean>(false);
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState<string | null>(null);

  // Email Verification Fields
  const [verifyEmailTarget, setVerifyEmailTarget] = useState<string>(initialEmail);
  const [verifyTokenInput, setVerifyTokenInput] = useState<string>('');
  const [verifySuccessMessage, setVerifySuccessMessage] = useState<string | null>(null);
  const [resendSuccessMessage, setResendSuccessMessage] = useState<string | null>(null);

  // Mandatory LGPD Consent & Optional Notifications
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState<boolean>(false);
  const [wantsEmailAlerts, setWantsEmailAlerts] = useState<boolean>(true);

  // Validation & Error Handling
  const [formError, setFormError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Terms and Privacy modal child controller
  const [isLegalModalOpen, setIsLegalModalOpen] = useState<boolean>(false);
  const [legalModalTab, setLegalModalTab] = useState<'terms' | 'privacy'>('terms');

  const modalRef = useRef<HTMLDivElement>(null);
  const contentInnerRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);
  const [shouldRender, setShouldRender] = useState<boolean>(isOpen);
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [bodyHeight, setBodyHeight] = useState<number | undefined>(undefined);
  const [hasSwitchedMode, setHasSwitchedMode] = useState<boolean>(false);

  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const forgotPasswordMutation = useForgotPasswordMutation();
  const resetPasswordMutation = useResetPasswordMutation();
  const verifyEmailMutation = useVerifyEmailMutation();
  const resendVerificationMutation = useResendVerificationMutation();
  const setEmailVerified = useAuthStore((s) => s.setEmailVerified);
  const authUser = useAuthStore((s) => s.user);

  const handleSwitchMode = (nextMode: 'register' | 'login' | 'forgot-password' | 'verify-email') => {
    if (nextMode === mode) return;
    if (contentInnerRef.current && contentInnerRef.current.offsetHeight > 0) {
      setBodyHeight(contentInnerRef.current.offsetHeight);
    }
    setHasSwitchedMode(true);
    setMode(nextMode);
    setFormError(null);
    setForgotSuccessMessage(null);
    setVerifySuccessMessage(null);
    setResendSuccessMessage(null);
  };

  // Smooth FLIP height interpolation when switching between Register and Login tabs
  useEffect(() => {
    if (!shouldRender || !hasSwitchedMode || !contentInnerRef.current) return undefined;
    const el = contentInnerRef.current;

    let raf2 = 0;
    const raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => {
        if (el.offsetHeight > 0) {
          setBodyHeight(el.offsetHeight);
        }
      });
    });

    const settleTimer = window.setTimeout(() => {
      setBodyHeight(undefined);
    }, 520);

    return () => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
      window.clearTimeout(settleTimer);
    };
  }, [shouldRender, hasSwitchedMode, mode, formError, isSuccess]);

  const hasMinLength = password.length >= 8;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

  const criteriaScore =
    (hasMinLength ? 1 : 0) +
    (hasLowercase ? 1 : 0) +
    (hasUppercase ? 1 : 0) +
    (hasNumber ? 1 : 0) +
    (hasSpecialChar ? 1 : 0);

  const isPasswordStrongEnough =
    hasMinLength && hasLowercase && hasUppercase && hasNumber && hasSpecialChar;

  const lengthTo8 = Math.min(8, password.length) / 8;
  const extraLength = Math.min(8, Math.max(0, password.length - 8)) / 8;
  const uniqueRatio = Math.min(1, new Set(password).size / 12);
  const extraUpper = (password.match(/[A-Z]/g)?.length ?? 0) >= 2 ? 1 : 0;
  const extraNumber = (password.match(/\d/g)?.length ?? 0) >= 2 ? 1 : 0;
  const extraSpecial = (password.match(/[^A-Za-z0-9]/g)?.length ?? 0) >= 2 ? 1 : 0;

  const fillPercent = (() => {
    if (password.length === 0) return 0;
    if (!isPasswordStrongEnough) {
      return Math.round(
        lengthTo8 * 14 +
          extraLength * 6 +
          (hasLowercase ? 6.5 : 0) +
          (hasUppercase ? 6.5 : 0) +
          (hasNumber ? 6.5 : 0) +
          (hasSpecialChar ? 6.5 : 0)
      );
    }
    return Math.min(
      100,
      Math.round(
        50 +
          extraLength * 32 +
          uniqueRatio * 8 +
          extraUpper * 3 +
          extraNumber * 3 +
          extraSpecial * 4
      )
    );
  })();

  const strengthConfig = (() => {
    if (password.length === 0) {
      return {
        label: 'Digite sua senha',
        colorClass: 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.25)]',
        textClass: 'text-slate-500 dark:text-slate-400',
      };
    }
    if (!isPasswordStrongEnough) {
      if (criteriaScore <= 2) {
        return {
          label: 'Muito Fraca',
          colorClass: 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.35)]',
          textClass: 'text-rose-600 dark:text-rose-400',
        };
      }
      return {
        label: criteriaScore === 4 ? 'Incompleta (falta 1 requisito)' : 'Fraca (faltam requisitos)',
        colorClass: 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.35)]',
        textClass: 'text-amber-600 dark:text-amber-400',
      };
    }
    if (fillPercent < 66) {
      return {
        label: 'Razoável (Mínimo aceito)',
        colorClass: 'bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.35)]',
        textClass: 'text-sky-600 dark:text-sky-400',
      };
    }
    if (fillPercent < 86) {
      return {
        label: 'Boa',
        colorClass: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.35)]',
        textClass: 'text-emerald-600 dark:text-emerald-400',
      };
    }
    return {
      label: 'Forte e Segura',
      colorClass: 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.45)]',
      textClass: 'text-emerald-600 dark:text-emerald-400',
    };
  })();

  // Reset form when opening or changing mode
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
      setHasSwitchedMode(false);
      setBodyHeight(undefined);
      setMode(initialMode);
      setShowPassword(false);
      setShowConfirmPassword(false);
      setConfirmPassword('');
      setFormError(null);
      setIsSuccess(false);
      setForgotSuccessMessage(null);
      setVerifySuccessMessage(null);
      setResendSuccessMessage(null);
      setVerifyTokenInput('');
      if (initialEmail) {
        setVerifyEmailTarget(initialEmail);
      } else if (authUser?.email) {
        setVerifyEmailTarget(authUser.email);
      }
      return undefined;
    }
    if (shouldRender) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 150);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOpen, initialMode, initialEmail, authUser?.email, shouldRender]);

  // Focus trap & Escape listener
  useEffect(() => {
    if (!isOpen || isLegalModalOpen) return;

    previouslyFocusedElement.current = document.activeElement as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        if (!modalRef.current) return;
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    const timer = setTimeout(() => {
      const firstInput = modalRef.current?.querySelector<HTMLElement>('input, button[data-autofocus="true"]');
      firstInput?.focus();
    }, 50);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      clearTimeout(timer);
      previouslyFocusedElement.current?.focus();
    };
  }, [isOpen, isLegalModalOpen, onClose]);

  const openLegalModal = (tab: 'terms' | 'privacy') => {
    setLegalModalTab(tab);
    setIsLegalModalOpen(true);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (fullName.trim().length < 3) {
      setFormError('Por favor, informe seu nome completo (mínimo de 3 caracteres).');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setFormError('Por favor, informe um endereço de e-mail válido.');
      return;
    }

    if (password.length < 8) {
      setFormError('A senha deve ter no mínimo 8 caracteres.');
      return;
    }

    if (!isPasswordStrongEnough) {
      setFormError(
        'A senha deve conter pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setFormError('As senhas informadas não coincidem. Verifique a confirmação de senha.');
      return;
    }

    if (!hasAcceptedTerms) {
      setFormError('Você deve aceitar os Termos de Uso e a Política de Privacidade (LGPD) para prosseguir.');
      return;
    }

    try {
      const registeredEmail = email.trim().toLowerCase();
      await registerMutation.mutateAsync({
        fullName: fullName.trim(),
        email: registeredEmail,
        password,
        schoolType,
        targetDegree: targetDegree.trim() || undefined,
      });

      setVerifyEmailTarget(registeredEmail);
      if (contentInnerRef.current && contentInnerRef.current.offsetHeight > 0) {
        setBodyHeight(contentInnerRef.current.offsetHeight);
      }
      setHasSwitchedMode(true);
      setMode('verify-email');
      setFormError(null);
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      const apiError = err as ApiError;
      setFormError(
        apiError.message || 'Falha ao realizar cadastro. Verifique os dados ou tente novamente.'
      );
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email.includes('@')) {
      setFormError('Informe um e-mail válido.');
      return;
    }

    if (!password) {
      setFormError('Informe sua senha.');
      return;
    }

    try {
      await loginMutation.mutateAsync({
        email: email.trim().toLowerCase(),
        password,
      });

      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      const apiError = err as ApiError;
      setFormError(
        apiError.message || 'Credenciais inválidas. Verifique seu e-mail e senha.'
      );
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setForgotSuccessMessage(null);

    if (!email || !email.includes('@')) {
      setFormError('Informe um e-mail válido para recuperação.');
      return;
    }

    try {
      const res = await forgotPasswordMutation.mutateAsync(email.trim().toLowerCase());
      setForgotSuccessMessage(
        res.message ||
          'Instruções de recuperação enviadas com sucesso! Verifique sua caixa de entrada e pasta de spam.'
      );
    } catch (err) {
      const apiError = err as ApiError;
      setFormError(
        apiError.message ||
          'Não foi possível enviar as instruções no momento. Tente novamente mais tarde.'
      );
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!resetToken.trim()) {
      setFormError('Informe o token de recuperação recebido.');
      return;
    }

    if (newPassword.length < 8) {
      setFormError('A nova senha deve conter no mínimo 8 caracteres.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setFormError('As senhas não coincidem. Digite a mesma senha nos dois campos.');
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({
        token: resetToken.trim(),
        newPassword,
      });

      setForgotSuccessMessage('Senha redefinida com sucesso! Você já pode entrar com sua nova senha.');
      setTimeout(() => {
        handleSwitchMode('login');
        setForgotSuccessMessage(null);
        setResetToken('');
        setNewPassword('');
        setConfirmNewPassword('');
        setHasResetToken(false);
      }, 1800);
    } catch (err) {
      const apiError = err as ApiError;
      setFormError(
        apiError.message ||
          'Token de recuperação inválido ou expirado. Solicite um novo link de redefinição.'
      );
    }
  };

  const handleVerifyEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setVerifySuccessMessage(null);
    setResendSuccessMessage(null);

    const token = verifyTokenInput.trim();
    if (!token) {
      setFormError('Informe o token de verificação recebido por e-mail.');
      return;
    }

    try {
      const res = await verifyEmailMutation.mutateAsync(token);
      setEmailVerified(true);
      setVerifySuccessMessage(res.message || 'E-mail confirmado com sucesso!');
      setVerifyTokenInput('');
    } catch (err) {
      const apiError = err as ApiError;
      setFormError(
        apiError.message || 'Token de verificação inválido ou expirado (validade de 24h).'
      );
    }
  };

  const handleResendVerification = async () => {
    const target = verifyEmailTarget || email || authUser?.email;
    if (!target) {
      setFormError('Informe um e-mail válido para reenviar a confirmação.');
      return;
    }

    setFormError(null);
    setVerifySuccessMessage(null);
    setResendSuccessMessage(null);

    try {
      const res = await resendVerificationMutation.mutateAsync(target);
      setResendSuccessMessage(
        res.message || `Novo link de confirmação enviado para ${target}.`
      );
    } catch (err) {
      const apiError = err as ApiError;
      setFormError(
        apiError.message || 'Não foi possível reenviar o e-mail de confirmação.'
      );
    }
  };

  if (!shouldRender) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 m-0"
        role="dialog"
        aria-modal="true"
        aria-hidden={isClosing || undefined}
        aria-labelledby="auth-modal-title"
      >
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm ${
            isClosing
              ? 'animate-out fade-out duration-150'
              : 'animate-in fade-in duration-200'
          }`}
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal Dialog Card */}
        <div
          ref={modalRef}
          className={`relative w-full max-w-lg max-h-[92vh] bg-white dark:bg-slate-900 rounded-brand shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col z-10 overflow-hidden ${
            isClosing
              ? 'animate-out fade-out zoom-out-95 duration-150'
              : 'animate-in fade-in zoom-in-95 duration-200'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <div key={mode} className="flex items-center gap-2.5 animate-in fade-in duration-200">
              <div className="p-2 rounded-brand bg-brand-primary/10 text-brand-primary">
                {mode === 'register' ? (
                  <UserPlus className="h-5 w-5" aria-hidden="true" />
                ) : mode === 'forgot-password' ? (
                  <KeyRound className="h-5 w-5" aria-hidden="true" />
                ) : mode === 'verify-email' ? (
                  <Mail className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <LogIn className="h-5 w-5" aria-hidden="true" />
                )}
              </div>
              <div>
                <h2
                  id="auth-modal-title"
                  className="text-base sm:text-lg font-bold text-slate-900 dark:text-white"
                >
                  {mode === 'register'
                    ? 'Criar Conta de Estudante'
                    : mode === 'forgot-password'
                    ? 'Recuperar Minha Senha'
                    : mode === 'verify-email'
                    ? 'Confirmação de E-mail'
                    : 'Acessar Minha Conta'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {mode === 'register'
                    ? 'Salve seu progresso e conecte sua pontuação TRI'
                    : mode === 'forgot-password'
                    ? 'Redefina o acesso à sua conta de estudante'
                    : mode === 'verify-email'
                    ? 'Valide seu endereço de e-mail para ativar sua conta'
                    : 'Acesse seus simulados salvos e sua ofensiva de estudos'}
                </p>
              </div>
            </div>

            <button
              type="button"
              data-autofocus="true"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
              aria-label="Fechar janela de autenticação"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Mode Switch Tabs with Sliding Active Pill or Subheaders */}
          {mode === 'forgot-password' ? (
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-4 py-2.5 shrink-0">
              <button
                type="button"
                onClick={() => handleSwitchMode('login')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:underline cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Voltar ao Login</span>
              </button>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Recuperação de Acesso
              </span>
            </div>
          ) : mode === 'verify-email' ? (
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-4 py-2.5 shrink-0">
              <button
                type="button"
                onClick={() => handleSwitchMode('login')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:underline cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Voltar ao Login</span>
              </button>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Ativação de Conta
              </span>
            </div>
          ) : (
            <div className="relative grid grid-cols-2 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/60 p-1.5 shrink-0">
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-0.375rem)] rounded-brand bg-white dark:bg-slate-800 shadow-sm border border-brand-primary/30 dark:border-brand-primary/40 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  mode === 'login' ? 'translate-x-full' : 'translate-x-0'
                }`}
              />
              <button
                type="button"
                onClick={() => handleSwitchMode('register')}
                className={`relative z-10 py-2.5 px-3 text-xs sm:text-sm font-bold rounded-brand transition-colors duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                  mode === 'register'
                    ? 'text-brand-primary'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <UserPlus className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Criar Conta Gratuita</span>
              </button>
              <button
                type="button"
                onClick={() => handleSwitchMode('login')}
                className={`relative z-10 py-2.5 px-3 text-xs sm:text-sm font-bold rounded-brand transition-colors duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                  mode === 'login'
                    ? 'text-brand-primary'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LogIn className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Já Possuo Conta</span>
              </button>
            </div>
          )}

          {/* Body Content with smooth non-flex height transition */}
          <div className="overflow-y-auto overflow-x-hidden scrollbar-none min-h-0">
            <div
              style={bodyHeight !== undefined ? { height: `${bodyHeight}px` } : undefined}
              className="transition-[height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden"
            >
              <div ref={contentInnerRef} className="p-4 sm:p-6 space-y-5">
            {/* Success State Alert */}
            {isSuccess && (
              <div
                role="status"
                aria-live="polite"
                className="p-4 rounded-brand bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/40 text-emerald-900 dark:text-emerald-100 flex items-center gap-3 animate-in fade-in"
              >
                <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" aria-hidden="true" />
                <div className="text-xs sm:text-sm font-medium">
                  {mode === 'register'
                    ? 'Conta criada com sucesso! Migrando seus simulados anteriores...'
                    : 'Login realizado com sucesso! Carregando seu perfil...'}
                </div>
              </div>
            )}

            {/* Error State Alert */}
            {formError && !isSuccess && (
              <div
                role="alert"
                className="p-3.5 rounded-brand bg-rose-50 dark:bg-rose-950/40 border border-rose-500/30 text-rose-900 dark:text-rose-200 flex items-start gap-2.5 text-xs sm:text-sm animate-in fade-in"
              >
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{formError}</span>
              </div>
            )}

            {/* REGISTER MODE FORM */}
            {mode === 'register' && !isSuccess && (
              <form
                action="/api/v1/auth/register"
                method="post"
                onSubmit={handleRegisterSubmit}
                className={`space-y-4 ${hasSwitchedMode ? 'animate-tab-from-left' : ''}`}
                noValidate
              >
                {/* Data Minimization Disclosure Callout */}
                <div className="p-3.5 rounded-brand bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-500/20 text-slate-800 dark:text-slate-200 flex items-start gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="text-xs leading-relaxed">
                    <strong className="text-emerald-800 dark:text-emerald-300">
                      Privacidade Garantida (LGPD Art. 6º, III):
                    </strong>{' '}
                    Não exigimos CPF, RG ou telefone. Seus dados acadêmicos nunca serão comercializados para cursinhos ou redes de anúncios.
                  </div>
                </div>

                {/* Full Name */}
                <div className="space-y-1">
                  <label
                    htmlFor="reg-fullname"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Nome Completo ou Social <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="reg-fullname"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: Beatriz Silva"
                    className="w-full px-3.5 py-2.5 text-sm rounded-brand border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label
                    htmlFor="reg-email"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    E-mail do Estudante <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="reg-email"
                    name="username"
                    type="email"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@escola.gov.br"
                    className="w-full px-3.5 py-2.5 text-sm rounded-brand border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                {/* Password & Confirm Password */}
                <div className="space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label
                        htmlFor="reg-password"
                        className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                      >
                        Senha Segura (mín. 8) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="reg-password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          required
                          minLength={8}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-3.5 py-2.5 text-sm rounded-brand border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <Eye className="h-4 w-4" aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label
                        htmlFor="reg-confirm-password"
                        className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                      >
                        Confirmar Senha <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="reg-confirm-password"
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          required
                          minLength={8}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-3.5 py-2.5 text-sm rounded-brand border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          aria-label={showConfirmPassword ? 'Ocultar confirmação de senha' : 'Exibir confirmação de senha'}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <Eye className="h-4 w-4" aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Password Strength Meter Bar */}
                  <div
                    className="space-y-1.5 pt-0.5"
                    aria-live="polite"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">
                        Força da senha:
                      </span>
                      <span
                        className={`font-bold transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${strengthConfig.textClass}`}
                      >
                        {strengthConfig.label}
                      </span>
                    </div>

                    {/* Fluid Continuous Progress Bar */}
                    <div
                      className="relative h-2 w-full rounded-full bg-slate-200/85 dark:bg-slate-800 overflow-hidden"
                      role="progressbar"
                      aria-label="Indicador de força da senha"
                      aria-valuenow={fillPercent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        style={{ width: `${fillPercent}%` }}
                        className={`relative h-full rounded-full transition-[width,background-color,box-shadow,opacity] duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] after:absolute after:inset-0 after:rounded-full after:bg-gradient-to-b after:from-white/25 after:to-transparent ${
                          strengthConfig.colorClass
                        } ${fillPercent > 0 ? 'opacity-100' : 'opacity-0'}`}
                      />
                    </div>
                  </div>
                </div>

                {/* School Type & Target Degree */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Select<'PUBLIC_SCHOOL' | 'PRIVATE_SCHOLARSHIP' | 'PRIVATE_REGULAR'>
                    id="reg-school-type"
                    label="Tipo de Escola"
                    value={schoolType}
                    onChange={(val) => setSchoolType(val)}
                    options={SCHOOL_TYPE_OPTIONS}
                  />

                  <div className="space-y-1">
                    <label
                      htmlFor="reg-target-degree"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Curso / Meta no SISU
                    </label>
                    <input
                      id="reg-target-degree"
                      type="text"
                      value={targetDegree}
                      onChange={(e) => setTargetDegree(e.target.value)}
                      placeholder="Ex: Medicina, Direito..."
                      className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-brand border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                  </div>
                </div>

                {/* LGPD Explicit Consent Opt-in Checkbox (MANDATORY) */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <input
                      id="reg-consent-terms"
                      type="checkbox"
                      required
                      aria-required="true"
                      checked={hasAcceptedTerms}
                      onChange={(e) => setHasAcceptedTerms(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary shrink-0 cursor-pointer"
                    />
                    <label
                      htmlFor="reg-consent-terms"
                      className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed cursor-pointer"
                    >
                      Declaro que li e concordo com os{' '}
                      <button
                        type="button"
                        onClick={() => openLegalModal('terms')}
                        className="font-bold text-brand-primary underline hover:opacity-80 inline focus:outline-none focus:ring-1 focus:ring-brand-primary rounded"
                      >
                        Termos de Uso
                      </button>{' '}
                      e a{' '}
                      <button
                        type="button"
                        onClick={() => openLegalModal('privacy')}
                        className="font-bold text-brand-primary underline hover:opacity-80 inline focus:outline-none focus:ring-1 focus:ring-brand-primary rounded"
                      >
                        Política de Privacidade (LGPD)
                      </button>
                      . Estou ciente dos meus direitos de portabilidade e eliminação sob o Art. 18.{' '}
                      <span className="text-rose-500 font-bold">*</span>
                    </label>
                  </div>

                  {/* Optional Notifications Checkbox */}
                  <div className="flex items-start gap-2.5">
                    <input
                      id="reg-consent-alerts"
                      type="checkbox"
                      checked={wantsEmailAlerts}
                      onChange={(e) => setWantsEmailAlerts(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary shrink-0 cursor-pointer"
                    />
                    <label
                      htmlFor="reg-consent-alerts"
                      className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed cursor-pointer"
                    >
                      Desejo receber lembretes de estudo, avisos de ofensiva (streak) e simulados ENEM por e-mail (opcional).
                    </label>
                  </div>
                </div>

                {/* Submit Action Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="w-full"
                    disabled={!hasAcceptedTerms || registerMutation.isPending}
                    isLoading={registerMutation.isPending}
                  >
                    <Sparkles className="h-4 w-4 mr-2" aria-hidden="true" />
                    Criar Minha Conta Gratuita
                  </Button>
                </div>
              </form>
            )}

            {/* LOGIN MODE FORM */}
            {mode === 'login' && !isSuccess && (
              <form
                onSubmit={handleLoginSubmit}
                className={`space-y-4 ${hasSwitchedMode ? 'animate-tab-from-right' : ''}`}
                noValidate
              >
                {/* Email */}
                <div className="space-y-1">
                  <label
                    htmlFor="login-email"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    E-mail do Estudante <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="login-email"
                    name="username"
                    type="email"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@escola.gov.br"
                    className="w-full px-3.5 py-2.5 text-sm rounded-brand border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="login-password"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Senha <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleSwitchMode('forgot-password')}
                      className="text-xs font-semibold text-brand-primary hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary rounded cursor-pointer"
                    >
                      Esqueci minha senha
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="login-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 text-sm rounded-brand border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Action Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="w-full"
                    disabled={loginMutation.isPending}
                    isLoading={loginMutation.isPending}
                  >
                    <LogIn className="h-4 w-4 mr-2" aria-hidden="true" />
                    Entrar na Plataforma
                  </Button>
                </div>
              </form>
            )}

            {/* FORGOT PASSWORD MODE FORM */}
            {mode === 'forgot-password' && !isSuccess && (
              <div className={`space-y-4 ${hasSwitchedMode ? 'animate-tab-from-right' : ''}`}>
                {/* Information Callout */}
                <div className="p-3.5 rounded-brand bg-blue-50/70 dark:bg-blue-950/30 border border-blue-500/20 text-slate-800 dark:text-slate-200 flex items-start gap-2.5">
                  <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="text-xs leading-relaxed">
                    <strong className="text-blue-800 dark:text-blue-300">
                      Recuperação de Acesso:
                    </strong>{' '}
                    {hasResetToken
                      ? 'Informe o token recebido por e-mail e escolha uma nova senha com no mínimo 8 caracteres.'
                      : 'Informe seu e-mail cadastrado para enviarmos um token e instruções de redefinição de senha.'}
                  </div>
                </div>

                {/* Success alert message for forgot password */}
                {forgotSuccessMessage && (
                  <div
                    role="status"
                    aria-live="polite"
                    className="p-3.5 rounded-brand bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/40 text-emerald-900 dark:text-emerald-100 flex items-start gap-2.5 text-xs sm:text-sm animate-in fade-in"
                  >
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                    <div className="space-y-1">
                      <p className="font-semibold">{forgotSuccessMessage}</p>
                      {!hasResetToken && (
                        <button
                          type="button"
                          onClick={() => {
                            setHasResetToken(true);
                            setForgotSuccessMessage(null);
                          }}
                          className="font-bold text-emerald-700 dark:text-emerald-300 underline hover:opacity-80 block text-xs cursor-pointer"
                        >
                          Inserir token recebido e redefinir agora &rarr;
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Toggle Token / Email Request */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setHasResetToken(!hasResetToken);
                      setFormError(null);
                      setForgotSuccessMessage(null);
                    }}
                    className="text-brand-primary font-semibold hover:underline cursor-pointer"
                  >
                    {hasResetToken
                      ? '← Não recebeu o token? Solicitar novo e-mail'
                      : 'Já possui um token de recuperação? Clique aqui'}
                  </button>
                </div>

                {!hasResetToken ? (
                  <form onSubmit={handleForgotPasswordSubmit} className="space-y-4" noValidate>
                    <div className="space-y-1">
                      <label
                        htmlFor="forgot-email"
                        className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                      >
                        E-mail do Estudante <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="forgot-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu.email@escola.gov.br"
                        className="w-full px-3.5 py-2.5 text-sm rounded-brand border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      />
                    </div>

                    <div className="pt-2">
                      <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        className="w-full"
                        disabled={forgotPasswordMutation.isPending}
                        isLoading={forgotPasswordMutation.isPending}
                      >
                        <Mail className="h-4 w-4 mr-2" aria-hidden="true" />
                        Enviar Instruções de Recuperação
                      </Button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleResetPasswordSubmit} className="space-y-4" noValidate>
                    {/* Token */}
                    <div className="space-y-1">
                      <label
                        htmlFor="reset-token"
                        className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                      >
                        Token / Código de Recuperação <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="reset-token"
                        name="token"
                        type="text"
                        required
                        value={resetToken}
                        onChange={(e) => setResetToken(e.target.value)}
                        placeholder="Ex: a1b2c3d4e5f6..."
                        className="w-full px-3.5 py-2.5 text-sm rounded-brand border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary font-mono"
                      />
                    </div>

                    {/* New Password */}
                    <div className="space-y-1">
                      <label
                        htmlFor="reset-new-password"
                        className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                      >
                        Nova Senha <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="reset-new-password"
                          name="new-password"
                          type={showNewPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Mínimo 8 caracteres"
                          className="w-full px-3.5 py-2.5 text-sm rounded-brand border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          aria-label={showNewPassword ? 'Ocultar nova senha' : 'Exibir nova senha'}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <Eye className="h-4 w-4" aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm New Password */}
                    <div className="space-y-1">
                      <label
                        htmlFor="reset-confirm-password"
                        className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                      >
                        Confirmar Nova Senha <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="reset-confirm-password"
                        name="confirm-password"
                        type={showNewPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Repita a nova senha"
                        className="w-full px-3.5 py-2.5 text-sm rounded-brand border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      />
                    </div>

                    <div className="pt-2">
                      <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        className="w-full"
                        disabled={resetPasswordMutation.isPending}
                        isLoading={resetPasswordMutation.isPending}
                      >
                        <KeyRound className="h-4 w-4 mr-2" aria-hidden="true" />
                        Redefinir Minha Senha
                      </Button>
                    </div>
                  </form>
                )}

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('login')}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-brand-primary dark:hover:text-brand-primary font-semibold cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Lembrou da senha? Entrar agora</span>
                  </button>
                </div>
              </div>
            )}

            {mode === 'verify-email' && (
              <div className="space-y-4">
                <div className="text-center p-4 rounded-brand bg-brand-primary/5 dark:bg-brand-primary/10 border border-brand-primary/20 space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-brand-primary/10 dark:bg-brand-primary/20 flex items-center justify-center text-brand-primary dark:text-brand-accent">
                    <Mail className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Confirme seu E-mail
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Enviamos um link de confirmação para{' '}
                    <span className="font-semibold text-slate-900 dark:text-white break-all">
                      {verifyEmailTarget || email || 'seu endereço de e-mail'}
                    </span>
                    .
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Verifique sua caixa de entrada e pasta de spam para validar sua conta do AprovaENEM.
                  </p>
                </div>

                {verifySuccessMessage && (
                  <div
                    role="status"
                    aria-live="polite"
                    className="p-3.5 rounded-brand bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/40 text-emerald-900 dark:text-emerald-100 flex items-center gap-2.5 text-xs font-medium"
                  >
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" aria-hidden="true" />
                    <span>{verifySuccessMessage}</span>
                  </div>
                )}

                {resendSuccessMessage && (
                  <div
                    role="status"
                    aria-live="polite"
                    className="p-3.5 rounded-brand bg-sky-50 dark:bg-sky-950/40 border border-sky-500/40 text-sky-900 dark:text-sky-100 flex items-center gap-2.5 text-xs font-medium"
                  >
                    <Mail className="h-5 w-5 text-sky-600 shrink-0" aria-hidden="true" />
                    <span>{resendSuccessMessage}</span>
                  </div>
                )}

                {/* Token Validation Form */}
                <form onSubmit={handleVerifyEmailSubmit} className="space-y-3" noValidate>
                  <div className="space-y-1">
                    <label
                      htmlFor="verify-token-input"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Possui o código ou token de confirmação?
                    </label>
                    <input
                      id="verify-token-input"
                      name="verifyToken"
                      type="text"
                      value={verifyTokenInput}
                      onChange={(e) => setVerifyTokenInput(e.target.value)}
                      placeholder="Cole aqui o token recebido no e-mail"
                      className="w-full px-3.5 py-2.5 text-sm rounded-brand border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary font-mono text-xs"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="w-full"
                    disabled={verifyEmailMutation.isPending || !verifyTokenInput.trim()}
                    isLoading={verifyEmailMutation.isPending}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" aria-hidden="true" />
                    Confirmar E-mail
                  </Button>
                </form>

                {/* Resend Verification Action & Continue */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Não recebeu a mensagem?</span>
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resendVerificationMutation.isPending}
                      className="text-brand-primary hover:underline font-semibold cursor-pointer disabled:opacity-50"
                    >
                      {resendVerificationMutation.isPending ? 'Reenviando...' : 'Reenviar E-mail'}
                    </button>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    className="w-full"
                    onClick={onClose}
                  >
                    Continuar para a Plataforma
                  </Button>
                </div>
              </div>
            )}
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="p-3.5 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 shrink-0">
            <div className="flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4 text-brand-primary" aria-hidden="true" />
              <span>AprovaENEM &bull; 100% Gratuito</span>
            </div>
            <button
              type="button"
              onClick={() => openLegalModal('privacy')}
              className="text-slate-500 hover:text-brand-primary dark:hover:text-brand-primary underline"
            >
              LGPD Art. 18
            </button>
          </div>
        </div>
      </div>

      {/* Child Modal: Full Terms of Use & LGPD Policy View */}
      <TermsAndPrivacyModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        initialTab={legalModalTab}
      />
    </>
  );
};
