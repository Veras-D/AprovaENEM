import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Bot,
  RotateCcw,
  Send,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MathRenderer } from '@/components/math/MathRenderer';
import { RegisterModal } from '@/components/auth/RegisterModal';
import { SocraticQuotaWidget } from './SocraticQuotaWidget';
import { SocraticMessageBubble } from './SocraticMessageBubble';
import {
  useSocraticThreadQuery,
  useAskSocraticTutorMutation,
  useResetSocraticThreadMutation,
  useUpdatePlanMutation,
} from '@/api/hooks';
import { useAuthStore } from '@/stores/useAuthStore';
import { isProOrAdmin, SOCRATIC_STARTER_PROMPTS } from '../tutor-utils';
import type { UnifiedQuestion } from './QuestionCard';
import type { Question } from '@/types';
import type { SocraticMessageItemDto } from '@/api/types';

export interface SocraticTutorDrawerProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly question: UnifiedQuestion | Question;
  readonly className?: string;
}

export const SocraticTutorDrawer: React.FC<SocraticTutorDrawerProps> = ({
  isOpen,
  onClose,
  question,
  className = '',
}) => {
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isStatementExpanded, setIsStatementExpanded] = useState<boolean>(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);
  const [shouldRender, setShouldRender] = useState<boolean>(isOpen);
  const [isClosing, setIsClosing] = useState<boolean>(false);

  // Optimistic message & fluid streaming state
  const [optimisticUserMsg, setOptimisticUserMsg] = useState<SocraticMessageItemDto | null>(null);
  const [optimisticAssistantMsg, setOptimisticAssistantMsg] = useState<SocraticMessageItemDto | null>(null);
  const [isThinkingPhase, setIsThinkingPhase] = useState<boolean>(false);
  const [streamingAssistantId, setStreamingAssistantId] = useState<string | null>(null);

  const preSendCountRef = useRef<number>(0);
  const activeUserKeyRef = useRef<string | null>(null);
  const activeAssistantKeyRef = useRef<string | null>(null);
  const thinkingTimerRef = useRef<number | null>(null);

  const drawerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (thinkingTimerRef.current !== null) {
      window.clearTimeout(thinkingTimerRef.current);
      thinkingTimerRef.current = null;
    }
    setOptimisticUserMsg(null);
    setOptimisticAssistantMsg(null);
    setStreamingAssistantId(null);
    setIsThinkingPhase(false);
    preSendCountRef.current = 0;
    activeUserKeyRef.current = null;
    activeAssistantKeyRef.current = null;
  }, [question.id]);

  useEffect(() => {
    return () => {
      if (thinkingTimerRef.current !== null) {
        window.clearTimeout(thinkingTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
      return undefined;
    }
    if (shouldRender) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 180);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOpen, shouldRender]);

  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isPro = isProOrAdmin(user);

  // TanStack Query Hooks for Socratic AI Tutor
  const threadQuery = useSocraticThreadQuery(isOpen ? question.id : '');
  const askMutation = useAskSocraticTutorMutation(question.id);
  const resetMutation = useResetSocraticThreadMutation(question.id);
  const updatePlanMutation = useUpdatePlanMutation();

  const thread = threadQuery.data;
  const messages = React.useMemo(() => thread?.messages ?? [], [thread?.messages]);
  const remainingTurns = thread?.remainingTurns ?? 6;
  const maxTurns = thread?.maxTurns ?? 6;
  const isTurnQuotaExhausted = remainingTurns <= 0;

  const examYear = 'examYear' in question ? question.examYear : question.year;
  const disciplineName = question.discipline || 'ENEM';

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior, block: 'nearest' });
    }
  };

  // Compute rendered messages combining server history with optimistic & streaming turn
  const renderedMessages: SocraticMessageItemDto[] = React.useMemo(() => {
    if (isThinkingPhase && optimisticUserMsg) {
      const baseHistory =
        messages.length > preSendCountRef.current
          ? messages.slice(0, Math.max(0, messages.length - 2))
          : messages;
      return [...baseHistory, optimisticUserMsg];
    }

    if (messages.length > preSendCountRef.current && activeUserKeyRef.current && activeAssistantKeyRef.current) {
      const lastIdx = messages.length - 1;
      const secondLastIdx = messages.length - 2;
      return messages.map((msg, idx) => {
        if (idx === secondLastIdx && msg.role === 'user') {
          return { ...msg, id: activeUserKeyRef.current ?? msg.id };
        }
        if (idx === lastIdx && msg.role === 'assistant') {
          return { ...msg, id: activeAssistantKeyRef.current ?? msg.id };
        }
        return msg;
      });
    }

    if (optimisticUserMsg) {
      const list = [...messages, optimisticUserMsg];
      if (optimisticAssistantMsg) {
        list.push(optimisticAssistantMsg);
      }
      return list;
    }

    return [...messages];
  }, [messages, isThinkingPhase, optimisticUserMsg, optimisticAssistantMsg]);

  // Auto-scroll to latest message or typing indicator
  useEffect(() => {
    if (isOpen && (renderedMessages.length > 0 || isThinkingPhase || askMutation.isPending)) {
      scrollToBottom('smooth');
    }
  }, [renderedMessages.length, isThinkingPhase, askMutation.isPending, isOpen]);

  // Focus management and Escape key handling
  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus input or close button
    const timer = setTimeout(() => {
      textareaRef.current?.focus({ preventScroll: true });
    }, 150);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isResetConfirmOpen) {
          setIsResetConfirmOpen(false);
        } else {
          onClose();
        }
      }

      // Focus trapping
      if (e.key === 'Tab' && drawerRef.current) {
        const focusables = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const focusableElements = Array.from(focusables).filter(
          (el) => !el.hasAttribute('disabled') && el.offsetParent !== null
        );

        if (focusableElements.length > 0) {
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
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [isOpen, isResetConfirmOpen, onClose]);

  const handleSendMessage = (contentToSend?: string) => {
    const rawText = (contentToSend ?? inputMessage).trim();
    if (!rawText || askMutation.isPending || isThinkingPhase) return;

    // Enforce 1,000 character maximum limit (VULN-JAM2-18)
    const text = rawText.slice(0, 1000);

    if (!isAuthenticated) {
      setIsRegisterModalOpen(true);
      return;
    }

    if (isTurnQuotaExhausted) return;

    // Immediately clear input field and append optimistic user bubble
    setInputMessage('');
    preSendCountRef.current = messages.length;
    const userKey = `turn-user-${Date.now()}`;
    const assistantKey = `turn-assistant-${Date.now()}`;
    activeUserKeyRef.current = userKey;
    activeAssistantKeyRef.current = assistantKey;

    setOptimisticUserMsg({
      id: userKey,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    });
    setOptimisticAssistantMsg(null);
    setStreamingAssistantId(null);
    setIsThinkingPhase(true);

    const sendStartTime = Date.now();
    const isTestEnv = import.meta.env.MODE === 'test';

    askMutation.mutate(
      { message: text },
      {
        onSuccess: (data) => {
          const elapsed = Date.now() - sendStartTime;
          const remainingThinkingWait = isTestEnv ? 0 : Math.max(0, 900 - elapsed);

          const revealAssistantReply = () => {
            thinkingTimerRef.current = null;
            setOptimisticAssistantMsg({
              id: assistantKey,
              role: 'assistant',
              content: data.socraticResponse,
              timestamp: new Date().toISOString(),
              isFallback: data.isFallback,
            });
            setStreamingAssistantId(assistantKey);
            setIsThinkingPhase(false);
          };

          if (remainingThinkingWait > 0) {
            thinkingTimerRef.current = window.setTimeout(revealAssistantReply, remainingThinkingWait);
          } else {
            revealAssistantReply();
          }
        },
        onError: () => {
          if (thinkingTimerRef.current !== null) {
            window.clearTimeout(thinkingTimerRef.current);
            thinkingTimerRef.current = null;
          }
          setIsThinkingPhase(false);
          setOptimisticUserMsg(null);
          setOptimisticAssistantMsg(null);
          setInputMessage(text);
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetConfirm = () => {
    resetMutation.mutate(undefined, {
      onSuccess: () => {
        if (thinkingTimerRef.current !== null) {
          window.clearTimeout(thinkingTimerRef.current);
          thinkingTimerRef.current = null;
        }
        setOptimisticUserMsg(null);
        setOptimisticAssistantMsg(null);
        setStreamingAssistantId(null);
        setIsThinkingPhase(false);
        preSendCountRef.current = 0;
        activeUserKeyRef.current = null;
        activeAssistantKeyRef.current = null;
        setIsResetConfirmOpen(false);
      },
    });
  };

  if (!shouldRender) return null;

  const drawerContent = (
    <>
      <div
        className="fixed inset-0 z-50 flex justify-end m-0 p-0"
        role="dialog"
        aria-modal="true"
        aria-hidden={isClosing || undefined}
        aria-label="Tutor IA Socrático"
        aria-labelledby="tutor-drawer-title"
        aria-describedby="tutor-drawer-desc"
      >
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm m-0 ${
            isClosing
              ? 'animate-out fade-out duration-150'
              : 'animate-in fade-in duration-200'
          }`}
          onClick={onClose}
          aria-hidden="true"
          data-testid="socratic-drawer-backdrop"
        />

        {/* Slide-out Drawer */}
        <section
          ref={drawerRef}
          data-testid="socratic-tutor-drawer"
          className={`relative z-10 w-full sm:max-w-md md:max-w-lg lg:max-w-xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col focus:outline-hidden m-0 h-full ${
            isClosing
              ? 'animate-out slide-out-to-right duration-150'
              : 'animate-in slide-in-from-right duration-200'
          } ${className}`}
        >
        {/* Drawer Header */}
        <header className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
              <Bot className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="tutor-drawer-title"
                  className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5"
                >
                  <Sparkles className="h-4 w-4 text-brand-primary" aria-hidden="true" />
                  Tutor IA Socrático
                </h2>
                <Badge variant="outline" className="text-[11px] py-0 px-1.5 font-semibold">
                  ENEM {examYear}
                </Badge>
              </div>
              <p
                id="tutor-drawer-desc"
                className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[240px] sm:max-w-xs"
              >
                {disciplineName} &bull; Guia pedagógico reflexivo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Reset Conversation Button */}
            {messages.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsResetConfirmOpen(true)}
                disabled={resetMutation.isPending}
                className="text-xs h-8 px-2 text-slate-600 dark:text-slate-300"
                title="Reiniciar conversa"
                aria-label="Reiniciar conversa desta questão"
              >
                {resetMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                <span className="hidden sm:inline ml-1.5">Reiniciar</span>
              </Button>
            )}

            {/* Close Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 rounded-full"
              aria-label="Fechar Tutor Socrático"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </header>

        {/* Reset Confirmation Overlay Box */}
        {isResetConfirmOpen && (
          <div
            className="p-3 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/60 flex items-start justify-between gap-3 text-xs text-amber-900 dark:text-amber-200"
            role="alert"
          >
            <div className="space-y-1">
              <strong>Deseja reiniciar esta conversa?</strong>
              <p className="text-amber-800 dark:text-amber-300 text-[11px]">
                O histórico de mensagens desta questão será apagado e os 6 turnos serão restaurados.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsResetConfirmOpen(false)}
                className="text-xs h-7 px-2"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleResetConfirm}
                disabled={resetMutation.isPending}
                className="text-xs h-7 px-2.5 bg-rose-600 hover:bg-rose-700 text-white"
              >
                {resetMutation.isPending ? 'Reiniciando...' : 'Confirmar'}
              </Button>
            </div>
          </div>
        )}

        {/* Quota & Turn Indicator Bar */}
        <div className="px-4 py-2.5 bg-slate-100/70 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800">
          <SocraticQuotaWidget
            remainingTurns={remainingTurns}
            maxTurns={maxTurns}
            isGuest={!isAuthenticated}
            isPro={isPro}
            onRegisterGuest={() => setIsRegisterModalOpen(true)}
            onUpgradePro={() => {
              updatePlanMutation.mutate('PRO');
            }}
          />
        </div>

        {/* Collapsible Question Statement Snippet */}
        <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setIsStatementExpanded((prev) => !prev)}
            className="w-full px-4 py-2 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            aria-expanded={isStatementExpanded}
            aria-controls="question-statement-preview"
          >
            <span className="flex items-center gap-1.5">
              <HelpCircle className="h-3.5 w-3.5 text-brand-primary" aria-hidden="true" />
              Ver enunciado da questão
            </span>
            {isStatementExpanded ? (
              <ChevronUp className="h-4 w-4 text-slate-400" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden="true" />
            )}
          </button>

          {isStatementExpanded && (
            <div
              id="question-statement-preview"
              className="px-4 pb-3 pt-1 text-xs text-slate-600 dark:text-slate-300 max-h-48 overflow-y-auto border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50"
            >
              <MathRenderer content={question.statement} />
            </div>
          )}
        </div>

        {/* Socratic Pedagogical Disclaimer */}
        <div className="px-4 py-1.5 bg-brand-primary/5 dark:bg-brand-primary/10 border-b border-brand-primary/10 text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-brand-primary shrink-0" aria-hidden="true" />
          <span>
            O Tutor orienta passo a passo com perguntas reflexivas sem revelar o gabarito final.
          </span>
        </div>

        {/* Chat Message History */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-4"
          role="log"
          aria-label="Histórico de mensagens do Tutor Socrático"
        >
          {/* Empty Conversation Welcome State */}
          {renderedMessages.length === 0 && !askMutation.isPending && !isThinkingPhase && (
            <div className="py-6 px-2 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center mx-auto">
                <Bot className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Olá! Como posso te ajudar nesta questão?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Tire dúvidas sobre conceitos, fórmulas ou interpretação do texto. Eu guiarei seu raciocínio.
                </p>
              </div>

              {/* Starter Question Chips */}
              <div className="pt-2 space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 block uppercase tracking-wider">
                  Sugestões de perguntas:
                </span>
                <div className="flex flex-col gap-2">
                  {SOCRATIC_STARTER_PROMPTS.map((prompt, idx) => (
                    <button
                      key={`starter-prompt-${idx}`}
                      type="button"
                      onClick={() => handleSendMessage(prompt)}
                      disabled={isTurnQuotaExhausted}
                      className="text-left text-xs p-2.5 rounded-brand border border-slate-200 dark:border-slate-800 hover:border-brand-primary/40 hover:bg-brand-primary/5 dark:hover:bg-brand-primary/10 text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      &ldquo;{prompt}&rdquo;
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Render Messages */}
          {renderedMessages.map((msg) => (
            <SocraticMessageBubble
              key={msg.id}
              message={msg}
              animateStream={msg.id === streamingAssistantId}
              onStreamTick={() => scrollToBottom('auto')}
              onStreamComplete={() => {
                setStreamingAssistantId((prev) => (prev === msg.id ? null : prev));
              }}
            />
          ))}

          {/* Typing / Thinking Indicator */}
          {(askMutation.isPending || isThinkingPhase) && (
            <div
              className="flex justify-start gap-2.5 max-w-[90%] sm:max-w-[85%] mr-auto animate-fade-up"
              style={{ animationDuration: '320ms' }}
              role="status"
              aria-live="polite"
            >
              <div className="h-7 w-7 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <Bot className="h-4 w-4 animate-pulse" aria-hidden="true" />
              </div>
              <div className="flex flex-col items-start space-y-1">
                <div className="flex items-center gap-1.5 px-1">
                  <Sparkles className="h-3 w-3 text-brand-primary" aria-hidden="true" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Tutor Socrático
                  </span>
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-xs bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-2.5">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    Tutor Socrático pensando...
                  </span>
                  <span className="flex space-x-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-primary animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-primary animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-primary animate-bounce" />
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Mutation Error Alert */}
          {askMutation.isError && (
            <div
              className="p-3 rounded-brand bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-300 flex items-start justify-between gap-3"
              role="alert"
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" aria-hidden="true" />
                <div className="space-y-1">
                  <strong>Não foi possível obter resposta do tutor.</strong>
                  <p className="text-[11px]">
                    {(() => {
                      const errObj = askMutation.error as {
                        response?: { data?: { message?: string; detail?: string } };
                      } | null;
                      return (
                        errObj?.response?.data?.message ||
                        errObj?.response?.data?.detail ||
                        'Verifique sua conexão ou se seu limite diário foi atingido.'
                      );
                    })()}
                  </p>
                </div>
              </div>
              {!isPro && isAuthenticated && (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => updatePlanMutation.mutate('PRO')}
                  disabled={updatePlanMutation.isPending}
                  className="text-xs h-7 px-2.5 shrink-0 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white"
                >
                  {updatePlanMutation.isPending ? 'Ativando...' : 'Ativar Pro Grátis'}
                </Button>
              )}
            </div>
          )}

          <div ref={messagesEndRef} aria-hidden="true" />
        </div>

        {/* Input Footer Area */}
        <footer className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 space-y-2">
          {!isAuthenticated ? (
            <div className="p-3 rounded-brand bg-brand-primary/10 border border-brand-primary/20 text-center space-y-2">
              <p className="text-xs text-slate-800 dark:text-slate-200">
                <strong>Crie uma conta gratuita</strong> para enviar perguntas ao Tutor Socrático e salvar seu histórico.
              </p>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setIsRegisterModalOpen(true)}
                className="text-xs"
              >
                Cadastrar Grátis ou Entrar
              </Button>
            </div>
          ) : isTurnQuotaExhausted ? (
            <div className="p-2.5 rounded-brand bg-slate-100 dark:bg-slate-800 text-center text-xs text-slate-600 dark:text-slate-300">
              Limite de 6 turnos atingido para esta questão. Você pode{' '}
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(true)}
                className="text-brand-primary underline font-semibold"
              >
                reiniciar a conversa
              </button>{' '}
              ou avançar no simulado.
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-end gap-2"
            >
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value.slice(0, 1000))}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite sua dúvida sobre o conceito ou fórmula..."
                  rows={2}
                  maxLength={1000}
                  disabled={askMutation.isPending || isThinkingPhase || isTurnQuotaExhausted}
                  className="w-full resize-none p-2.5 pb-6 text-xs sm:text-sm rounded-brand border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-primary/50"
                  aria-label="Pergunta para o Tutor Socrático"
                />
                <div className="absolute bottom-1.5 left-2.5 right-2.5 flex justify-between items-center text-[10px] text-slate-400 pointer-events-none select-none">
                  <span className="hidden sm:inline">
                    Enter envia &bull; Shift+Enter quebra linha
                  </span>
                  <span
                    className={`ml-auto font-mono ${
                      inputMessage.length >= 1000
                        ? 'text-rose-500 font-semibold'
                        : inputMessage.length >= 900
                          ? 'text-amber-500'
                          : 'text-slate-400'
                    }`}
                    aria-live="polite"
                    aria-label={`Contador de caracteres: ${inputMessage.length} de 1000`}
                  >
                    {inputMessage.length}/1000
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || askMutation.isPending || isThinkingPhase || isTurnQuotaExhausted}
                className="h-10 px-3.5 shrink-0"
                aria-label="Enviar pergunta ao Tutor Socrático"
              >
                {askMutation.isPending || isThinkingPhase ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Send className="h-4 w-4" aria-hidden="true" />
                )}
              </Button>
            </form>
          )}
        </footer>
      </section>
    </div>

    {/* Register / Auth Modal Gate */}
    <RegisterModal
      isOpen={isRegisterModalOpen}
      onClose={() => setIsRegisterModalOpen(false)}
      initialMode="register"
    />
  </>
);

  const portalRoot = typeof document !== 'undefined' ? document.getElementById('root') : null;
  return portalRoot ? createPortal(drawerContent, portalRoot) : drawerContent;
};
