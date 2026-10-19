import React, { useState } from 'react';
import {
  Building2,
  GraduationCap,
  ArrowLeft,
  Lock,
  ShieldAlert,
  LogIn,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { InstitutionalCohortView } from '@/features/diagnostic/components/InstitutionalCohortView';
import { useTenantStore } from '@/stores/useTenantStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useLoginMutation } from '@/api/hooks';
import type { InstitutionalCohortDiagnosticResponse } from '@/api/types';
import type { ApiError } from '@/api/client';

export interface InstitutionalDashboardProps {
  readonly cohortData?: InstitutionalCohortDiagnosticResponse;
  readonly className?: string;
  readonly onNavigate?: (section: string) => void;
  readonly onExportReport?: () => void;
  readonly onOpenAuthModal?: () => void;
}

export const InstitutionalDashboard: React.FC<InstitutionalDashboardProps> = ({
  cohortData,
  className = '',
  onNavigate,
  onExportReport,
  onOpenAuthModal,
}) => {
  const currentTenant = useTenantStore((s) => s.currentTenant);
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const loginMutation = useLoginMutation();

  // In-place Institutional Login Form State
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isCoordinator = Boolean(
    isAuthenticated &&
      user?.roles?.some(
        (role) =>
          role === 'ROLE_ADMIN' ||
          role === 'ROLE_INSTITUTIONAL_ADMIN'
      )
  );

  const handleCoordinatorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email.includes('@')) {
      setFormError('Informe um e-mail institucional válido.');
      return;
    }

    if (!password) {
      setFormError('Informe sua senha institucional.');
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
          'Falha na autenticação institucional. Verifique suas credenciais de coordenação.'
      );
    }
  };

  // State 1: Unauthenticated -> Institutional Login & Security Gate
  if (!isAuthenticated) {
    return (
      <div
        className={`max-w-xl mx-auto my-8 p-6 sm:p-8 rounded-brand border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6 ${className}`}
        role="region"
        aria-label="Acesso restrito ao Painel da Coordenação Pedagógica"
      >
        <div className="text-center space-y-3">
          <div className="h-14 w-14 mx-auto rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800 shadow-xs">
            <Lock className="h-7 w-7" aria-hidden="true" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
              <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Acesso Restrito &bull; Gestão Escolar</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              Painel da Coordenação Pedagógica
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              As métricas agregadas de turmas, relatórios de simulados e diagnósticos de distratores de {currentTenant.name} são estritamente confidenciais e restritos a coordenadores, professores e gestores escolares.
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

        <form onSubmit={handleCoordinatorLogin} className="space-y-4">
          <div>
            <label
              htmlFor="coordinator-email"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
            >
              E-mail Institucional
            </label>
            <input
              id="coordinator-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="coordenacao@escola.gov.br"
              required
              className="w-full px-3.5 py-2.5 rounded-brand border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="coordinator-password"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
            >
              Senha Institucional
            </label>
            <div className="relative">
              <input
                id="coordinator-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 rounded-brand border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Button
              type="submit"
              variant="primary"
              disabled={loginMutation.isPending}
              className="w-full sm:flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <LogIn className="h-4 w-4" aria-hidden="true" />
              <span>{loginMutation.isPending ? 'Autenticando...' : 'Acessar Painel da Coordenação'}</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => onNavigate?.('home')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 border-slate-300 dark:border-slate-700"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <GraduationCap className="h-4 w-4 text-brand-primary" aria-hidden="true" />
              <span>Voltar ao Portal do Aluno</span>
            </Button>
          </div>
        </form>

        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            É estudante? Retorne à página principal de estudos. O painel da coordenação é de uso restrito da gestão escolar.
          </p>
        </div>
      </div>
    );
  }

  // State 2: Authenticated but NOT Coordinator (Regular Student -> 403 Forbidden)
  if (!isCoordinator) {
    return (
      <div
        className={`max-w-xl mx-auto my-8 p-6 sm:p-8 rounded-brand border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-900 shadow-sm space-y-6 ${className}`}
        role="region"
        aria-label="Acesso negado ao Painel da Coordenação"
      >
        <div className="text-center space-y-3">
          <div className="h-14 w-14 mx-auto rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-800 shadow-xs">
            <ShieldAlert className="h-7 w-7" aria-hidden="true" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30">
              <span>Acesso Negado (403) &bull; Permissão Insuficiente</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              Área Exclusiva da Coordenação Pedagógica
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Você está autenticado como <strong className="text-slate-800 dark:text-slate-200">{user?.name ?? 'Estudante'}</strong> ({user?.email}). Sua conta possui perfil de estudante e não possui autorização para consultar os dados pedagógicos e métricas de turmas de {currentTenant.name}.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-brand bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2">
          <p className="font-semibold text-slate-800 dark:text-slate-200">
            Quem pode acessar este painel?
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Professores responsáveis por turmas do ENEM</li>
            <li>Coordenadores Pedagógicos e Orientadores Educacionais</li>
            <li>Diretores e Administradores Escolares credenciados</li>
          </ul>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            type="button"
            variant="primary"
            onClick={() => onNavigate?.('home')}
            className="w-full sm:flex-1 flex items-center justify-center gap-2"
          >
            <GraduationCap className="h-4 w-4" aria-hidden="true" />
            <span>Voltar aos Meus Estudos (Portal do Aluno)</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              clearAuth();
              onOpenAuthModal?.();
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 border-slate-300 dark:border-slate-700"
          >
            <LogIn className="h-4 w-4" aria-hidden="true" />
            <span>Entrar com Outra Conta</span>
          </Button>
        </div>
      </div>
    );
  }

  // State 3: Authenticated AND Authorized Coordinator (ROLE_ADMIN or ROLE_INSTITUTIONAL_ADMIN)
  return (
    <div
      className={`space-y-6 ${className}`}
      role="region"
      aria-label="Painel da coordenação pedagógica e diagnóstico de turmas"
    >
      {/* Institutional Portal Top Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-brand border border-indigo-200/80 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Building2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                Painel da Coordenação Pedagógica
              </h1>
              {user?.name && (
                <span className="text-[11px] font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-100/70 dark:bg-indigo-900/50 px-2 py-0.5 rounded-full">
                  Coordenador: {user.name}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Métricas consolidadas de turmas, aderência aos simulados e diagnóstico pedagógico de {currentTenant.name}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onNavigate?.('home')}
          className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-semibold cursor-pointer border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <GraduationCap className="h-3.5 w-3.5 text-brand-primary" aria-hidden="true" />
          <span>Voltar ao Portal do Aluno</span>
        </Button>
      </div>

      {/* Main Cohort View (rendered ONLY when authorized) */}
      <InstitutionalCohortView
        cohortData={cohortData}
        onExportReport={onExportReport}
      />
    </div>
  );
};
