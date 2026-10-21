import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Calendar,
  Layers,
  Clock,
  BookOpen,
  Calculator,
  Compass,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  OFFICIAL_EXAM_EDITIONS,
  type OfficialExamEdition,
} from '@/api/mocks/completed-exams';

export type SimulationDay = 'DAY_1' | 'DAY_2';
export type SimulationTiming = 'TIMED' | 'UNTIMED';
export type SimulationYearOption = number | 'MIXED';

export interface ExamSimulationConfig {
  year: SimulationYearOption;
  day: SimulationDay;
  timing: SimulationTiming;
}

export interface ExamSimulationModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onStartSimulation: (config: ExamSimulationConfig) => void;
  readonly availableEditions?: readonly OfficialExamEdition[];
}

export const ExamSimulationModal: React.FC<ExamSimulationModalProps> = ({
  isOpen,
  onClose,
  onStartSimulation,
  availableEditions,
}) => {
  const allEditions = useMemo(() => {
    return availableEditions ?? OFFICIAL_EXAM_EDITIONS;
  }, [availableEditions]);

  const completedEditions = useMemo(() => {
    return allEditions.filter((e) => e.isComplete);
  }, [allEditions]);

  const incompleteEditions = useMemo(() => {
    return allEditions.filter((e) => !e.isComplete);
  }, [allEditions]);

  const [selectedYear, setSelectedYear] = useState<SimulationYearOption>(() => {
    return completedEditions[0]?.year ?? 2023;
  });
  const [selectedDay, setSelectedDay] = useState<SimulationDay>('DAY_1');
  const [selectedTiming, setSelectedTiming] = useState<SimulationTiming>('TIMED');

  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);
  const [shouldRender, setShouldRender] = useState<boolean>(isOpen);
  const [isClosing, setIsClosing] = useState<boolean>(false);

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
      }, 150);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOpen, shouldRender]);

  // Keep selectedYear synced with available completed editions
  useEffect(() => {
    if (selectedYear === 'MIXED') return;
    if (completedEditions.length > 0 && !completedEditions.some((e) => e.year === selectedYear)) {
      const first = completedEditions[0];
      if (first) {
        setSelectedYear(first.year);
      }
    }
  }, [completedEditions, selectedYear]);

  // Focus trap & Escape hotkey for WCAG compliance
  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedElement.current = document.activeElement as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
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

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      previouslyFocusedElement.current?.focus();
    };
  }, [isOpen, onClose]);

  const isMixed = selectedYear === 'MIXED';

  const currentEdition = useMemo(() => {
    if (isMixed) return null;
    return completedEditions.find((e) => e.year === selectedYear) ?? completedEditions[0];
  }, [completedEditions, selectedYear, isMixed]);

  const currentDayQuestionCount = useMemo(() => {
    if (isMixed) return 90;
    if (!currentEdition) return 0;
    return selectedDay === 'DAY_1'
      ? currentEdition.day1QuestionCount
      : currentEdition.day2QuestionCount;
  }, [currentEdition, selectedDay, isMixed]);

  if (!shouldRender) return null;

  const handleConfirm = () => {
    if (completedEditions.length === 0) return;
    onStartSimulation({
      year: selectedYear,
      day: selectedDay,
      timing: selectedTiming,
    });
    onClose();
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 m-0"
      role="dialog"
      aria-modal="true"
      aria-hidden={isClosing || undefined}
      aria-labelledby="simulation-modal-title"
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

      <div
        ref={modalRef}
        className={`relative z-10 w-full max-w-xl bg-white dark:bg-slate-900 rounded-brand shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] ${
          isClosing
            ? 'animate-out fade-out zoom-out-95 duration-150'
            : 'animate-in fade-in zoom-in-95 duration-200'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
              <Layers className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="simulation-modal-title"
                className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100"
              >
                Simular Edição Oficial do ENEM
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Escolha o ano e o caderno de aplicação para treinar sob condições reais
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Fechar janela de simulação"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-sm">
          {/* Section 1: Year Selection */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-brand-primary" aria-hidden="true" />
              1. Ano da Prova (Edição do ENEM)
            </label>

            {completedEditions.length === 0 ? (
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-center text-xs text-slate-500 dark:text-slate-400">
                Nenhuma edição completa disponível para simulação no momento.
              </div>
            ) : (
              <div className="space-y-2">
                <div
                  className="flex flex-wrap gap-2"
                  role="radiogroup"
                  aria-label="Ano da edição do ENEM"
                >
                  {completedEditions.map((edition) => {
                    const isSelected = selectedYear === edition.year;
                    return (
                      <button
                        key={edition.year}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setSelectedYear(edition.year)}
                        className={`py-2 px-4 rounded-lg text-xs font-bold text-center transition-all border ${
                          isSelected
                            ? 'bg-brand-primary text-white border-brand-primary shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {edition.year}
                      </button>
                    );
                  })}

                  {/* Non-available editions shown as unselectable / disabled */}
                  {incompleteEditions.map((edition) => (
                    <button
                      key={edition.year}
                      type="button"
                      disabled
                      aria-disabled="true"
                      title={`ENEM ${edition.year} — Indisponível para simulação completa (amostra reduzida)`}
                      aria-label={`ENEM ${edition.year} (Indisponível)`}
                      className="py-2 px-4 rounded-lg text-xs font-bold text-center border border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-850 text-slate-400 dark:text-slate-500 cursor-not-allowed select-none opacity-50"
                    >
                      {edition.year}
                    </button>
                  ))}

                  {/* Mixed edition option (last) */}
                  <button
                    type="button"
                    role="radio"
                    aria-checked={isMixed}
                    onClick={() => setSelectedYear('MIXED')}
                    className={`py-2 px-4 rounded-lg text-xs font-bold text-center transition-all border flex items-center gap-1.5 ${
                      isMixed
                        ? 'bg-brand-primary text-white border-brand-primary shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Misto</span>
                  </button>
                </div>

                {isMixed && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    O Simulado Misto mescla questões de múltiplos anos mantendo a estrutura oficial: exatamente 90 questões por dia (45 por área do conhecimento).
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Day / Subject Selection */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Compass className="h-4 w-4 text-brand-primary" aria-hidden="true" />
              2. Dia de Prova & Áreas do Conhecimento
            </label>
            <div className="grid grid-cols-1 gap-2.5" role="radiogroup" aria-label="Dia e áreas de prova">
              {/* Dia 1 */}
              <button
                type="button"
                role="radio"
                aria-checked={selectedDay === 'DAY_1'}
                onClick={() => setSelectedDay('DAY_1')}
                className={`p-3 rounded-brand text-left transition-all border flex items-start justify-between gap-3 ${
                  selectedDay === 'DAY_1'
                    ? 'bg-brand-primary/5 dark:bg-brand-primary/10 border-brand-primary shadow-xs ring-1 ring-brand-primary/20'
                    : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5">
                    <BookOpen className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                        Dia 1 — Linguagens & Ciências Humanas
                      </span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 whitespace-nowrap shrink-0">
                        {isMixed
                          ? '90 questões'
                          : currentEdition
                          ? `${currentEdition.day1QuestionCount} questões`
                          : '1º Domingo'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Língua Portuguesa, Literatura, Língua Estrangeira (LC) + História, Geografia, Filosofia e Sociologia (CH).
                    </p>
                  </div>
                </div>
                {selectedDay === 'DAY_1' && (
                  <CheckCircle2 className="h-4 w-4 text-brand-primary shrink-0 mt-1" aria-hidden="true" />
                )}
              </button>

              {/* Dia 2 */}
              <button
                type="button"
                role="radio"
                aria-checked={selectedDay === 'DAY_2'}
                onClick={() => setSelectedDay('DAY_2')}
                className={`p-3 rounded-brand text-left transition-all border flex items-start justify-between gap-3 ${
                  selectedDay === 'DAY_2'
                    ? 'bg-brand-primary/5 dark:bg-brand-primary/10 border-brand-primary shadow-xs ring-1 ring-brand-primary/20'
                    : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                    <Calculator className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                        Dia 2 — Ciências da Natureza & Matemática
                      </span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 whitespace-nowrap shrink-0">
                        {isMixed
                          ? '90 questões'
                          : currentEdition
                          ? `${currentEdition.day2QuestionCount} questões`
                          : '2º Domingo'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Física, Química, Biologia (CN) + Matemática e suas Tecnologias (MT) com fórmulas e raciocínio lógico.
                    </p>
                  </div>
                </div>
                {selectedDay === 'DAY_2' && (
                  <CheckCircle2 className="h-4 w-4 text-brand-primary shrink-0 mt-1" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {/* Section 3: Timing Mode */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Clock className="h-4 w-4 text-brand-primary" aria-hidden="true" />
              3. Modo de Tempo & Cronômetro
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5" role="radiogroup" aria-label="Modo de tempo">
              <button
                type="button"
                role="radio"
                aria-checked={selectedTiming === 'TIMED'}
                onClick={() => setSelectedTiming('TIMED')}
                className={`p-3 rounded-brand text-left border transition-all ${
                  selectedTiming === 'TIMED'
                    ? 'bg-brand-primary/5 dark:bg-brand-primary/10 border-brand-primary ring-1 ring-brand-primary/20'
                    : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 flex items-center justify-between">
                  <span>Ritmo Oficial INEP</span>
                  {selectedTiming === 'TIMED' && <CheckCircle2 className="h-3.5 w-3.5 text-brand-primary" />}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Contagem regressiva de 3 min/questão simulando a pressão oficial da prova.
                </p>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={selectedTiming === 'UNTIMED'}
                onClick={() => setSelectedTiming('UNTIMED')}
                className={`p-3 rounded-brand text-left border transition-all ${
                  selectedTiming === 'UNTIMED'
                    ? 'bg-brand-primary/5 dark:bg-brand-primary/10 border-brand-primary ring-1 ring-brand-primary/20'
                    : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 flex items-center justify-between">
                  <span>Treino Livre (Sem Pressão)</span>
                  {selectedTiming === 'UNTIMED' && <CheckCircle2 className="h-3.5 w-3.5 text-brand-primary" />}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Sem contagem regressiva, ideal para estudo aprofundado e consulta com o Tutor IA.
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleConfirm}
            disabled={completedEditions.length === 0}
            className="flex items-center gap-1.5"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {isMixed
              ? `Iniciar Simulado Misto (${currentDayQuestionCount} questões)`
              : currentDayQuestionCount > 0
              ? `Iniciar Simulado Oficial (${currentDayQuestionCount} questões)`
              : 'Iniciar Simulado'}
          </Button>
        </div>
      </div>
    </div>
  );

  const portalRoot = typeof document !== 'undefined' ? document.getElementById('root') : null;
  return portalRoot ? createPortal(modalContent, portalRoot) : modalContent;
};
