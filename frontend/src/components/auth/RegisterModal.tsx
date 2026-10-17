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
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { TermsAndPrivacyModal } from '@/components/legal/TermsAndPrivacyModal';
import { useLoginMutation, useRegisterMutation } from '@/api/hooks';
import type { ApiError } from '@/api/client';

const SCHOOL_TYPE_OPTIONS = [
  { value: 'PUBLIC_SCHOOL', label: 'Escola Pública' },
  { value: 'PRIVATE_SCHOLARSHIP', label: 'Bolsista em Particular' },
  { value: 'PRIVATE_REGULAR', label: 'Escola Particular' },
] as const;

export interface RegisterModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly initialMode?: 'register' | 'login';
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'register',
}) => {
  const [mode, setMode] = useState<'register' | 'login'>(initialMode);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Form Fields
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [schoolType, setSchoolType] = useState<'PUBLIC_SCHOOL' | 'PRIVATE_SCHOLARSHIP' | 'PRIVATE_REGULAR'>('PUBLIC_SCHOOL');
  const [targetDegree, setTargetDegree] = useState<string>('');

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
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();

  // Reset form when opening or changing mode
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setFormError(null);
      setIsSuccess(false);
    }
  }, [isOpen, initialMode]);

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

    if (!hasAcceptedTerms) {
      setFormError('Você deve aceitar os Termos de Uso e a Política de Privacidade (LGPD) para prosseguir.');
      return;
    }

    try {
      await registerMutation.mutateAsync({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        schoolType,
        targetDegree: targetDegree.trim() || undefined,
      });

      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
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

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal Dialog Card */}
        <div
          ref={modalRef}
          className="relative w-full max-w-lg max-h-[92vh] bg-white dark:bg-slate-900 rounded-brand shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col z-10 animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-brand bg-brand-primary/10 text-brand-primary">
                {mode === 'register' ? (
                  <UserPlus className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <LogIn className="h-5 w-5" aria-hidden="true" />
                )}
              </div>
              <div>
                <h2
                  id="auth-modal-title"
                  className="text-base sm:text-lg font-bold text-slate-900 dark:text-white"
                >
                  {mode === 'register' ? 'Criar Conta de Estudante' : 'Acessar Minha Conta'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {mode === 'register'
                    ? 'Salve seu progresso e conecte sua pontuação TRI'
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

          {/* Mode Switch Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-1.5 shrink-0 gap-1.5">
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setFormError(null);
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-md transition-all ${
                mode === 'register'
                  ? 'bg-white dark:bg-slate-800 text-brand-primary shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Criar Conta Gratuita
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setFormError(null);
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-md transition-all ${
                mode === 'login'
                  ? 'bg-white dark:bg-slate-800 text-brand-primary shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Já Possuo Conta
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
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
              <form onSubmit={handleRegisterSubmit} className="space-y-4" noValidate>
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
                    type="text"
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
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@escola.gov.br"
                    className="w-full px-3.5 py-2.5 text-sm rounded-brand border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label
                    htmlFor="reg-password"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Senha Segura (mínimo 8 caracteres) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
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
              <form onSubmit={handleLoginSubmit} className="space-y-4" noValidate>
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
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@escola.gov.br"
                    className="w-full px-3.5 py-2.5 text-sm rounded-brand border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Senha <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
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
