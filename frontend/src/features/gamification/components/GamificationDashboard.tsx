import React, { useState } from 'react';
import {
  Trophy,
  Target,
  Sparkles,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LevelProgressBar } from './LevelProgressBar';
import { DailyStreakCounter } from './DailyStreakCounter';
import { BadgeShelf } from './BadgeShelf';
import { CelebrationOverlay } from './CelebrationOverlay';
import { WeeklyLeagueLeaderboard } from './WeeklyLeagueLeaderboard';
import { useGamificationProfileQuery } from '@/api/hooks';
import { MOCK_GAMIFICATION_PROFILE } from '@/api/mocks/mock-data';
import type { GamificationProfileDto } from '@/api/types';
import type { LeagueTier } from '../leaderboard-utils';

export interface GamificationDashboardProps {
  readonly profile?: GamificationProfileDto;
  readonly className?: string;
  readonly onStartPractice?: () => void;
  readonly defaultTab?: 'overview' | 'leaderboard';
}

export const GamificationDashboard: React.FC<GamificationDashboardProps> = ({
  profile: propProfile,
  className = '',
  onStartPractice,
  defaultTab = 'overview',
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'leaderboard'>(defaultTab);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState<boolean>(false);
  const profileQuery = useGamificationProfileQuery();

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-brand border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-amber-500/10 via-brand-primary/5 to-transparent dark:from-amber-500/15 dark:via-brand-primary/10">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
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
                className="focus:outline-hidden focus:ring-2 focus:ring-amber-500 rounded-full"
              >
                <Badge
                  variant="outline"
                  className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 text-xs py-0 px-2 font-bold uppercase tracking-wider cursor-pointer transition-colors"
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

        {/* Level-up Celebratory Animation Trigger & Practice Navigation */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {onStartPractice && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onStartPractice}
              className="text-xs gap-1.5"
              aria-label="Ir para o simulado e praticar questões"
            >
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
              Praticar Questões
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsCelebrationOpen(true)}
            className="text-xs gap-1.5 border-amber-400/40 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40"
            aria-label="Ver comemoração de subida de nível"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
            Comemorar Nível
          </Button>
        </div>
      </div>

      {/* Navigation Tabs (Meu Progresso vs Ranking da Liga) */}
      <div
        className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2"
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
          className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
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
          className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
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
                  : 'bg-gradient-to-r from-brand-primary to-amber-500'
              }`}
              style={{ width: `${goalPercentage}%` }}
            />
          </div>
        </div>

        {/* Badges Shelf */}
        <BadgeShelf unlockedBadges={profile.unlockedBadges} />
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
        onClose={() => setIsCelebrationOpen(false)}
        level={profile.level}
        levelTitle={profile.levelTitle}
      />
    </div>
  );
};
