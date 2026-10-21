import React, { useEffect, useRef } from 'react';
import { useAccessibilityStore, type FontScale, type ColorBlindnessType } from '@/stores/useAccessibilityStore';
import {
  Accessibility,
  X,
  Type,
  Eye,
  RotateCcw,
  AlignLeft,
  Link2,
  BookMarked,
  Sparkles,
} from 'lucide-react';
import { Select } from '@/components/ui/Select';

export const AccessibilityToolbar: React.FC = () => {
  const {
    fontScale,
    fontFamily,
    contrastMode,
    colorBlindness,
    textSpacing,
    highlightLinks,
    readingRuler,
    vlibrasEnabled,
    isToolbarOpen,
    setFontScale,
    setFontFamily,
    setContrastMode,
    setColorBlindness,
    toggleTextSpacing,
    toggleHighlightLinks,
    toggleReadingRuler,
    toggleVlibras,
    setToolbarOpen,
    resetAccessibility,
  } = useAccessibilityStore();

  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [shouldRender, setShouldRender] = React.useState<boolean>(isToolbarOpen);
  const [isClosing, setIsClosing] = React.useState<boolean>(false);

  useEffect(() => {
    if (isToolbarOpen) {
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
  }, [isToolbarOpen, shouldRender]);

  // Keyboard shortcut: Alt + A to toggle panel; Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        setToolbarOpen(!isToolbarOpen);
      } else if (e.key === 'Escape' && isToolbarOpen) {
        setToolbarOpen(false);
        triggerRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isToolbarOpen, setToolbarOpen]);

  // Trap focus inside panel when open
  useEffect(() => {
    if (isToolbarOpen && panelRef.current) {
      panelRef.current.focus();
    }
  }, [isToolbarOpen]);

  const fontScales: FontScale[] = [100, 125, 150, 175, 200];
  const colorBlindnessOptions: { id: ColorBlindnessType; label: string }[] = [
    { id: 'none', label: 'Padrão' },
    { id: 'protanopia', label: 'Protanopia (Vermelho)' },
    { id: 'deuteranopia', label: 'Deuteranopia (Verde)' },
    { id: 'tritanopia', label: 'Tritanopia (Azul)' },
    { id: 'achromatopsia', label: 'Acromatopsia (Monocromático)' },
  ];

  return (
    <>
      {/* Floating Action Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setToolbarOpen(!isToolbarOpen)}
        className={`fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 p-3.5 bg-brand-primary text-brand-primary-foreground rounded-full shadow-2xl hover:scale-105 active:scale-90 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-brand-accent flex items-center justify-center border-2 border-white/20 ${
          isToolbarOpen && !isClosing ? 'scale-95 ring-4 ring-brand-primary/30' : ''
        }`}
        aria-label="Menu de ferramentas de acessibilidade (Alt + A)"
        aria-expanded={isToolbarOpen}
        aria-controls="accessibility-panel"
      >
        <Accessibility
          className={`h-6 w-6 stroke-[2.2] transition-transform duration-300 ${
            isToolbarOpen && !isClosing ? 'rotate-12 scale-110' : 'rotate-0 scale-100'
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Accessible Floating Modal Panel */}
      {shouldRender && (
        <div
          ref={panelRef}
          id="accessibility-panel"
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-hidden={isClosing || undefined}
          aria-labelledby="a11y-panel-title"
          className={`fixed bottom-36 md:bottom-20 right-4 md:right-6 z-50 w-[92vw] max-w-sm bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-2xl shadow-2xl p-5 text-slate-800 dark:text-slate-100 max-h-[82vh] overflow-y-auto focus:outline-none ${
            isClosing ? 'animate-a11y-close pointer-events-none' : 'animate-a11y-open'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Accessibility className="h-5 w-5 text-brand-primary" aria-hidden="true" />
              <h2 id="a11y-panel-title" className="text-base font-bold">
                Acessibilidade Digital
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                setToolbarOpen(false);
                triggerRef.current?.focus();
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Fechar painel de acessibilidade"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="py-4 space-y-5 text-xs">
            {/* 1. Font Size Scaling */}
            <div className="space-y-2">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Type className="h-4 w-4 text-brand-primary" aria-hidden="true" />
                Tamanho da Fonte (Zoom de Texto)
              </label>
              <div
                className="grid grid-cols-5 gap-1.5"
                role="group"
                aria-label="Escala de fonte"
              >
                {fontScales.map((scale) => {
                  const isSelected = fontScale === scale;
                  return (
                    <button
                      key={scale}
                      type="button"
                      onClick={() => setFontScale(scale)}
                      className={`py-2 rounded-lg font-bold transition-all border ${
                        isSelected
                          ? 'bg-brand-primary text-brand-primary-foreground border-brand-primary shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                      aria-pressed={isSelected}
                    >
                      {scale}%
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Dyslexia Typography */}
            <div className="space-y-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                Tipografia Acessível
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setFontFamily('standard')}
                  className={`p-2 rounded-lg border font-medium transition-colors ${
                    fontFamily === 'standard'
                      ? 'bg-brand-primary text-brand-primary-foreground border-brand-primary font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent'
                  }`}
                  aria-pressed={fontFamily === 'standard'}
                >
                  Padrão
                </button>
                <button
                  type="button"
                  onClick={() => setFontFamily('dyslexic')}
                  className={`p-2 rounded-lg border font-medium transition-colors ${
                    fontFamily === 'dyslexic'
                      ? 'bg-brand-primary text-brand-primary-foreground border-brand-primary font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent'
                  }`}
                  aria-pressed={fontFamily === 'dyslexic'}
                >
                  OpenDyslexic
                </button>
                <button
                  type="button"
                  onClick={() => setFontFamily('atkinson')}
                  className={`p-2 rounded-lg border font-medium transition-colors ${
                    fontFamily === 'atkinson'
                      ? 'bg-brand-primary text-brand-primary-foreground border-brand-primary font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent'
                  }`}
                  aria-pressed={fontFamily === 'atkinson'}
                >
                  Atkinson
                </button>
              </div>
            </div>

            {/* 3. Contrast Modes */}
            <div className="space-y-2">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-brand-primary" aria-hidden="true" />
                Contraste & Esquema de Cores
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setContrastMode('normal')}
                  className={`p-2 rounded-lg border transition-colors ${
                    contrastMode === 'normal'
                      ? 'bg-brand-primary text-brand-primary-foreground border-brand-primary font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent'
                  }`}
                  aria-pressed={contrastMode === 'normal'}
                >
                  Padrão
                </button>
                <button
                  type="button"
                  onClick={() => setContrastMode('high-contrast')}
                  className={`p-2 rounded-lg border transition-colors ${
                    contrastMode === 'high-contrast'
                      ? 'bg-amber-400 text-black border-amber-500 font-extrabold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent'
                  }`}
                  aria-pressed={contrastMode === 'high-contrast'}
                >
                  Alto Contraste
                </button>
                <button
                  type="button"
                  onClick={() => setContrastMode('inverted')}
                  className={`p-2 rounded-lg border transition-colors ${
                    contrastMode === 'inverted'
                      ? 'bg-brand-primary text-brand-primary-foreground border-brand-primary font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent'
                  }`}
                  aria-pressed={contrastMode === 'inverted'}
                >
                  Invertido
                </button>
              </div>
            </div>

            {/* 4. Daltonism Filters */}
            <Select<ColorBlindnessType>
              id="daltonism-select"
              label="Filtros para Daltonismo"
              value={colorBlindness}
              onChange={(val) => setColorBlindness(val)}
              options={colorBlindnessOptions.map((opt) => ({
                value: opt.id,
                label: opt.label,
              }))}
            />

            {/* 5. Additional Visual & Reading Aids */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                Auxílios Visuais & Leitura
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={toggleTextSpacing}
                  className={`p-2 rounded-lg border flex items-center justify-center gap-1.5 text-center transition-colors ${
                    textSpacing === 'expanded'
                      ? 'bg-brand-primary text-brand-primary-foreground border-brand-primary font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent'
                  }`}
                  aria-pressed={textSpacing === 'expanded'}
                >
                  <AlignLeft className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  Espaçamento
                </button>

                <button
                  type="button"
                  onClick={toggleHighlightLinks}
                  className={`p-2 rounded-lg border flex items-center justify-center gap-1.5 text-center transition-colors ${
                    highlightLinks
                      ? 'bg-brand-primary text-brand-primary-foreground border-brand-primary font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent'
                  }`}
                  aria-pressed={highlightLinks}
                >
                  <Link2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  Destacar Links
                </button>

                <button
                  type="button"
                  onClick={toggleReadingRuler}
                  className={`p-2 rounded-lg border flex items-center justify-center gap-1.5 text-center transition-colors ${
                    readingRuler
                      ? 'bg-brand-primary text-brand-primary-foreground border-brand-primary font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent'
                  }`}
                  aria-pressed={readingRuler}
                >
                  <BookMarked className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  Guia de Foco
                </button>

                <button
                  type="button"
                  onClick={toggleVlibras}
                  className={`p-2 rounded-lg border flex items-center justify-center gap-1.5 text-center transition-colors ${
                    vlibrasEnabled
                      ? 'bg-brand-primary text-brand-primary-foreground border-brand-primary font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent'
                  }`}
                  aria-pressed={vlibrasEnabled}
                >
                  <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  VLibras 3D
                </button>
              </div>
            </div>
          </div>

          {/* Footer Reset & Shortkey */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={resetAccessibility}
              className="inline-flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 hover:underline font-semibold"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Restaurar Padrão
            </button>
            <span className="text-[10px] text-slate-400 font-mono">
              Atalho: <kbd className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">Alt+A</kbd>
            </span>
          </div>
        </div>
      )}
    </>
  );
};
