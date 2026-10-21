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
  const [isVisible, setIsVisible] = React.useState<boolean>(isToolbarOpen);

  useEffect(() => {
    if (isToolbarOpen) {
      setShouldRender(true);
      setIsClosing(false);
      let raf2 = 0;
      const raf1 = window.requestAnimationFrame(() => {
        raf2 = window.requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
      return () => {
        window.cancelAnimationFrame(raf1);
        window.cancelAnimationFrame(raf2);
      };
    }
    if (shouldRender) {
      setIsClosing(true);
      setIsVisible(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 360);
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
  const fontScaleIndex = Math.max(0, fontScales.indexOf(fontScale));
  const fontFamilyOrder = ['standard', 'dyslexic', 'atkinson'] as const;
  const fontFamilyIndex = Math.max(0, fontFamilyOrder.indexOf(fontFamily));
  const contrastOrder = ['normal', 'high-contrast', 'inverted'] as const;
  const contrastIndex = Math.max(0, contrastOrder.indexOf(contrastMode));
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
        className={`fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 p-3.5 bg-brand-primary text-brand-primary-foreground rounded-full shadow-2xl hover:scale-105 active:scale-90 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 flex items-center justify-center border border-white/25 ${
          isToolbarOpen && !isClosing ? 'scale-95 bg-brand-primary-dark' : ''
        }`}
        aria-label="Menu de ferramentas de acessibilidade (Alt + A)"
        aria-expanded={isToolbarOpen}
        aria-controls="accessibility-panel"
      >
        <Accessibility
          className={`h-6 w-6 stroke-[2.2] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isToolbarOpen && !isClosing ? 'rotate-12 scale-110' : 'rotate-0 scale-100'
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Accessible Floating Modal Panel with Speech Bubble Pointer */}
      {shouldRender && (
        <div
          aria-hidden={isClosing || undefined}
          className={`fixed bottom-[9.25rem] md:bottom-[5.25rem] right-4 md:right-6 z-50 w-[92vw] max-w-sm origin-[calc(100%-26px)_calc(100%+10px)] transition-[opacity,transform] duration-[360ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isVisible && !isClosing
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-2 scale-90 pointer-events-none'
          }`}
        >
          <div
            ref={panelRef}
            id="accessibility-panel"
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="a11y-panel-title"
            className="relative z-10 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-5 text-slate-800 dark:text-slate-100 max-h-[82vh] overflow-y-auto overflow-x-hidden scrollbar-none focus:outline-none"
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
            {/* 1. Font Size Scaling with 500ms Sliding Active Pill */}
            <div className="space-y-2">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Type className="h-4 w-4 text-brand-primary" aria-hidden="true" />
                Tamanho da Fonte (Zoom de Texto)
              </label>
              <div
                className="relative grid grid-cols-5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70"
                role="group"
                aria-label="Escala de fonte"
              >
                <div
                  aria-hidden="true"
                  style={{ transform: `translateX(${fontScaleIndex * 100}%)` }}
                  className="pointer-events-none absolute top-1 bottom-1 left-1 w-[calc((100%-0.5rem)/5)] rounded-lg bg-brand-primary shadow-sm transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                />
                {fontScales.map((scale) => {
                  const isSelected = fontScale === scale;
                  return (
                    <button
                      key={scale}
                      type="button"
                      onClick={() => setFontScale(scale)}
                      className={`relative z-10 py-2 rounded-lg font-bold transition-colors duration-300 cursor-pointer ${
                        isSelected
                          ? 'text-brand-primary-foreground'
                          : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                      }`}
                      aria-pressed={isSelected}
                    >
                      {scale}%
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Dyslexia Typography with 500ms Sliding Active Pill */}
            <div className="space-y-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                Tipografia Acessível
              </span>
              <div className="relative grid grid-cols-3 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70">
                <div
                  aria-hidden="true"
                  style={{ transform: `translateX(${fontFamilyIndex * 100}%)` }}
                  className="pointer-events-none absolute top-1 bottom-1 left-1 w-[calc((100%-0.5rem)/3)] rounded-lg bg-brand-primary shadow-sm transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                />
                <button
                  type="button"
                  onClick={() => setFontFamily('standard')}
                  className={`relative z-10 p-2 rounded-lg transition-colors duration-300 cursor-pointer ${
                    fontFamily === 'standard'
                      ? 'text-brand-primary-foreground font-bold'
                      : 'text-slate-700 dark:text-slate-300 font-medium hover:text-slate-900 dark:hover:text-white'
                  }`}
                  aria-pressed={fontFamily === 'standard'}
                >
                  Padrão
                </button>
                <button
                  type="button"
                  onClick={() => setFontFamily('dyslexic')}
                  className={`relative z-10 p-2 rounded-lg transition-colors duration-300 cursor-pointer ${
                    fontFamily === 'dyslexic'
                      ? 'text-brand-primary-foreground font-bold'
                      : 'text-slate-700 dark:text-slate-300 font-medium hover:text-slate-900 dark:hover:text-white'
                  }`}
                  aria-pressed={fontFamily === 'dyslexic'}
                >
                  OpenDyslexic
                </button>
                <button
                  type="button"
                  onClick={() => setFontFamily('atkinson')}
                  className={`relative z-10 p-2 rounded-lg transition-colors duration-300 cursor-pointer ${
                    fontFamily === 'atkinson'
                      ? 'text-brand-primary-foreground font-bold'
                      : 'text-slate-700 dark:text-slate-300 font-medium hover:text-slate-900 dark:hover:text-white'
                  }`}
                  aria-pressed={fontFamily === 'atkinson'}
                >
                  Atkinson
                </button>
              </div>
            </div>

            {/* 3. Contrast Modes with 500ms Sliding Active Pill */}
            <div className="space-y-2">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-brand-primary" aria-hidden="true" />
                Contraste & Esquema de Cores
              </label>
              <div className="relative grid grid-cols-3 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70">
                <div
                  aria-hidden="true"
                  style={{ transform: `translateX(${contrastIndex * 100}%)` }}
                  className={`pointer-events-none absolute top-1 bottom-1 left-1 w-[calc((100%-0.5rem)/3)] rounded-lg shadow-sm transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    contrastMode === 'high-contrast' ? 'bg-amber-400' : 'bg-brand-primary'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setContrastMode('normal')}
                  className={`relative z-10 p-2 rounded-lg transition-colors duration-300 cursor-pointer ${
                    contrastMode === 'normal'
                      ? 'text-brand-primary-foreground font-bold'
                      : 'text-slate-700 dark:text-slate-300 font-medium hover:text-slate-900 dark:hover:text-white'
                  }`}
                  aria-pressed={contrastMode === 'normal'}
                >
                  Padrão
                </button>
                <button
                  type="button"
                  onClick={() => setContrastMode('high-contrast')}
                  className={`relative z-10 p-2 rounded-lg transition-colors duration-300 cursor-pointer ${
                    contrastMode === 'high-contrast'
                      ? 'text-black font-extrabold'
                      : 'text-slate-700 dark:text-slate-300 font-medium hover:text-slate-900 dark:hover:text-white'
                  }`}
                  aria-pressed={contrastMode === 'high-contrast'}
                >
                  Alto Contraste
                </button>
                <button
                  type="button"
                  onClick={() => setContrastMode('inverted')}
                  className={`relative z-10 p-2 rounded-lg transition-colors duration-300 cursor-pointer ${
                    contrastMode === 'inverted'
                      ? 'text-brand-primary-foreground font-bold'
                      : 'text-slate-700 dark:text-slate-300 font-medium hover:text-slate-900 dark:hover:text-white'
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

          {/* Speech Bubble Pointer Arrow (centered at 26px from right to align with the 52px button) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-[7px] right-[19px] z-20 h-3.5 w-3.5 rotate-45 rounded-br-[3px] border-b border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
        </div>
      )}
    </>
  );
};
