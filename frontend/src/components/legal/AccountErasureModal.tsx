import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, Trash2, CheckCircle2, AlertOctagon, Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/useAuthStore';
import { useDeleteAccountMutation } from '@/api/hooks';

export interface AccountErasureModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSuccess?: () => void;
}

/**
 * Self-Service Account Erasure Modal (LGPD Art. 18, VI — Direito à Eliminação).
 * Implements strict multi-step confirmation safeguards to prevent accidental data loss:
 * 1. Explicit acknowledgment checkboxes
 * 2. Type-to-confirm text challenge ("EXCLUIR")
 * 3. Immediate state cleanup across Zustand and TanStack Query on success
 */
export const AccountErasureModal: React.FC<AccountErasureModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const deleteAccountMutation = useDeleteAccountMutation();

  const [hasAcknowledgedLoss, setHasAcknowledgedLoss] = useState(false);
  const [hasAcknowledgedIrreversible, setHasAcknowledgedIrreversible] = useState(false);
  const [confirmationInput, setConfirmationInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);
  const [shouldRender, setShouldRender] = useState<boolean>(isOpen);
  const [isClosing, setIsClosing] = useState<boolean>(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
      setHasAcknowledgedLoss(false);
      setHasAcknowledgedIrreversible(false);
      setConfirmationInput('');
      setErrorMessage(null);
      setIsSuccess(false);
      return;
    }
    if (shouldRender) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, shouldRender]);

  // Focus trap and Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedElement.current = document.activeElement as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !deleteAccountMutation.isPending) {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        if (!modalRef.current) return;
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
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
      const cancelBtn = modalRef.current?.querySelector<HTMLElement>('button[data-autofocus="true"]');
      cancelBtn?.focus();
    }, 50);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      clearTimeout(timer);
      previouslyFocusedElement.current?.focus();
    };
  }, [isOpen, onClose, deleteAccountMutation.isPending]);

  if (!shouldRender) return null;

  const isConfirmed =
    hasAcknowledgedLoss &&
    hasAcknowledgedIrreversible &&
    confirmationInput.trim().toUpperCase() === 'EXCLUIR';

  const handleDelete = async () => {
    if (!isConfirmed) return;
    setErrorMessage(null);

    try {
      await deleteAccountMutation.mutateAsync();
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2500);
    } catch {
      setErrorMessage(
        'Falha ao eliminar a conta. Verifique sua conexão com a internet e tente novamente.'
      );
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 m-0"
      role="dialog"
      aria-modal="true"
      aria-hidden={isClosing || undefined}
      aria-labelledby="erasure-modal-title"
      aria-describedby="erasure-modal-description"
    >
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-900/70 backdrop-blur-sm ${
          isClosing
            ? 'animate-out fade-out duration-150'
            : 'animate-in fade-in duration-200'
        }`}
        onClick={() => {
          if (!deleteAccountMutation.isPending && !isSuccess) {
            onClose();
          }
        }}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        ref={modalRef}
        className={`relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-brand shadow-2xl border border-rose-200 dark:border-rose-950 flex flex-col z-10 overflow-hidden ${
          isClosing
            ? 'animate-out fade-out zoom-out-95 duration-150'
            : 'animate-in fade-in zoom-in-95 duration-200'
        }`}
      >
        {/* Header Banner */}
        <div className="bg-rose-50 dark:bg-rose-950/40 p-4 sm:p-5 border-b border-rose-200 dark:border-rose-900 flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 shrink-0">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="erasure-modal-title"
                className="text-base sm:text-lg font-bold text-rose-950 dark:text-rose-100"
              >
                Eliminar Conta Definitivamente
              </h2>
              <p className="text-xs text-rose-700 dark:text-rose-300">
                Direito de Eliminação &bull; LGPD Art. 18, inciso VI
              </p>
            </div>
          </div>
          {!deleteAccountMutation.isPending && !isSuccess && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
              aria-label="Cancelar e fechar"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 text-sm text-slate-700 dark:text-slate-300">
          {isSuccess ? (
            <div className="py-6 text-center space-y-3 animate-in fade-in duration-200">
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Conta e Dados Eliminados com Sucesso
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                Conforme o Art. 18, VI da LGPD, todos os seus dados cadastrais, simulados e mensagens foram expurgados permanentemente dos nossos servidores.
              </p>
            </div>
          ) : !isAuthenticated ? (
            <div className="py-6 text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center">
                <ShieldAlert className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Nenhuma Conta Conectada
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                  A solicitação de exclusão definitiva de conta e dados cadastrais (LGPD Art. 18, VI) só pode ser realizada quando você estiver conectado à sua conta.
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <Button variant="outline" size="sm" onClick={onClose}>
                  Fechar
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Adolescent-Friendly Warning Description */}
              <div id="erasure-modal-description" className="space-y-2 text-xs sm:text-sm">
                <p className="font-semibold text-slate-900 dark:text-white">
                  {isAuthenticated && user ? `Olá, ${user.name}. ` : ''}
                  Esta ação é <span className="text-rose-600 dark:text-rose-400 font-bold">permanente e irreversível</span>.
                </p>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Ao confirmar a exclusão, os seguintes dados serão apagados imediatamente e não poderão ser recuperados:
                </p>
              </div>

              {/* Items Purged Bullet Card */}
              <div className="p-3.5 rounded-brand bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Trash2 className="h-3.5 w-3.5 text-rose-500 shrink-0" aria-hidden="true" />
                  <span>Seu cadastro, e-mail e dados de autenticação</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Trash2 className="h-3.5 w-3.5 text-rose-500 shrink-0" aria-hidden="true" />
                  <span>Pontos XP, nível de estudante e ofensivas diárias (streaks)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Trash2 className="h-3.5 w-3.5 text-rose-500 shrink-0" aria-hidden="true" />
                  <span>Histórico completo de simulados, resoluções e diagnósticos</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Trash2 className="h-3.5 w-3.5 text-rose-500 shrink-0" aria-hidden="true" />
                  <span>Histórico de conversas com a Inteligência Artificial Socrática</span>
                </div>
              </div>

              {/* Confirmation Safeguards Checkboxes */}
              <div className="space-y-3 pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={hasAcknowledgedLoss}
                    onChange={(e) => setHasAcknowledgedLoss(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 dark:border-slate-600 dark:bg-slate-800"
                  />
                  <span>
                    Estou ciente de que perderei definitivamente todo o meu histórico de estudos, notas TRI e medalhas.
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={hasAcknowledgedIrreversible}
                    onChange={(e) => setHasAcknowledgedIrreversible(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 dark:border-slate-600 dark:bg-slate-800"
                  />
                  <span>
                    Compreendo que esta eliminação não pode ser desfeita por nenhum canal de suporte.
                  </span>
                </label>
              </div>

              {/* Text Confirmation Challenge */}
              <div className="space-y-1.5 pt-1">
                <label
                  htmlFor="confirm-erasure-input"
                  className="block text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  Para confirmar, digite <span className="font-mono font-bold text-rose-600 dark:text-rose-400">EXCLUIR</span> no campo abaixo:
                </label>
                <input
                  id="confirm-erasure-input"
                  type="text"
                  value={confirmationInput}
                  onChange={(e) => setConfirmationInput(e.target.value)}
                  placeholder="EXCLUIR"
                  autoComplete="off"
                  className="w-full px-3 py-2 rounded-brand border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono uppercase"
                  disabled={deleteAccountMutation.isPending}
                />
              </div>

              {/* Error Alert Banner */}
              {errorMessage && (
                <div
                  role="alert"
                  className="p-3 rounded-brand bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2"
                >
                  <AlertOctagon className="h-4 w-4 text-rose-600 shrink-0" aria-hidden="true" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer Controls */}
        {!isSuccess && isAuthenticated && (
          <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0 bg-slate-50 dark:bg-slate-900/80">
            <Button
              type="button"
              variant="outline"
              size="sm"
              data-autofocus="true"
              onClick={onClose}
              disabled={deleteAccountMutation.isPending}
            >
              Cancelar
            </Button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={!isConfirmed || deleteAccountMutation.isPending}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-brand bg-rose-600 text-white text-xs sm:text-sm font-semibold hover:bg-rose-700 active:bg-rose-800 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              {deleteAccountMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>Eliminando Dados...</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="h-4 w-4" aria-hidden="true" />
                  <span>Eliminar Conta Definitivamente</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const portalRoot = typeof document !== 'undefined' ? document.getElementById('root') : null;
  return portalRoot ? createPortal(modalContent, portalRoot) : modalContent;
};
