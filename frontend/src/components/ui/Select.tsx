import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption<T extends string = string> {
  readonly value: T;
  readonly label: string;
  readonly description?: string;
  readonly icon?: React.ReactNode;
  readonly disabled?: boolean;
}

export interface SelectProps<T extends string = string> {
  readonly id?: string;
  readonly name?: string;
  readonly label?: string;
  readonly value: T;
  readonly onChange: (value: T) => void;
  readonly options: readonly SelectOption<T>[];
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly className?: string;
  readonly buttonClassName?: string;
  readonly size?: 'sm' | 'md' | 'lg';
  readonly 'aria-label'?: string;
}

export const Select = <T extends string = string>({
  id: explicitId,
  name,
  label,
  value,
  onChange,
  options,
  placeholder = 'Selecione uma opção...',
  disabled = false,
  className = '',
  buttonClassName = '',
  size = 'md',
  'aria-label': ariaLabel,
}: SelectProps<T>): React.ReactElement => {
  const generatedId = useId();
  const selectId = explicitId || generatedId;
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);

  const selectedIndex = options.findIndex((opt) => opt.value === value);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : null;
  const [focusedIndex, setFocusedIndex] = useState(selectedIndex >= 0 ? selectedIndex : 0);

  // Sync focused index when value changes
  useEffect(() => {
    if (selectedIndex >= 0) {
      setFocusedIndex(selectedIndex);
    }
  }, [selectedIndex]);

  // Click outside to dismiss popover
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Scroll active option into view when navigating via keyboard
  useEffect(() => {
    if (isOpen && listboxRef.current) {
      const activeElement = listboxRef.current.children[focusedIndex] as HTMLElement | undefined;
      if (typeof activeElement?.scrollIntoView === 'function') {
        activeElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [isOpen, focusedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
        setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0);
      }
      return;
    }

    if (e.key === 'Escape' || e.key === 'Tab') {
      setIsOpen(false);
      triggerRef.current?.focus();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev + 1) % options.length);
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev - 1 + options.length) % options.length);
      return;
    }

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const candidate = options[focusedIndex];
      if (candidate && !candidate.disabled) {
        onChange(candidate.value);
        setIsOpen(false);
        triggerRef.current?.focus();
      }
      return;
    }

    // Type-ahead by first letter
    if (e.key.length === 1 && /[a-zA-Z0-9]/.test(e.key)) {
      const char = e.key.toLowerCase();
      const matchIndex = options.findIndex((opt) =>
        opt.label.toLowerCase().startsWith(char)
      );
      if (matchIndex >= 0) {
        setFocusedIndex(matchIndex);
      }
    }
  };

  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-3 py-2 sm:py-2.5 text-xs sm:text-sm',
    lg: 'px-3.5 py-3 text-sm sm:text-base',
  }[size];

  return (
    <div ref={containerRef} className={`relative space-y-1 ${className}`}>
      {label && (
        <label
          id={`${selectId}-label`}
          htmlFor={selectId}
          className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
        >
          {label}
        </label>
      )}

      {/* Synchronized hidden native select for form posts, screen readers, and test helpers */}
      <select
        id={selectId}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        tabIndex={-1}
        aria-hidden="true"
        disabled={disabled}
        className="sr-only pointer-events-none absolute h-0 w-0 opacity-0"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Custom Accessible Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={`${selectId}-listbox`}
        aria-label={ariaLabel || placeholder}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className={`w-full rounded-brand border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary flex items-center justify-between gap-2 text-left disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span className={`truncate ${!selectedOption ? 'text-slate-400 dark:text-slate-500' : 'font-medium'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-brand-primary' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Custom Themed Popover Menu */}
      {isOpen && (
        <div
          id={`${selectId}-listbox`}
          ref={listboxRef}
          role="listbox"
          tabIndex={-1}
          aria-labelledby={label ? `${selectId}-label` : undefined}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-brand shadow-xl py-1 overflow-auto max-h-60 animate-in fade-in zoom-in-95 duration-100 focus:outline-none"
        >
          {options.map((opt, index) => {
            const isSelected = opt.value === value;
            const isFocused = index === focusedIndex;

            return (
              <div
                key={opt.value}
                id={`${selectId}-option-${opt.value}`}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  if (!opt.disabled) {
                    onChange(opt.value);
                    setIsOpen(false);
                    triggerRef.current?.focus();
                  }
                }}
                onMouseEnter={() => setFocusedIndex(index)}
                className={`px-3 py-2 text-xs sm:text-sm cursor-pointer flex items-center justify-between gap-2 transition-colors select-none ${
                  isSelected
                    ? 'bg-brand-primary/10 text-brand-primary font-semibold'
                    : isFocused
                    ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                } ${opt.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 truncate">
                    {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                    <span className="truncate">{opt.label}</span>
                  </div>
                  {opt.description && (
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {opt.description}
                    </span>
                  )}
                </div>

                {isSelected && (
                  <Check
                    className="h-4 w-4 text-brand-primary shrink-0 stroke-[2.5]"
                    aria-hidden="true"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
