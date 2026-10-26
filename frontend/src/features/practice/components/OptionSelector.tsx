import React, { useEffect, useRef } from 'react';
import type { QuestionOptionLetter } from '@/types';
import { MathRenderer } from '@/components/math/MathRenderer';
import { CheckCircle2, XCircle } from 'lucide-react';

export interface OptionItem {
  readonly letter: QuestionOptionLetter;
  readonly text: string;
}

export interface OptionSelectorProps {
  readonly options: readonly OptionItem[];
  readonly selectedOption: QuestionOptionLetter | null;
  readonly onSelectOption: (letter: QuestionOptionLetter) => void;
  readonly disabled?: boolean;
  readonly correctOption?: QuestionOptionLetter | null;
  readonly isSubmitted?: boolean;
  readonly onSubmitAnswer?: () => void;
  readonly className?: string;
}

export const OptionSelector: React.FC<OptionSelectorProps> = ({
  options,
  selectedOption,
  onSelectOption,
  disabled = false,
  correctOption = null,
  isSubmitted = false,
  onSubmitAnswer,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard accessibility: hotkeys A-E / 1-5, Arrow navigation, and Enter submission
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Do not intercept browser shortcuts like Ctrl+C (copy), Cmd+C, Ctrl+A (select all)
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      // Enter hotkey to confirm answer if an option is selected
      if (e.key === 'Enter' && selectedOption && !isSubmitted && onSubmitAnswer) {
        e.preventDefault();
        onSubmitAnswer();
        return;
      }

      // Vertical arrow navigation between options
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const currentIndex = options.findIndex((opt) => opt.letter === selectedOption);
        const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % options.length;
        const nextOption = options[nextIndex];
        if (nextOption) {
          onSelectOption(nextOption.letter);
        }
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const currentIndex = options.findIndex((opt) => opt.letter === selectedOption);
        const prevIndex =
          currentIndex === -1
            ? options.length - 1
            : (currentIndex - 1 + options.length) % options.length;
        const prevOption = options[prevIndex];
        if (prevOption) {
          onSelectOption(prevOption.letter);
        }
        return;
      }

      const key = e.key.toUpperCase();
      const validLetters: QuestionOptionLetter[] = ['A', 'B', 'C', 'D', 'E'];
      const numberToLetter: Record<string, QuestionOptionLetter> = {
        '1': 'A',
        '2': 'B',
        '3': 'C',
        '4': 'D',
        '5': 'E',
      };

      let selectedLetter: QuestionOptionLetter | null = null;
      if (validLetters.includes(key as QuestionOptionLetter)) {
        selectedLetter = key as QuestionOptionLetter;
      } else if (numberToLetter[key]) {
        selectedLetter = numberToLetter[key];
      }

      if (selectedLetter) {
        const optionExists = options.some((opt) => opt.letter === selectedLetter);
        if (optionExists) {
          e.preventDefault();
          onSelectOption(selectedLetter);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, options, selectedOption, isSubmitted, onSelectOption, onSubmitAnswer]);

  return (
    <fieldset className="border-0 p-0 m-0">
      <legend className="sr-only">
        Alternativas da questão (Selecione uma opção de A a E)
      </legend>
      <div
        ref={containerRef}
        role="radiogroup"
        aria-label="Alternativas da questão"
        className={`space-y-3 ${className}`}
      >
        {options.map((option) => {
          const isSelected = selectedOption === option.letter;
          const isCorrect = isSubmitted && correctOption === option.letter;
          const isWrong =
            isSubmitted && isSelected && correctOption !== null && correctOption !== option.letter;

          let optionStyles =
            'border-slate-200 dark:border-slate-800 hover:border-brand-primary dark:hover:border-brand-primary bg-white dark:bg-slate-900';

          if (isSelected && !isSubmitted) {
            optionStyles =
              'border-brand-primary bg-brand-primary/5 dark:bg-brand-primary/10 shadow-sm ring-1 ring-brand-primary';
          } else if (isCorrect) {
            optionStyles =
              'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 ring-1 ring-emerald-500';
          } else if (isWrong) {
            optionStyles =
              'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100 ring-1 ring-rose-500';
          }

          let badgeStyles = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
          if (isSelected && !isSubmitted) {
            badgeStyles = 'bg-brand-primary text-brand-primary-foreground font-bold shadow-sm';
          } else if (isCorrect) {
            badgeStyles = 'bg-emerald-600 text-white font-bold';
          } else if (isWrong) {
            badgeStyles = 'bg-rose-600 text-white font-bold';
          }

          return (
            <button
              key={option.letter}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onSelectOption(option.letter)}
              className={`w-full text-left p-3.5 sm:p-4 rounded-brand border-2 flex items-start justify-between gap-3.5 transition-all duration-150 active:scale-[0.995] disabled:active:scale-100 min-h-[52px] group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${optionStyles}`}
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                {/* Option Letter Pill */}
                <span
                  className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 transition-all duration-150 ${
                    isSelected ? 'scale-105' : 'group-hover:scale-105'
                  } ${badgeStyles}`}
                >
                  {option.letter}
                </span>

                {/* Option Statement with LaTeX Support */}
                <div className="text-sm font-medium leading-relaxed flex-1 text-slate-800 dark:text-slate-100 pt-0.5 break-words">
                  <MathRenderer content={option.text} disableInteractive />
                </div>
              </div>

              {/* Submission Status Indicator */}
              {isCorrect && (
                <CheckCircle2
                  className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-1"
                  aria-hidden="true"
                />
              )}
              {isWrong && (
                <XCircle
                  className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-1"
                  aria-hidden="true"
                />
              )}

              {/* Subtle hotkey indicator */}
              {!isSubmitted && (
                <span className="hidden sm:inline-block text-[10px] font-mono uppercase text-slate-400 dark:text-slate-500 mt-1">
                  [{option.letter}]
                </span>
              )}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
};
