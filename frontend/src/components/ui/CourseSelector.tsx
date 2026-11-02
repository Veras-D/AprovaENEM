import React, { useState, useRef, useEffect, useId, useMemo } from 'react';
import { GraduationCap, ChevronDown, Check, X, Sparkles } from 'lucide-react';
import {
  SISU_COURSES,
  findSisuCourse,
  type SisuCourseConfig,
} from '@/features/profile/sisu-courses';

export interface CourseSelectorProps {
  readonly id?: string;
  readonly value: string;
  readonly onChange: (courseName: string) => void;
  readonly placeholder?: string;
  readonly label?: string;
  readonly hint?: string;
  readonly required?: boolean;
  readonly className?: string;
  readonly showBenchmarkCard?: boolean;
}

export const CourseSelector: React.FC<CourseSelectorProps> = ({
  id: propId,
  value,
  onChange,
  placeholder = 'Selecione ou digite seu curso pretendido...',
  label,
  hint,
  required = false,
  className = '',
  showBenchmarkCard = true,
}) => {
  const generatedId = useId();
  const inputId = propId || `course-selector-${generatedId}`;
  const listboxId = `course-listbox-${generatedId}`;

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Synchronize internal search term with external value changes
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  // Active matched configuration
  const matchedCourse = useMemo(() => findSisuCourse(value), [value]);

  // Filtered course list based on search term
  const filteredCourses = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return SISU_COURSES;
    return SISU_COURSES.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.areaLabel.toLowerCase().includes(term) ||
        c.primaryCompetency.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelectCourse = (course: SisuCourseConfig) => {
    onChange(course.name);
    setSearchTerm(course.name);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const handleClear = () => {
    onChange('');
    setSearchTerm('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setSearchTerm(newVal);
    onChange(newVal);
    setIsOpen(true);
    setHighlightedIndex(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex(0);
      return;
    }

    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredCourses.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredCourses.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredCourses.length) {
        const candidate = filteredCourses[highlightedIndex];
        if (candidate) {
          handleSelectCourse(candidate);
        }
      } else {
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative space-y-1.5 ${isOpen ? 'z-40' : 'z-10'} ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300"
        >
          {label}
          {required && <span className="text-rose-500 ml-1" aria-hidden="true">*</span>}
        </label>
      )}

      {/* Input Field with Trigger */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
        </div>

        <input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls={listboxId}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          className="w-full pl-9 pr-16 py-2.5 text-xs sm:text-sm rounded-brand border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors shadow-xs"
        />

        <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1">
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full focus:outline-none focus:ring-1 focus:ring-brand-primary"
              aria-label="Limpar curso selecionado"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded focus:outline-none"
            aria-label={isOpen ? 'Fechar lista de cursos' : 'Abrir lista de cursos'}
            tabIndex={-1}
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Autocomplete Dropdown Menu directly attached to input */}
        {isOpen && (
          <div
            id={listboxId}
            role="listbox"
            aria-label="Cursos de graduação do SISU"
            className="absolute z-50 left-0 right-0 top-full mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl py-1 focus:outline-none animate-in fade-in zoom-in-95 duration-100"
          >
            {filteredCourses.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-500 dark:text-slate-400">
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  Curso customizado: &quot;{searchTerm}&quot;
                </p>
                <p className="mt-0.5 text-[11px]">
                  Usaremos o padrão SISU (~700 pts / 70% de domínio) como meta inicial.
                </p>
              </div>
            ) : (
              filteredCourses.map((course, idx) => {
                const isSelected = value.toLowerCase() === course.name.toLowerCase();
                const isHighlighted = idx === highlightedIndex;
                const showAreaHeader = idx === 0 || course.area !== filteredCourses[idx - 1]?.area;

                return (
                  <React.Fragment key={course.id}>
                    {showAreaHeader && (
                      <div className="px-3 pt-2.5 pb-1 text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 bg-slate-50/90 dark:bg-slate-800/90 sticky top-0 backdrop-blur-xs border-y border-slate-100 dark:border-slate-800/60 first:border-t-0 select-none">
                        {course.areaLabel}
                      </div>
                    )}
                    <div
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelectCourse(course)}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      className={`px-3 py-2 cursor-pointer flex items-center justify-between text-xs sm:text-sm transition-colors select-none ${
                        isHighlighted
                          ? 'bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary dark:text-brand-primary'
                          : isSelected
                          ? 'bg-slate-100 dark:bg-slate-800/80 font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <span className="block font-medium truncate text-slate-900 dark:text-slate-100">
                          {course.name}
                        </span>
                        <span className="block text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          Foco: {course.primaryCompetency}
                        </span>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${
                          course.averageCutoff >= 750
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50'
                            : course.averageCutoff >= 680
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50'
                            : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}>
                          ~{course.averageCutoff} pts
                        </span>
                        {isSelected && <Check className="h-4 w-4 text-brand-primary shrink-0 stroke-[2.5]" />}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })
            )}
          </div>
        )}
      </div>

      {hint && !matchedCourse && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">{hint}</p>
      )}

      {/* Benchmark Badge Card */}
      {showBenchmarkCard && matchedCourse && (
        <div
          data-testid="sisu-benchmark-card"
          className="p-3 rounded-brand border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/20 text-xs space-y-1.5 animate-fade-up"
        >
          <div className="flex items-center justify-between font-bold text-emerald-900 dark:text-emerald-200">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              Meta SISU: {matchedCourse.name}
            </span>
            <span className="font-mono text-emerald-700 dark:text-emerald-300">
              Corte Médio: ~{matchedCourse.averageCutoff} pts
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 pt-0.5 border-t border-emerald-200/60 dark:border-emerald-800/40">
            <span>
              <strong>Meta de Domínio:</strong> {matchedCourse.masteryTarget}% de proficiência TRI
            </span>
            <span>
              <strong>Área Chave:</strong> {matchedCourse.primaryCompetency}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
