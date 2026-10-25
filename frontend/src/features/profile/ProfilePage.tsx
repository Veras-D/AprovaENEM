import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import {
  useUpdateProfileMutation,
  useUpdateDailyGoalMutation,
  useExportUserDataMutation,
  useGamificationProfileQuery,
} from '@/api/hooks';
import type { AvatarConfig } from '@/types';
import { AvatarRenderer } from '@/components/avatar/AvatarRenderer';
import { AvatarCreator } from '@/components/avatar/AvatarCreator';
import { Select, type SelectOption } from '@/components/ui/Select';
import {
  User,
  GraduationCap,
  Sparkles,
  Target,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Flame,
  Award,
  BookOpen,
} from 'lucide-react';

export interface ProfilePageProps {
  readonly onNavigate?: (section: string) => void;
  readonly onOpenErasureModal?: () => void;
}

const SCHOOL_TYPE_OPTIONS: readonly SelectOption<'PUBLIC_SCHOOL' | 'PRIVATE_SCHOOL'>[] = [
  {
    value: 'PUBLIC_SCHOOL',
    label: 'Escola Pública (Estadual, Municipal ou Federal)',
    description: 'Ensino médio cursado integralmente na rede pública',
  },
  {
    value: 'PRIVATE_SCHOOL',
    label: 'Escola Privada (Particular ou Bolsista)',
    description: 'Ensino médio cursado em rede privada com ou sem bolsa',
  },
];

export const ProfilePage: React.FC<ProfilePageProps> = ({
  onNavigate,
  onOpenErasureModal,
}) => {
  const { user, isAuthenticated, updateUser, openAuthModal } = useAuthStore();
  const { data: gamificationProfile } = useGamificationProfileQuery();

  // Profile data state
  const [fullName, setFullName] = useState<string>(user?.name ?? '');
  const [schoolType, setSchoolType] = useState<'PUBLIC_SCHOOL' | 'PRIVATE_SCHOOL'>(
    user?.schoolType === 'PRIVATE_SCHOOL' ? 'PRIVATE_SCHOOL' : 'PUBLIC_SCHOOL'
  );
  const [targetDegree, setTargetDegree] = useState<string>(user?.targetDegree ?? '');

  // Daily goal state
  const currentGoal = gamificationProfile?.dailyGoalTarget ?? 5;
  const [dailyGoal, setDailyGoal] = useState<number>(currentGoal);

  // Status feedback banners
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);
  const [goalSuccessMsg, setGoalSuccessMsg] = useState<string | null>(null);
  const [goalErrorMsg, setGoalErrorMsg] = useState<string | null>(null);

  const updateProfileMutation = useUpdateProfileMutation();
  const updateDailyGoalMutation = useUpdateDailyGoalMutation();
  const exportUserDataMutation = useExportUserDataMutation();

  useEffect(() => {
    if (user) {
      setFullName(user.name);
      setSchoolType(user.schoolType === 'PRIVATE_SCHOOL' ? 'PRIVATE_SCHOOL' : 'PUBLIC_SCHOOL');
      setTargetDegree(user.targetDegree ?? '');
    }
  }, [user]);

  useEffect(() => {
    if (gamificationProfile?.dailyGoalTarget) {
      setDailyGoal(gamificationProfile.dailyGoalTarget);
    }
  }, [gamificationProfile?.dailyGoalTarget]);

  if (!isAuthenticated || !user) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 text-center max-w-lg mx-auto">
          <div className="h-16 w-16 mx-auto rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-4">
            <User className="h-8 w-8" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Acesse seu Perfil de Estudante
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Faça login ou crie sua conta gratuita para criar seu avatar no estilo Duolingo, personalizar suas metas diárias de estudo e acompanhar seu progresso rumo ao ENEM.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="py-2.5 px-6 rounded-brand font-semibold text-sm bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors shadow-sm"
            >
              Fazer Login
            </button>
            <button
              type="button"
              onClick={() => openAuthModal('register')}
              className="py-2.5 px-6 rounded-brand font-semibold text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Criar Conta Grátis
            </button>
          </div>
        </div>
      </main>
    );
  }

  const handleSaveAvatar = (newConfig: AvatarConfig) => {
    updateUser({ avatarConfig: newConfig });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccessMsg(null);
    setProfileErrorMsg(null);

    try {
      await updateProfileMutation.mutateAsync({
        fullName: fullName.trim(),
        schoolType,
        targetDegree: targetDegree.trim(),
      });
      setProfileSuccessMsg('Dados cadastrais e preferências atualizados com sucesso!');
      setTimeout(() => setProfileSuccessMsg(null), 4000);
    } catch {
      setProfileErrorMsg('Não foi possível salvar os dados. Verifique a conexão e tente novamente.');
    }
  };

  const handleSaveDailyGoal = async (target?: number) => {
    const goalToSave = target ?? dailyGoal;
    setGoalSuccessMsg(null);
    setGoalErrorMsg(null);
    try {
      await updateDailyGoalMutation.mutateAsync(goalToSave);
      setDailyGoal(goalToSave);
      setGoalSuccessMsg(`Meta diária definida para ${goalToSave} questões por dia!`);
      setTimeout(() => setGoalSuccessMsg(null), 4000);
    } catch {
      setGoalErrorMsg('Não foi possível salvar a meta diária. Verifique a conexão e tente novamente.');
      setTimeout(() => setGoalErrorMsg(null), 4000);
    }
  };

  const handleExportData = async () => {
    try {
      await exportUserDataMutation.mutateAsync();
    } catch {
      // mutation handles fallback
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-150">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <button
            type="button"
            onClick={() => onNavigate?.('practice')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:text-brand-primary-hover mb-2 group transition-colors"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
            <span>Voltar aos Estudos</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Meu Perfil & Configurações
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Crie seu avatar personalizado, acompanhe seu ritmo diário e configure suas preferências do ENEM.
          </p>
        </div>

        {/* Quick Gamification Chips */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 text-xs font-bold">
            <Flame className="h-4 w-4" aria-hidden="true" />
            <span>{gamificationProfile?.currentStreakDays ?? 1} dias de ofensiva</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20 text-xs font-bold">
            <Award className="h-4 w-4" aria-hidden="true" />
            <span>Nível {gamificationProfile?.level ?? 1}</span>
          </div>
        </div>
      </div>

      {/* Student Identity Hero Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative shrink-0">
          <AvatarRenderer
            config={user.avatarConfig}
            size={100}
            className="drop-shadow-md rounded-full ring-4 ring-brand-primary/20"
          />
        </div>

        <div className="flex-1 text-center sm:text-left space-y-1.5">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {user.name}
            </h2>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
              {user.roles.includes('ROLE_ADMIN')
                ? 'Administrador'
                : user.roles.includes('ROLE_INSTITUTIONAL_ADMIN')
                  ? 'Coordenador'
                  : 'Estudante'}
            </span>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {user.schoolType === 'PRIVATE_SCHOOL' ? 'Escola Privada' : 'Escola Pública'}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
            <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {user.email}
            </span>
            {user.isEmailVerified ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                E-mail Verificado
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  <AlertCircle className="h-3 w-3" aria-hidden="true" />
                  Confirmação Pendente
                </span>
                <button
                  type="button"
                  onClick={() => openAuthModal('verify-email')}
                  className="text-xs text-brand-primary dark:text-brand-accent hover:underline font-semibold cursor-pointer"
                >
                  Confirmar E-mail
                </button>
              </span>
            )}
          </div>

          {user.targetDegree && (
            <p className="text-xs sm:text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center justify-center sm:justify-start gap-1.5 pt-1">
              <GraduationCap className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Objetivo SISU: {user.targetDegree}</span>
            </p>
          )}
        </div>
      </div>

      {/* SECTION 1: Duolingo-Style Avatar Creator */}
      <section aria-labelledby="avatar-creator-heading">
        <AvatarCreator
          initialConfig={user.avatarConfig}
          onSave={handleSaveAvatar}
        />
      </section>

      {/* Two-Column Responsive Grid: Academic Data & Daily Study Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CARD: Personal & Academic Data */}
        <section aria-labelledby="personal-data-heading">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
                <User className="h-5 w-5 text-brand-primary" aria-hidden="true" />
                <h3 id="personal-data-heading" className="text-base font-bold text-slate-900 dark:text-white">
                  Dados & Preferências Acadêmicas
                </h3>
              </div>

              {profileSuccessMsg && (
                <div className="mb-4 p-3 rounded-brand bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              {profileErrorMsg && (
                <div className="mb-4 p-3 rounded-brand bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{profileErrorMsg}</span>
                </div>
              )}

              <form id="profile-form" onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="profile-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Endereço de E-mail
                    </label>
                    {user.isEmailVerified ? (
                      <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Verificado
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openAuthModal('verify-email')}
                        className="text-[11px] font-medium text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <AlertCircle className="h-3 w-3" /> Confirmar Agora
                      </button>
                    )}
                  </div>
                  <input
                    id="profile-email"
                    type="email"
                    value={user.email}
                    disabled
                    aria-label="Endereço de e-mail do estudante"
                    className="w-full px-3.5 py-2.5 rounded-brand border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-sm cursor-not-allowed"
                  />
                </div>

                <div>
                  <label htmlFor="profile-fullname" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nome Completo
                  </label>
                  <input
                    id="profile-fullname"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-brand border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                <Select<'PUBLIC_SCHOOL' | 'PRIVATE_SCHOOL'>
                  id="profile-school"
                  label="Tipo de Escola"
                  value={schoolType}
                  onChange={(val) => setSchoolType(val)}
                  options={SCHOOL_TYPE_OPTIONS}
                />

                <div>
                  <label htmlFor="profile-targetdegree" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Curso / Carreira dos Sonhos (SISU)
                  </label>
                  <input
                    id="profile-targetdegree"
                    type="text"
                    value={targetDegree}
                    onChange={(e) => setTargetDegree(e.target.value)}
                    placeholder="Ex.: Medicina (USP), Direito (UFRJ), Ciência da Computação"
                    className="w-full px-3.5 py-2.5 rounded-brand border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    Usado para calibrar recomendações de notas de corte e pesos das 4 áreas do ENEM.
                  </p>
                </div>
              </form>
            </div>

            <div className="pt-5 border-t border-slate-100 dark:border-slate-800 mt-5">
              <button
                type="submit"
                form="profile-form"
                disabled={updateProfileMutation.isPending}
                className="w-full py-2.5 px-4 rounded-brand font-semibold text-xs sm:text-sm bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors disabled:opacity-50 shadow-sm"
              >
                {updateProfileMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </section>

        {/* CARD: Daily Study Goals */}
        <section aria-labelledby="daily-goal-heading">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
                <Target className="h-5 w-5 text-amber-500" aria-hidden="true" />
                <h3 id="daily-goal-heading" className="text-base font-bold text-slate-900 dark:text-white">
                  Meta Diária de Estudos
                </h3>
              </div>

              {goalSuccessMsg && (
                <div className="mb-4 p-3 rounded-brand bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{goalSuccessMsg}</span>
                </div>
              )}

              {goalErrorMsg && (
                <div className="mb-4 p-3 rounded-brand bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{goalErrorMsg}</span>
                </div>
              )}

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                A preparação para o ENEM exige constância e ritmo diário. Definir uma meta atingível ajuda a formar o hábito de estudar todos os dias sem sobrecarga.
              </p>

              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Selecione sua meta diária de questões resolvidas:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[3, 5, 10, 15].map((target) => {
                    const isSelected = dailyGoal === target;
                    return (
                      <button
                        key={target}
                        type="button"
                        onClick={() => {
                          setDailyGoal(target);
                          handleSaveDailyGoal(target);
                        }}
                        className={`py-3 px-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                          isSelected
                            ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold ring-2 ring-amber-500/30'
                            : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="text-lg font-black">{target}</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider">
                          {target === 5 ? 'Recomendado' : 'questões'}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <BookOpen className="h-4 w-4 text-brand-primary shrink-0" aria-hidden="true" />
                  <span>Meta padrão da plataforma: <strong>5 questões/dia</strong> (alinhada ao diagnóstico inicial).</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 mt-6">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-300">Progresso de Hoje:</span>
                <span className="font-bold text-brand-primary">
                  {gamificationProfile?.dailyGoalProgress ?? 0} de {dailyGoal} questões
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-brand-primary h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(((gamificationProfile?.dailyGoalProgress ?? 0) / (dailyGoal || 5)) * 100)
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div className="pt-5 border-t border-slate-100 dark:border-slate-800 mt-5">
              <button
                type="button"
                onClick={() => handleSaveDailyGoal(dailyGoal)}
                disabled={updateDailyGoalMutation.isPending}
                className="w-full py-2.5 px-4 rounded-brand font-semibold text-xs sm:text-sm bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors disabled:opacity-50 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {updateDailyGoalMutation.isPending ? 'Salvando...' : 'Salvar Meta Diária'}
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* SECTION 3: Brazilian LGPD Data Portability & Account Erasure */}
      <section aria-labelledby="lgpd-heading" className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
          <Sparkles className="h-5 w-5 text-indigo-500" aria-hidden="true" />
          <h3 id="lgpd-heading" className="text-base font-bold text-slate-900 dark:text-white">
            Privacidade & Direitos do Estudante (LGPD Art. 18)
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
          Em estrito cumprimento à Lei Geral de Proteção de Dados (Lei nº 13.709/2018), o AprovaENEM garante a você total transparência e soberania sobre seus dados pessoais, simulados realizados e histórico de aprendizado.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Export Data */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm mb-1">
                <Download className="h-4 w-4 text-brand-primary" aria-hidden="true" />
                <span>Portabilidade de Dados (Art. 18, V)</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Baixe um arquivo JSON completo contendo seus dados cadastrais, histórico de simulados, respostas corrigidas e medalhas conquistadas.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportData}
              disabled={exportUserDataMutation.isPending}
              className="mt-4 inline-flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-brand border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{exportUserDataMutation.isPending ? 'Exportando...' : 'Baixar Meus Dados (JSON)'}</span>
            </button>
          </div>

          {/* Account Erasure */}
          <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-sm mb-1">
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                <span>Eliminação Definitiva da Conta (Art. 18, VI)</span>
              </div>
              <p className="text-xs text-rose-600/80 dark:text-rose-300/80">
                Exclua sua conta e todas as informações pessoais de forma permanente. Essa ação é irreversível e remove suas pontuações e ofensivas.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenErasureModal}
              className="mt-4 inline-flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-brand bg-rose-600 hover:bg-rose-700 text-white transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Excluir Minha Conta Permanentemente</span>
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};
