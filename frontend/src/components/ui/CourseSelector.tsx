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
    <div ref={containerRef} className={`relative space-y-1.5 ${className}`}>
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
          className="w-full pl-9 pr-16 py-2.5 text-xs sm:text-sm rounded-brand border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors"
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
      </div>

      {hint && !matchedCourse && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">{hint}</p>
      )}

      {/* Autocomplete Dropdown Menu */}
      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Cursos de graduação do SISU"
          className="absolute z-50 mt-1 w-full max-h-64 overflow-y-auto rounded-brand border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg py-1 animate-fade-down"
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

              return (
                <div
                  key={course.id}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelectCourse(course)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`px-3 py-2 cursor-pointer flex items-center justify-between text-xs sm:text-sm transition-colors ${
                    isHighlighted
                      ? 'bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary dark:text-brand-primary'
                      : isSelected
                      ? 'bg-slate-50 dark:bg-slate-800 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <span className="block font-medium truncate text-slate-900 dark:text-slate-100">
                      {course.name}
                    </span>
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {course.areaLabel} • Foco: {course.primaryCompetency}
                    </span>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50">
                      ~{course.averageCutoff} pts
                    </span>
                    {isSelected && <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                  </div>
                </div>
              );
            })
          )}
        </div>
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
