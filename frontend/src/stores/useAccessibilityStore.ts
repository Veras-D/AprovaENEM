import { create } from 'zustand';
import type { TimeAccommodationMode } from '@/types';

export type FontScale = 100 | 125 | 150 | 175 | 200;
export type FontFamilyOption = 'standard' | 'dyslexic' | 'atkinson';
export type ContrastMode = 'normal' | 'high-contrast' | 'inverted';
export type ColorBlindnessType =
  | 'none'
  | 'protanopia'
  | 'deuteranopia'
  | 'tritanopia'
  | 'achromatopsia';

export interface AccessibilityPreferences {
  readonly fontScale: FontScale;
  readonly fontFamily: FontFamilyOption;
  readonly contrastMode: ContrastMode;
  readonly colorBlindness: ColorBlindnessType;
  readonly textSpacing: 'normal' | 'expanded';
  readonly highlightLinks: boolean;
  readonly readingRuler: boolean;
  readonly vlibrasEnabled: boolean;
  readonly timeMode: TimeAccommodationMode;
}

export interface AccessibilityState extends AccessibilityPreferences {
  readonly isToolbarOpen: boolean;
  readonly rulerY: number;

  readonly setFontScale: (scale: FontScale) => void;
  readonly setFontFamily: (family: FontFamilyOption) => void;
  readonly setContrastMode: (mode: ContrastMode) => void;
  readonly setColorBlindness: (type: ColorBlindnessType) => void;
  readonly toggleTextSpacing: () => void;
  readonly toggleHighlightLinks: () => void;
  readonly toggleReadingRuler: () => void;
  readonly setRulerY: (y: number) => void;
  readonly toggleVlibras: () => void;
  readonly setTimeMode: (mode: TimeAccommodationMode) => void;
  readonly setToolbarOpen: (open: boolean) => void;
  readonly toggleToolbar: () => void;
  readonly resetAccessibility: () => void;
}

export const DEFAULT_A11Y_PREFERENCES: AccessibilityPreferences = {
  fontScale: 100,
  fontFamily: 'standard',
  contrastMode: 'normal',
  colorBlindness: 'none',
  textSpacing: 'normal',
  highlightLinks: false,
  readingRuler: false,
  vlibrasEnabled: false,
  timeMode: 'STANDARD',
};

const STORAGE_KEY = 'aprovaenem_a11y_prefs';

/**
 * Injects accessibility attributes and CSS properties to documentElement
 */
export function applyAccessibilityToDocument(prefs: AccessibilityPreferences): void {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;

  // 1. Font Scaling (100% to 200%)
  root.setAttribute('data-font-scale', String(prefs.fontScale));
  root.style.fontSize = `${prefs.fontScale}%`;

  // 2. Font Family
  if (prefs.fontFamily === 'dyslexic') {
    root.setAttribute('data-dyslexic-font', 'true');
    root.style.setProperty('--brand-font', 'OpenDyslexic, "Comic Sans MS", sans-serif');
  } else if (prefs.fontFamily === 'atkinson') {
    root.setAttribute('data-dyslexic-font', 'true');
    root.style.setProperty('--brand-font', '"Atkinson Hyperlegible", sans-serif');
  } else {
    root.removeAttribute('data-dyslexic-font');
    root.style.removeProperty('--brand-font');
  }

  // 3. Contrast Mode
  if (prefs.contrastMode === 'high-contrast') {
    root.setAttribute('data-high-contrast', 'true');
    root.removeAttribute('data-inverted');
  } else if (prefs.contrastMode === 'inverted') {
    root.setAttribute('data-inverted', 'true');
    root.removeAttribute('data-high-contrast');
  } else {
    root.removeAttribute('data-high-contrast');
    root.removeAttribute('data-inverted');
  }

  // 4. Color Blindness (Daltonism)
  if (prefs.colorBlindness !== 'none') {
    root.setAttribute('data-colorblind', prefs.colorBlindness);
  } else {
    root.removeAttribute('data-colorblind');
  }

  // 5. Text Spacing (WCAG 1.4.12)
  if (prefs.textSpacing === 'expanded') {
    root.setAttribute('data-expanded-spacing', 'true');
  } else {
    root.removeAttribute('data-expanded-spacing');
  }

  // 6. Highlight Links
  if (prefs.highlightLinks) {
    root.setAttribute('data-highlight-links', 'true');
  } else {
    root.removeAttribute('data-highlight-links');
  }

  // Persist to localStorage
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Graceful fallback if localStorage is disabled or full
  }
}

/**
 * Loads stored accessibility preferences from localStorage
 */
export function loadStoredPreferences(): AccessibilityPreferences {
  if (typeof localStorage === 'undefined') {
    return DEFAULT_A11Y_PREFERENCES;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_A11Y_PREFERENCES;
    const parsed = JSON.parse(raw);
    return {
      fontScale: parsed.fontScale ?? DEFAULT_A11Y_PREFERENCES.fontScale,
      fontFamily: parsed.fontFamily ?? DEFAULT_A11Y_PREFERENCES.fontFamily,
      contrastMode: parsed.contrastMode ?? DEFAULT_A11Y_PREFERENCES.contrastMode,
      colorBlindness: parsed.colorBlindness ?? DEFAULT_A11Y_PREFERENCES.colorBlindness,
      textSpacing: parsed.textSpacing ?? DEFAULT_A11Y_PREFERENCES.textSpacing,
      highlightLinks: Boolean(parsed.highlightLinks),
      readingRuler: Boolean(parsed.readingRuler),
      vlibrasEnabled: Boolean(parsed.vlibrasEnabled),
      timeMode: parsed.timeMode ?? DEFAULT_A11Y_PREFERENCES.timeMode,
    };
  } catch {
    return DEFAULT_A11Y_PREFERENCES;
  }
}

const initialPrefs = loadStoredPreferences();

export const useAccessibilityStore = create<AccessibilityState>((set, get) => {
  // Initial hydration
  if (typeof window !== 'undefined') {
    applyAccessibilityToDocument(initialPrefs);
  }

  const updatePrefs = (partial: Partial<AccessibilityPreferences>) => {
    const next: AccessibilityPreferences = {
      fontScale: partial.fontScale ?? get().fontScale,
      fontFamily: partial.fontFamily ?? get().fontFamily,
      contrastMode: partial.contrastMode ?? get().contrastMode,
      colorBlindness: partial.colorBlindness ?? get().colorBlindness,
      textSpacing: partial.textSpacing ?? get().textSpacing,
      highlightLinks: partial.highlightLinks ?? get().highlightLinks,
      readingRuler: partial.readingRuler ?? get().readingRuler,
      vlibrasEnabled: partial.vlibrasEnabled ?? get().vlibrasEnabled,
      timeMode: partial.timeMode ?? get().timeMode,
    };
    applyAccessibilityToDocument(next);
    set(next);
  };

  return {
    ...initialPrefs,
    isToolbarOpen: false,
    rulerY: 200,

    setFontScale: (scale) => updatePrefs({ fontScale: scale }),
    setFontFamily: (family) => updatePrefs({ fontFamily: family }),
    setContrastMode: (mode) => updatePrefs({ contrastMode: mode }),
    setColorBlindness: (type) => updatePrefs({ colorBlindness: type }),
    toggleTextSpacing: () =>
      updatePrefs({ textSpacing: get().textSpacing === 'normal' ? 'expanded' : 'normal' }),
    toggleHighlightLinks: () => updatePrefs({ highlightLinks: !get().highlightLinks }),
    toggleReadingRuler: () => updatePrefs({ readingRuler: !get().readingRuler }),
    setRulerY: (y) => set({ rulerY: y }),
    toggleVlibras: () => updatePrefs({ vlibrasEnabled: !get().vlibrasEnabled }),
    setTimeMode: (mode) => updatePrefs({ timeMode: mode }),
    setToolbarOpen: (open) => set({ isToolbarOpen: open }),
    toggleToolbar: () => set({ isToolbarOpen: !get().isToolbarOpen }),
    resetAccessibility: () => {
      applyAccessibilityToDocument(DEFAULT_A11Y_PREFERENCES);
      set({ ...DEFAULT_A11Y_PREFERENCES });
    },
  };
});
