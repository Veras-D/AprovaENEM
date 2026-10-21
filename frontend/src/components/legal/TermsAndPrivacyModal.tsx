import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ShieldCheck,
  FileText,
  CheckCircle2,
  Lock,
  Download,
  Trash2,
  HeartHandshake,
  Loader2,
  AlertOctagon,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSessionStore } from '@/stores/useSessionStore';
import { useExportUserDataMutation } from '@/api/hooks';

export interface TermsAndPrivacyModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly initialTab?: 'terms' | 'privacy';
  readonly onOpenErasureModal?: () => void;
}

export const TermsAndPrivacyModal: React.FC<TermsAndPrivacyModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'terms',
  onOpenErasureModal,
}) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(initialTab);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const exportUserDataMutation = useExportUserDataMutation();
  const [exportStatus, setExportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [exportErrorMessage, setExportErrorMessage] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const contentInnerRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  // Sync initial tab and reset state when opening
  const [shouldRender, setShouldRender] = useState<boolean>(isOpen);
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [bodyHeight, setBodyHeight] = useState<number | undefined>(undefined);
  const [hasSwitchedTab, setHasSwitchedTab] = useState<boolean>(false);

  const handleSwitchTab = (nextTab: 'terms' | 'privacy') => {
    if (nextTab === activeTab) return;
    if (contentInnerRef.current && contentInnerRef.current.offsetHeight > 0) {
      setBodyHeight(contentInnerRef.current.offsetHeight);
    }
    setHasSwitchedTab(true);
    setActiveTab(nextTab);
  };

  useEffect(() => {
    if (!shouldRender || !hasSwitchedTab || !contentInnerRef.current) return undefined;
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
  }, [shouldRender, hasSwitchedTab, activeTab, exportErrorMessage]);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
      setHasSwitchedTab(false);
      setBodyHeight(undefined);
      setActiveTab(initialTab);
      setExportStatus('idle');
      setExportErrorMessage(null);
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
  }, [isOpen, initialTab, shouldRender]);

  // Accessibility: Focus trap & Escape key listener
  useEffect(() => {
    if (!isOpen) return;

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
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
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

    // Focus initial element
    const timer = setTimeout(() => {
      const closeBtn = modalRef.current?.querySelector<HTMLElement>('button[data-autofocus="true"]');
      closeBtn?.focus();
    }, 50);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      clearTimeout(timer);
      previouslyFocusedElement.current?.focus();
    };
  }, [isOpen, onClose]);

  const handleExportData = async () => {
    setExportStatus('loading');
    setExportErrorMessage(null);

    try {
      let exportPayload: Record<string, unknown>;
      let filenamePrefix: string;

      if (isAuthenticated) {
        exportPayload = await exportUserDataMutation.mutateAsync();
        filenamePrefix = 'aprovaenem-dados-estudante';
      } else {
        const sessionState = useSessionStore.getState();
        exportPayload = {
          legalBasis: 'LGPD Artigo 18, inciso V — Portabilidade de Dados (Sessão Anônima)',
          exportedAt: new Date().toISOString(),
          anonymousSessionId: sessionState.anonymousSessionId,
          attemptsCount: Object.keys(sessionState.attempts).length,
          attempts: sessionState.attempts,
          activeSession: sessionState.activeSession,
          notice: 'Estudante não autenticado. Estes dados representam seu histórico armazenado localmente no dispositivo.',
        };
        filenamePrefix = 'aprovaenem-dados-sessao-anonima';
      }

      const jsonStr = JSON.stringify(exportPayload, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${filenamePrefix}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      setExportStatus('success');
      setTimeout(() => {
        setExportStatus('idle');
      }, 4000);
    } catch {
      setExportStatus('error');
      setExportErrorMessage('Falha ao exportar os dados. Tente novamente em instantes.');
    }
  };

  if (!shouldRender) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 m-0"
      role="dialog"
      aria-modal="true"
      aria-hidden={isClosing || undefined}
      aria-labelledby="legal-modal-title"
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
        className={`relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-brand shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col z-10 overflow-hidden ${
          isClosing
            ? 'animate-out fade-out zoom-out-95 duration-150'
            : 'animate-in fade-in zoom-in-95 duration-200'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-brand bg-brand-primary/10 text-brand-primary">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="legal-modal-title"
                className="text-base sm:text-lg font-bold text-slate-900 dark:text-white"
              >
                Termos de Uso e Privacidade LGPD
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                AprovaENEM &bull; Lei Geral de Proteção de Dados (Lei nº 13.709/2018)
              </p>
            </div>
          </div>
          <button
            type="button"
            data-autofocus="true"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            aria-label="Fechar termos e privacidade"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Tab Navigation with Sliding Active Pill */}
        <div
          role="tablist"
          aria-label="Documentos legais"
          className="relative grid grid-cols-2 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/60 p-1.5 shrink-0"
        >
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-0.375rem)] rounded-brand bg-white dark:bg-slate-800 shadow-sm border border-brand-primary/30 dark:border-brand-primary/40 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              activeTab === 'privacy' ? 'translate-x-full' : 'translate-x-0'
            }`}
          />
          <button
            id="tab-terms"
            type="button"
            role="tab"
            aria-selected={activeTab === 'terms'}
            aria-controls="panel-terms"
            onClick={() => handleSwitchTab('terms')}
            className={`relative z-10 flex items-center justify-center gap-2 py-2.5 px-3 text-xs sm:text-sm font-bold rounded-brand transition-colors duration-300 cursor-pointer ${
              activeTab === 'terms'
                ? 'text-brand-primary'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Termos de Uso</span>
          </button>

          <button
            id="tab-privacy"
            type="button"
            role="tab"
            aria-selected={activeTab === 'privacy'}
            aria-controls="panel-privacy"
            onClick={() => handleSwitchTab('privacy')}
            className={`relative z-10 flex items-center justify-center gap-2 py-2.5 px-3 text-xs sm:text-sm font-bold rounded-brand transition-colors duration-300 cursor-pointer ${
              activeTab === 'privacy'
                ? 'text-brand-primary'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Lock className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Política de Privacidade & LGPD</span>
          </button>
        </div>

        {/* Scrollable Content Container (scrollbar hidden + smooth FLIP height transition) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none min-h-0">
          <div
            style={bodyHeight !== undefined ? { height: `${bodyHeight}px` } : undefined}
            className="transition-[height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden"
          >
            <div ref={contentInnerRef} className="p-4 sm:p-6 space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {/* TAB 1: TERMOS DE USO */}
          {activeTab === 'terms' && (
            <div
              id="panel-terms"
              role="tabpanel"
              aria-labelledby="tab-terms"
              className={`space-y-5 ${hasSwitchedTab ? 'animate-tab-from-left' : ''}`}
            >
              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <HeartHandshake className="h-4 w-4 text-brand-primary" aria-hidden="true" />
                  1. Finalidade Educacional e Princípio da Equidade
                </h3>
                <p>
                  A plataforma <strong>AprovaENEM</strong> tem como missão exclusiva democratizar a preparação para o Exame Nacional do Ensino Médio (ENEM) e o Sistema de Seleção Unificada (SISU). Nosso compromisso alinha-se aos Objetivos de Desenvolvimento Sustentável da ONU (ODS 4 — Educação de Qualidade e ODS 10 — Redução das Desigualdades). O acesso à biblioteca pública de questões é universal e gratuito.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  2. Conduta do Estudante e Uso Ético
                </h3>
                <p>
                  Ao utilizar a plataforma, você se compromete a:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  <li>Não realizar scraping, ataques de negação de serviço (DDoS) ou automação desautorizada de requisições.</li>
                  <li>Utilizar a tutoria com Inteligência Artificial Socrática de maneira colaborativa e formativa, com foco no aprendizado genuíno e raciocínio crítico.</li>
                  <li>Manter um ambiente de respeito mútuo nas ligas de ranking e não utilizar apelidos ofensivos, preconceituosos ou ilícitos.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  3. Acervo de Questões e Propriedade Intelectual
                </h3>
                <p>
                  Os enunciados e figuras das provas históricas do ENEM pertencem ao domínio público e ao acervo oficial do Instituto Nacional de Estudos e Pesquisas Educacionais Anísio Teixeira (INEP). As resoluções comentadas passo a passo, algoritmos de cálculo TRI, análises de distratores pedagógicos e software da plataforma são disponibilizados sob licença educacional aberta da AprovaENEM e parceiros.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  4. Redes e Escolas Parceiras (White-Label)
                </h3>
                <p>
                  Instituições de ensino básico e secretarias de educação conveniadas podem adotar a identidade visual white-label da AprovaENEM para suas turmas. Todas as diretrizes éticas, proteção à privacidade e gratuidade para o aluno aplicam-se integralmente a qualquer domínio institucional parceiro.
                </p>
              </section>
            </div>
          )}

          {/* TAB 2: POLÍTICA DE PRIVACIDADE & LGPD */}
          {activeTab === 'privacy' && (
            <div
              id="panel-privacy"
              role="tabpanel"
              aria-labelledby="tab-privacy"
              className={`space-y-5 ${hasSwitchedTab ? 'animate-tab-from-right' : ''}`}
            >
              {/* Highlight Banner: Data Minimization */}
              <div className="p-3.5 sm:p-4 rounded-brand bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-900 dark:text-emerald-100 flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                <div className="text-xs sm:text-sm">
                  <p className="font-bold">Minimização Extrema de Dados (LGPD Art. 6º, III)</p>
                  <p className="text-emerald-800 dark:text-emerald-200 mt-1">
                    Não solicitamos CPF, RG, número de telefone, cartão de crédito ou endereço. Exigimos unicamente nome, e-mail e dados acadêmicos voluntários para salvar seu histórico e calcular sua nota TRI.
                  </p>
                </div>
              </div>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  1. Proteção Integral do Adolescente (Art. 14 da LGPD)
                </h3>
                <p>
                  Todo tratamento de dados na AprovaENEM é realizado estritamente no <strong>melhor interesse do estudante adolescente</strong>.
                </p>
                <div className="p-3 rounded-brand bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 border-l-4 border-brand-primary">
                  <strong>Compromisso de Não-Comercialização:</strong> Jamais vendemos, alugamos ou repassamos seus dados ou histórico de estudos a cursos pré-vestibulares comerciais, faculdades privadas ou redes de publicidade direcionada.
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  2. Direitos do Titular de Dados (Artigo 18 da LGPD)
                </h3>
                <p>
                  Você mantém o controle total e soberano sobre os seus dados pessoais, assegurados pelas seguintes ferramentas de auto-atendimento na plataforma:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div className="p-3.5 rounded-brand border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                        <Download className="h-4 w-4 text-brand-primary" aria-hidden="true" />
                        <span>Portabilidade (Art. 18, V)</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                        Exporte a qualquer momento seus dados cadastrais, histórico de resoluções, XP, ofensivas e diagnósticos em formato JSON aberto, conforme garantido pela LGPD.
                      </p>
                    </div>
                    <div>
                      {isAuthenticated ? (
                        <button
                          type="button"
                          onClick={handleExportData}
                          disabled={exportStatus === 'loading'}
                          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-brand bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary text-xs font-semibold border border-brand-primary/30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary disabled:opacity-50"
                        >
                          {exportStatus === 'loading' ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                              <span>Exportando Dados...</span>
                            </>
                          ) : exportStatus === 'success' ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                              <span className="text-emerald-700 dark:text-emerald-300">Download Concluído!</span>
                            </>
                          ) : (
                            <>
                              <Download className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>Exportar Meus Dados (JSON)</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                          A exportação de dados cadastrais e histórico completo fica disponível após você entrar na sua conta.
                        </p>
                      )}
                      {exportErrorMessage && (
                        <div
                          role="alert"
                          className="mt-2 p-2 rounded-brand bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-[11px] flex items-center gap-1.5"
                        >
                          <AlertOctagon className="h-3 w-3 shrink-0" aria-hidden="true" />
                          <span>{exportErrorMessage}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-brand border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-rose-600 dark:text-rose-400">
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        <span>Eliminação Definitiva (Art. 18, VI)</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                        Exclua sua conta com salvaguardas de confirmação estritas. Todas as suas credenciais, simulados e mensagens com a tutoria socrática são expurgadas permanentemente.
                      </p>
                    </div>
                    <div>
                      {isAuthenticated ? (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenErasureModal?.();
                          }}
                          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-brand bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-900 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/80 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" aria-hidden="true" />
                          <span>Solicitar Exclusão de Conta</span>
                        </button>
                      ) : (
                        <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                          A solicitação de exclusão de dados cadastrais fica disponível após você entrar na sua conta.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  3. Cookies e Armazenamento Local
                </h3>
                <p>
                  Não usamos cookies de terceiros ou pixels de rastreamento de comportamento publicitário. Utilizamos exclusivamente o <code>localStorage</code> do seu navegador para armazenar informações indispensáveis:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <li>Sessão autenticada ou identificador efêmero de simulado anônimo.</li>
                  <li>Preferências de acessibilidade (escala de fonte, alto contraste, modo dislexia, régua de leitura).</li>
                  <li>Configurações de tema do parceiro educacional ativo.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  4. Atendimento e Exercício de Direitos (LGPD)
                </h3>
                <p className="text-xs sm:text-sm">
                  Em conformidade com a LGPD (Lei nº 13.709/2018), os direitos de confirmação, acesso, portabilidade e eliminação definitiva de dados pessoais são atendidos diretamente através dos recursos de autoatendimento da plataforma (opções de exportação e exclusão disponíveis nesta janela).
                </p>
              </section>
            </div>
          )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0 bg-slate-50 dark:bg-slate-900/80">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Última atualização: Outubro de 2026
          </span>
          <Button variant="primary" size="sm" onClick={onClose}>
            Entendido e Fechar
          </Button>
        </div>
      </div>
    </div>
  );
};
