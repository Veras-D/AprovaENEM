import React, { useState } from 'react';
import {
  Trophy,
  Target,
  CheckCircle2,
  BookOpen,
  Lock,
  LogIn,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LevelProgressBar } from './LevelProgressBar';
import { DailyStreakCounter } from './DailyStreakCounter';
import { BadgeShelf } from './BadgeShelf';
import { CelebrationOverlay } from './CelebrationOverlay';
import { WeeklyLeagueLeaderboard } from './WeeklyLeagueLeaderboard';
import { useGamificationProfileQuery, useLoginMutation } from '@/api/hooks';
import { useAuthStore } from '@/stores/useAuthStore';
import { MOCK_GAMIFICATION_PROFILE } from '@/api/mocks/mock-data';
import type { GamificationProfileDto } from '@/api/types';
import type { ApiError } from '@/api/client';
import type { LeagueTier } from '../leaderboard-utils';

export interface GamificationDashboardProps {
  readonly profile?: GamificationProfileDto;
  readonly className?: string;
  readonly onStartPractice?: () => void;
  readonly defaultTab?: 'overview' | 'leaderboard';
  readonly showCelebration?: boolean;
  readonly onCelebrationClose?: () => void;
  readonly onOpenAuthModal?: (mode?: 'login' | 'register') => void;
}

export const GamificationDashboard: React.FC<GamificationDashboardProps> = ({
  profile: propProfile,
  className = '',
  onStartPractice,
  defaultTab = 'overview',
  showCelebration,
  onCelebrationClose,
  onOpenAuthModal,
}) => {
  const { isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'leaderboard'>(defaultTab);
  const [internalCelebrationOpen, setInternalCelebrationOpen] = useState<boolean>(false);
  const isCelebrationOpen = showCelebration ?? internalCelebrationOpen;
  const profileQuery = useGamificationProfileQuery();
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

  const handleCelebrationClose = () => {
    setInternalCelebrationOpen(false);
    onCelebrationClose?.();
  };

  // State 1: Unauthenticated -> Student Login & Access Gate
  if (!isAuthenticated && !propProfile) {
    return (
      <div
        className={`max-w-xl mx-auto my-8 p-6 sm:p-8 rounded-brand border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6 ${className}`}
        role="region"
        aria-label="Acesso exclusivo ao Painel de Conquistas e Ranking"
      >
        <div className="text-center space-y-3">
          <div className="h-14 w-14 mx-auto rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 shadow-xs">
            <Trophy className="h-7 w-7" aria-hidden="true" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Acesso Restrito &bull; Área do Aluno</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              Conquistas, Nível de XP &amp; Ranking da Liga
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              A sua pontuação de XP, ofensiva diária de estudos, medalhas desbloqueadas e classificação semanal nas Ligas ENEM são exclusivas de estudantes cadastrados. Entre ou crie sua conta para começar a pontuar.
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
              htmlFor="student-gate-email"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
            >
              E-mail do Aluno
            </label>
            <input
              id="student-gate-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu.email@exemplo.com"
              required
              className="w-full px-3.5 py-2.5 rounded-brand border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="student-gate-password"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
            >
              Senha
            </label>
            <div className="relative">
              <input
                id="student-gate-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha de acesso"
                required
                className="w-full px-3.5 py-2.5 pr-10 rounded-brand border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
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

          {onStartPractice && (
            <button
              type="button"
              onClick={onStartPractice}
              className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              Voltar ao Simulado Rápido
            </button>
          )}
        </div>
      </div>
    );
  }

  const profile = propProfile || profileQuery.data || MOCK_GAMIFICATION_PROFILE;
  const isDailyGoalReached = profile.dailyGoalProgress >= profile.dailyGoalTarget;
  const goalPercentage = Math.min(
    100,
    Math.round((profile.dailyGoalProgress / Math.max(1, profile.dailyGoalTarget)) * 100)
  );

  return (
    <div
      className={`space-y-4 sm:space-y-6 ${className}`}
      role="region"
      aria-label="Painel de gamificação do estudante"
    >
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-brand border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Trophy className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100">
                Painel de Conquistas & XP
              </h2>
              <button
                type="button"
                onClick={() => setActiveTab('leaderboard')}
                aria-label={`Ver classificação da Liga ${profile.weeklyLeague}`}
                className="focus:outline-hidden focus:ring-2 focus:ring-amber-500 rounded-full cursor-pointer"
              >
                <Badge
                  variant="outline"
                  className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30 text-xs py-0.5 px-2 font-bold uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Liga {profile.weeklyLeague}
                </Badge>
              </button>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Acompanhe sua pontuação, evolução de nível e recompensas do ENEM.
            </p>
          </div>
        </div>

        {/* Practice Navigation */}
        {onStartPractice && (
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onStartPractice}
              className="text-xs gap-1.5"
              aria-label="Praticar Questões: Ir para o simulado e praticar questões"
            >
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
              Praticar Questões
            </Button>
          </div>
        )}
      </div>

      {/* Navigation Tabs (Meu Progresso vs Ranking da Liga) */}
      <div
        className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3"
        role="tablist"
        aria-label="Seções do painel de gamificação"
      >
        <button
          type="button"
          role="tab"
          id="tab-overview"
          aria-selected={activeTab === 'overview'}
          aria-controls="panel-overview"
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-2 rounded-brand text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-brand-primary text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Target className="h-4 w-4" aria-hidden="true" />
          Meu Progresso & Conquistas
        </button>

        <button
          type="button"
          role="tab"
          id="tab-leaderboard"
          aria-selected={activeTab === 'leaderboard'}
          aria-controls="panel-leaderboard"
          onClick={() => setActiveTab('leaderboard')}
          className={`px-3.5 py-2 rounded-brand text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'leaderboard'
              ? 'bg-brand-primary text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Trophy className="h-4 w-4" aria-hidden="true" />
          Ranking da Liga
        </button>
      </div>

      {/* Tab Panel: Overview (Progresso, Streak, Meta, Medalhas) */}
      <div
        id="panel-overview"
        role="tabpanel"
        aria-labelledby="tab-overview"
        hidden={activeTab !== 'overview'}
        className={activeTab === 'overview' ? 'space-y-4 sm:space-y-6' : 'hidden'}
      >
        {/* Grid: Level Progress & Daily Streak Counter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LevelProgressBar
            currentXp={profile.currentXp}
            currentLevel={profile.level}
          />

          <DailyStreakCounter
            currentStreakDays={profile.currentStreakDays}
            longestStreakDays={profile.longestStreakDays}
            streakFreezeAvailable={profile.streakFreezeAvailable}
          />
        </div>

        {/* Daily Study Goal Card */}
        <div className="p-4 rounded-brand border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
                <Target className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  Meta Diária de Estudos
                  {isDailyGoalReached && (
                    <Badge
                      variant="outline"
                      className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-xs py-0 px-1.5"
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" aria-hidden="true" />
                      Concluída!
                    </Badge>
                  )}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {profile.dailyGoalProgress} de {profile.dailyGoalTarget} questões resolvidas hoje ({goalPercentage}%)
                </p>
              </div>
            </div>

            <span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-200">
              {profile.dailyGoalProgress}/{profile.dailyGoalTarget}
            </span>
          </div>

          {/* Goal Progress Bar */}
          <div
            className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={goalPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Meta diária: ${goalPercentage}% concluída`}
          >
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isDailyGoalReached
                  ? 'bg-emerald-500'
                  : 'bg-brand-primary'
              }`}
              style={{ width: `${goalPercentage}%` }}
            />
          </div>
        </div>

        {/* Badges Shelf */}
        <BadgeShelf
          unlockedBadges={profile.unlockedBadges}
          progressByBadge={{
            ESCALADA_NIVEL: profile.level,
            STREAK_DIAS: profile.longestStreakDays,
          }}
        />
      </div>

      {/* Tab Panel: Weekly League Leaderboard */}
      <div
        id="panel-leaderboard"
        role="tabpanel"
        aria-labelledby="tab-leaderboard"
        hidden={activeTab !== 'leaderboard'}
        className={activeTab === 'leaderboard' ? 'space-y-4 sm:space-y-6' : 'hidden'}
      >
        <WeeklyLeagueLeaderboard
          initialLeague={(profile.weeklyLeague as LeagueTier) || 'GOLD'}
          currentUserId={profile.userId}
        />
      </div>

      {/* Level-Up Celebration Modal Overlay */}
      <CelebrationOverlay
        isOpen={isCelebrationOpen}
        onClose={handleCelebrationClose}
        level={profile.level}
        levelTitle={profile.levelTitle}
        onContinuePractice={onStartPractice}
      />
    </div>
  );
};
