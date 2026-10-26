import React, { useState } from 'react';
import {
  BarChart2,
  Lock,
  LogIn,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StudentDiagnosticRadar } from './StudentDiagnosticRadar';
import { useAuthStore } from '@/stores/useAuthStore';
import { useLoginMutation } from '@/api/hooks';
import type { DiagnosticReportDto, InstitutionalCohortDiagnosticResponse } from '@/api/types';
import type { ApiError } from '@/api/client';

export type DiagnosticViewMode = 'student' | 'institutional';

export interface DiagnosticDashboardProps {
  readonly initialMode?: DiagnosticViewMode;
  readonly studentReport?: DiagnosticReportDto;
  readonly cohortData?: InstitutionalCohortDiagnosticResponse;
  readonly className?: string;
  readonly onPracticeTopic?: (topic: string) => void;
  readonly onExportReport?: () => void;
  readonly onOpenAuthModal?: (mode?: 'login' | 'register' | 'forgot-password') => void;
}

export const DiagnosticDashboard: React.FC<DiagnosticDashboardProps> = ({
  studentReport,
  className = '',
  onPracticeTopic,
  onOpenAuthModal,
}) => {
  const { isAuthenticated } = useAuthStore();
  const loginMutation = useLoginMutation();

  // In-place Student Gate Form State
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email.includes('@')) {
      setFormError('Informe um e-mail válido.');
      return;
    }

    if (!password) {
      setFormError('Informe sua senha de acesso.');
      return;
    }

    try {
      await loginMutation.mutateAsync({
        email: email.trim().toLowerCase(),
        password,
      });
    } catch (err) {
      const apiError = err as ApiError;
      setFormError(
        apiError.message ||
          'Falha na autenticação. Verifique seu e-mail e senha de estudante.'
      );
    }
  };

  // State 1: Unauthenticated -> Student Diagnostic Gate
  if (!isAuthenticated && !studentReport) {
    return (
      <div
        className={`max-w-xl mx-auto my-8 p-6 sm:p-8 rounded-brand border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6 ${className}`}
        role="region"
        aria-label="Acesso exclusivo aos diagnósticos de proficiência ENEM"
      >
        <div className="text-center space-y-3">
          <div className="h-14 w-14 mx-auto rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20 shadow-xs">
            <BarChart2 className="h-7 w-7" aria-hidden="true" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/30">
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Acesso Restrito &bull; Área do Aluno</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              Diagnóstico Individual &amp; Radar de Proficiência ENEM
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              O seu radar TRI de proficiência por área do conhecimento (Matemática, Natureza, Humanas e Linguagens), mapeamento de distratores e histórico de simulados são personalizados para o seu perfil de estudos. Entre ou crie sua conta para acessar seu diagnóstico.
            </p>
          </div>
        </div>

        {formError && (
          <div
            className="p-3.5 rounded-brand bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5"
            role="alert"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" aria-hidden="true" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleStudentLogin} className="space-y-4">
          <div>
            <label
              htmlFor="diagnostic-gate-email"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
            >
              E-mail do Aluno
            </label>
            <input
              id="diagnostic-gate-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu.email@exemplo.com"
              required
              className="w-full px-3.5 py-2.5 rounded-brand border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="diagnostic-gate-password"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Senha
              </label>
              <button
                type="button"
                onClick={() => {
                  if (onOpenAuthModal) {
                    onOpenAuthModal('forgot-password');
                  } else {
                    useAuthStore.getState().openAuthModal('forgot-password');
                  }
                }}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Esqueci minha senha
              </button>
            </div>
            <div className="relative">
              <input
                id="diagnostic-gate-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha de acesso"
                required
                className="w-full px-3.5 py-2.5 pr-10 rounded-brand border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full justify-center text-sm py-2.5"
            disabled={loginMutation.isPending}
          >
            <LogIn className="h-4 w-4 mr-1.5" aria-hidden="true" />
            {loginMutation.isPending ? 'Entrando...' : 'Entrar na Minha Conta'}
          </Button>
        </form>

        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <button
            type="button"
            onClick={() => {
              if (onOpenAuthModal) {
                onOpenAuthModal('register');
              } else {
                useAuthStore.getState().openAuthModal('register');
              }
            }}
            className="text-brand-primary font-semibold hover:underline cursor-pointer"
          >
            Não tem uma conta? Cadastre-se gratuitamente
          </button>

          {onPracticeTopic && (
            <button
              type="button"
              onClick={() => onPracticeTopic('')}
              className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              Voltar ao Simulado Rápido
            </button>
          )}
        </div>
      </div>
    );
  }

  // State 2: Authenticated but no diagnostic taken yet -> empty state (never show sample data)
  if (!studentReport) {
    return (
      <div
        className={`max-w-xl mx-auto my-8 p-6 sm:p-8 rounded-brand border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-5 text-center ${className}`}
        role="region"
        aria-label="Central de diagnósticos de proficiência ENEM ainda não realizado"
        data-testid="diagnostic-empty-state"
      >
        <div className="h-14 w-14 mx-auto rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20 shadow-xs">
          <BarChart2 className="h-7 w-7" aria-hidden="true" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            Você ainda não tem um diagnóstico
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Resolva o diagnóstico rápido para mapear sua proficiência nas 4 áreas do ENEM. Seu radar,
            pontos fortes e tópicos de reforço aparecerão aqui com os seus dados reais.
          </p>
        </div>
        {onPracticeTopic && (
          <Button
            type="button"
            variant="primary"
            className="justify-center text-sm py-2.5"
            onClick={() => onPracticeTopic('')}
          >
            Fazer meu diagnóstico agora
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`space-y-6 ${className}`}
      role="region"
      aria-label="Central de diagnósticos e proficiência ENEM do aluno"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-brand border border-blue-500/30 bg-blue-50/40 dark:bg-blue-950/20 shadow-xs animate-fade-up">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/30">
            <span>Diagnóstico ENEM Calibrado</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
            Seu Raio-X de Proficiência Individual
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Sua avaliação diagnóstica foi calibrada. Mantenha sua rotina respondendo às questões do treino diário.
          </p>
        </div>
        {onPracticeTopic && (
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => onPracticeTopic('')}
            className="shrink-0 font-bold whitespace-nowrap bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Sparkles className="h-4 w-4 mr-1.5" aria-hidden="true" />
            Ir para Treino Diário
          </Button>
        )}
      </div>

      <div>
        <StudentDiagnosticRadar
          report={studentReport}
          onPracticeTopic={onPracticeTopic}
        />
      </div>
    </div>
  );
};
