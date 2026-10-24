import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  User,
  Shield,
  KeyRound,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  GraduationCap,
  School,
  Target,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/useAuthStore';
import { useGamificationProfileQuery, useUpdateProfileMutation, useUpdateDailyGoalMutation, useExportUserDataMutation } from '@/api/hooks';
import type { ApiError } from '@/api/client';

export interface UserProfileModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onOpenErasureModal?: () => void;
}

type TabType = 'profile' | 'security' | 'privacy';

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenErasureModal,
}) => {
  const user = useAuthStore((s) => s.user);
  const { data: gamificationProfile } = useGamificationProfileQuery();
  const updateProfileMutation = useUpdateProfileMutation();
  const updateDailyGoalMutation = useUpdateDailyGoalMutation();
  const exportUserDataMutation = useExportUserDataMutation();

  const [activeTab, setActiveTab] = useState<TabType>('profile');

  // Profile Form State
  const [fullName, setFullName] = useState(user?.name || '');
  const [schoolType, setSchoolType] = useState<'PUBLIC_SCHOOL' | 'PRIVATE_SCHOOL'>(
    user?.schoolType || 'PUBLIC_SCHOOL'
  );
  const [targetDegree, setTargetDegree] = useState(user?.targetDegree || '');
  const [dailyGoalTarget, setDailyGoalTarget] = useState<number>(
    gamificationProfile?.dailyGoalTarget || 5
  );

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Feedback State
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  // Sync inputs when user/gamification profile updates
  useEffect(() => {
    if (user) {
      setFullName(user.name || '');
      setSchoolType(user.schoolType || 'PUBLIC_SCHOOL');
      setTargetDegree(user.targetDegree || '');
    }
    if (gamificationProfile?.dailyGoalTarget) {
      setDailyGoalTarget(gamificationProfile.dailyGoalTarget);
    }
  }, [user, gamificationProfile]);

  // Open/Close lifecycle animation
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
      setFeedbackMessage(null);
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
  }, [isOpen, shouldRender]);

  // Focus trap and Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        if (!modalRef.current) return;
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Password strength calculation
  const getPasswordStrength = (pw: string) => {
    if (!pw) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (pw.length >= 8) score += 25;
    if (/[A-Z]/.test(pw)) score += 25;
    if (/[a-z]/.test(pw)) score += 25;
    if (/[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score += 25;

    if (score <= 25) return { score, label: 'Muito fraca', color: 'bg-rose-500' };
    if (score <= 50) return { score, label: 'Razoável', color: 'bg-amber-500' };
    if (score <= 75) return { score, label: 'Boa', color: 'bg-blue-500' };
    return { score: 100, label: 'Excelente', color: 'bg-emerald-500' };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMessage(null);

    if (!fullName.trim()) {
      setFeedbackMessage({ type: 'error', text: 'Informe seu nome completo.' });
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        fullName: fullName.trim(),
        schoolType,
        targetDegree: targetDegree.trim(),
      });

      if (dailyGoalTarget !== gamificationProfile?.dailyGoalTarget) {
        await updateDailyGoalMutation.mutateAsync(dailyGoalTarget);
      }

      setFeedbackMessage({
        type: 'success',
        text: 'Perfil e metas de estudo atualizados com sucesso!',
      });
    } catch (err) {
      const apiError = err as ApiError;
      setFeedbackMessage({
        type: 'error',
        text: apiError.message || 'Falha ao salvar as alterações do perfil.',
      });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMessage(null);

    if (!currentPassword) {
      setFeedbackMessage({ type: 'error', text: 'Informe a senha atual.' });
      return;
    }
    if (newPassword.length < 8) {
      setFeedbackMessage({ type: 'error', text: 'A nova senha deve ter no mínimo 8 caracteres.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setFeedbackMessage({ type: 'error', text: 'A confirmação de senha não coincide com a nova senha.' });
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        currentPassword,
        newPassword,
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setFeedbackMessage({
        type: 'success',
        text: 'Sua senha foi alterada com sucesso!',
      });
    } catch (err) {
      const apiError = err as ApiError;
      setFeedbackMessage({
        type: 'error',
        text: apiError.message || 'Falha ao alterar senha. Verifique a senha atual.',
      });
    }
  };

  const handleExportData = async () => {
    setFeedbackMessage(null);
    try {
      const data = await exportUserDataMutation.mutateAsync();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aprovaenem-dados-estudante-${user?.id || 'me'}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setFeedbackMessage({
        type: 'success',
        text: 'Download do relatório LGPD concluído com sucesso!',
      });
    } catch (err) {
      const apiError = err as ApiError;
      setFeedbackMessage({
        type: 'error',
        text: apiError.message || 'Erro ao exportar dados da conta.',
      });
    }
  };

  if (!shouldRender || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-xs transition-opacity duration-150 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
        className={`w-full max-w-xl max-h-[90vh] flex flex-col rounded-brand bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-transform duration-150 ${
          isClosing ? 'scale-95' : 'scale-100'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div>
              <h2
                id="profile-modal-title"
                className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2"
              >
                Meu Perfil &bull; AprovaENEM
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user?.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-brand hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            aria-label="Fechar perfil"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-5 pt-2 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab('profile');
              setFeedbackMessage(null);
            }}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'profile'
                ? 'border-brand-primary text-brand-primary dark:text-brand-primary'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <User className="h-4 w-4" aria-hidden="true" />
            Dados &amp; Metas
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('security');
              setFeedbackMessage(null);
            }}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'security'
                ? 'border-brand-primary text-brand-primary dark:text-brand-primary'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <KeyRound className="h-4 w-4" aria-hidden="true" />
            Segurança
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('privacy');
              setFeedbackMessage(null);
            }}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'privacy'
                ? 'border-brand-primary text-brand-primary dark:text-brand-primary'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Shield className="h-4 w-4" aria-hidden="true" />
            Privacidade &amp; LGPD
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 scrollbar-none">
          {/* Feedback Alert */}
          {feedbackMessage && (
            <div
              className={`p-3.5 rounded-brand flex items-start gap-2.5 text-xs sm:text-sm ${
                feedbackMessage.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300'
              }`}
              role="alert"
            >
              {feedbackMessage.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" aria-hidden="true" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" aria-hidden="true" />
              )}
              <span>{feedbackMessage.text}</span>
            </div>
          )}

          {/* Tab 1: Profile & Daily Goal */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="prof-fullname"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Nome Completo
                </label>
                <input
                  id="prof-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm rounded-brand border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="prof-email"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  E-mail do Estudante
                </label>
                <div className="relative">
                  <input
                    id="prof-email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-3 py-2 text-sm rounded-brand border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Verificado
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  O e-mail é o identificador único da sua conta de estudante.
                </p>
              </div>

              {/* School Type */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Rede de Ensino (Prioridade ENEM / SISU)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSchoolType('PUBLIC_SCHOOL')}
                    className={`p-3 rounded-brand border text-left flex items-start gap-2.5 transition-colors ${
                      schoolType === 'PUBLIC_SCHOOL'
                        ? 'border-brand-primary bg-brand-primary/5 text-brand-primary font-semibold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <School className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="text-xs font-bold">Escola Pública</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                        Cotas SISU L1–L4
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSchoolType('PRIVATE_SCHOOL')}
                    className={`p-3 rounded-brand border text-left flex items-start gap-2.5 transition-colors ${
                      schoolType === 'PRIVATE_SCHOOL'
                        ? 'border-brand-primary bg-brand-primary/5 text-brand-primary font-semibold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <GraduationCap className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="text-xs font-bold">Escola Particular</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                        Bolsista ou Regular
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Target Degree */}
              <div className="space-y-1.5">
                <label
                  htmlFor="prof-targetdegree"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Curso / Carreira dos Sonhos
                </label>
                <input
                  id="prof-targetdegree"
                  type="text"
                  placeholder="Ex: Medicina, Direito, Ciência da Computação, Pedagogia"
                  value={targetDegree}
                  onChange={(e) => setTargetDegree(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-brand border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              {/* Daily Study Goal Target */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5 text-brand-primary" aria-hidden="true" />
                    Meta Diária de Estudos
                  </label>
                  <span className="text-xs font-mono font-bold text-brand-primary">
                    {dailyGoalTarget} questões / dia
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[3, 5, 10, 15].map((target) => (
                    <button
                      key={target}
                      type="button"
                      onClick={() => setDailyGoalTarget(target)}
                      className={`py-2 px-3 rounded-brand text-xs font-bold border transition-colors ${
                        dailyGoalTarget === target
                          ? 'bg-brand-primary text-white border-brand-primary shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {target} {target === 5 ? '★ Recomendada' : 'questões'}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400">
                  A meta padrão de 5 questões é calibrada para micro-aprendizagem consistente e manutenção do fogo da ofensiva.
                </p>
              </div>

              <div className="pt-3 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={updateProfileMutation.isPending || updateDailyGoalMutation.isPending}
                  className="text-xs sm:text-sm py-2 px-4"
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-1.5" aria-hidden="true" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar Alterações'
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Tab 2: Security & Password */}
          {activeTab === 'security' && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="sec-current-pw"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Senha Atual
                </label>
                <div className="relative">
                  <input
                    id="sec-current-pw"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 pr-10 text-sm rounded-brand border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label={showCurrentPassword ? 'Ocultar senha' : 'Exibir senha'}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="sec-new-pw"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Nova Senha (Mínimo 8 caracteres)
                </label>
                <div className="relative">
                  <input
                    id="sec-new-pw"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 pr-10 text-sm rounded-brand border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label={showNewPassword ? 'Ocultar senha' : 'Exibir senha'}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {newPassword && (
                  <div className="space-y-1 pt-1">
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${passwordStrength.score}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 flex justify-between">
                      <span>Força da senha</span>
                      <span className="font-bold">{passwordStrength.label}</span>
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="sec-confirm-pw"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Confirmar Nova Senha
                </label>
                <input
                  id="sec-confirm-pw"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm rounded-brand border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div className="pt-3 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={updateProfileMutation.isPending}
                  className="text-xs sm:text-sm py-2 px-4"
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-1.5" aria-hidden="true" />
                      Alterando senha...
                    </>
                  ) : (
                    'Atualizar Senha'
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Tab 3: Privacy & LGPD */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-brand bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/40 text-xs sm:text-sm text-indigo-900 dark:text-indigo-200 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-indigo-500" aria-hidden="true" />
                  Seus Direitos LGPD (Lei nº 13.709/2018)
                </p>
                <p className="text-xs text-indigo-700 dark:text-indigo-300">
                  O AprovaENEM garante transparência e controle soberano sobre seus dados cadastrais,
                  resoluções de questões, histórico TRI e progresso de estudos.
                </p>
              </div>

              {/* Data Portability (Art. 18, V) */}
              <div className="p-4 rounded-brand border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                      Portabilidade de Dados (Art. 18, V)
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                      Baixe um arquivo JSON estruturado contendo todos os seus dados cadastrais, simulados,
                      resoluções e conquistas.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleExportData}
                    disabled={exportUserDataMutation.isPending}
                    className="shrink-0 text-xs py-1.5 px-3"
                  >
                    {exportUserDataMutation.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    ) : (
                      <>
                        <Download className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                        Exportar JSON
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Account Erasure (Art. 18, VI) */}
              <div className="p-4 rounded-brand border border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/10 space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Eliminação Definitiva da Conta (Art. 18, VI)
                    </h3>
                    <p className="text-[11px] sm:text-xs text-rose-600/80 dark:text-rose-300/70">
                      Excluir permanentemente sua conta, ofensiva de estudos, nível, dados pessoais e
                      histórico de simulados. Esta ação é irreversível.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      onClose();
                      onOpenErasureModal?.();
                    }}
                    className="shrink-0 text-xs py-1.5 px-3 border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950"
                  >
                    Excluir Conta
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
