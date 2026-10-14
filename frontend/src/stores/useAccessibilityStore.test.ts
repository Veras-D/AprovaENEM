import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  useAccessibilityStore,
  DEFAULT_A11Y_PREFERENCES,
  applyAccessibilityToDocument,
  loadStoredPreferences,
} from './useAccessibilityStore';

describe('useAccessibilityStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useAccessibilityStore.getState().resetAccessibility();
    useAccessibilityStore.setState({ isToolbarOpen: false });
  });

  it('should initialize with default preferences', () => {
    const state = useAccessibilityStore.getState();
    expect(state.fontScale).toBe(100);
    expect(state.fontFamily).toBe('standard');
    expect(state.contrastMode).toBe('normal');
    expect(state.colorBlindness).toBe('none');
    expect(state.textSpacing).toBe('normal');
    expect(state.highlightLinks).toBe(false);
    expect(state.readingRuler).toBe(false);
    expect(state.vlibrasEnabled).toBe(false);
  });

  it('should update font scale and apply data attribute to document', () => {
    useAccessibilityStore.getState().setFontScale(150);

    expect(useAccessibilityStore.getState().fontScale).toBe(150);
    expect(document.documentElement.getAttribute('data-font-scale')).toBe('150');
    expect(document.documentElement.style.fontSize).toBe('150%');
  });

  it('should update font family and toggle data-dyslexic-font', () => {
    useAccessibilityStore.getState().setFontFamily('dyslexic');
    expect(useAccessibilityStore.getState().fontFamily).toBe('dyslexic');
    expect(document.documentElement.getAttribute('data-dyslexic-font')).toBe('true');

    useAccessibilityStore.getState().setFontFamily('atkinson');
    expect(useAccessibilityStore.getState().fontFamily).toBe('atkinson');
    expect(document.documentElement.getAttribute('data-dyslexic-font')).toBe('true');

    useAccessibilityStore.getState().setFontFamily('standard');
    expect(useAccessibilityStore.getState().fontFamily).toBe('standard');
    expect(document.documentElement.hasAttribute('data-dyslexic-font')).toBe(false);
  });

  it('should update contrast mode and toggle high-contrast or inverted', () => {
    useAccessibilityStore.getState().setContrastMode('high-contrast');
    expect(useAccessibilityStore.getState().contrastMode).toBe('high-contrast');
    expect(document.documentElement.getAttribute('data-high-contrast')).toBe('true');
    expect(document.documentElement.hasAttribute('data-inverted')).toBe(false);

    useAccessibilityStore.getState().setContrastMode('inverted');
    expect(useAccessibilityStore.getState().contrastMode).toBe('inverted');
    expect(document.documentElement.getAttribute('data-inverted')).toBe('true');
    expect(document.documentElement.hasAttribute('data-high-contrast')).toBe(false);

    useAccessibilityStore.getState().setContrastMode('normal');
    expect(document.documentElement.hasAttribute('data-high-contrast')).toBe(false);
    expect(document.documentElement.hasAttribute('data-inverted')).toBe(false);
  });

  it('should update color blindness type and apply data-colorblind attribute', () => {
    useAccessibilityStore.getState().setColorBlindness('protanopia');
    expect(document.documentElement.getAttribute('data-colorblind')).toBe('protanopia');

    useAccessibilityStore.getState().setColorBlindness('deuteranopia');
    expect(document.documentElement.getAttribute('data-colorblind')).toBe('deuteranopia');

    useAccessibilityStore.getState().setColorBlindness('none');
    expect(document.documentElement.hasAttribute('data-colorblind')).toBe(false);
  });

  it('should toggle text spacing and highlight links', () => {
    useAccessibilityStore.getState().toggleTextSpacing();
    expect(useAccessibilityStore.getState().textSpacing).toBe('expanded');
    expect(document.documentElement.getAttribute('data-expanded-spacing')).toBe('true');

    useAccessibilityStore.getState().toggleTextSpacing();
    expect(useAccessibilityStore.getState().textSpacing).toBe('normal');
    expect(document.documentElement.hasAttribute('data-expanded-spacing')).toBe(false);

    useAccessibilityStore.getState().toggleHighlightLinks();
    expect(useAccessibilityStore.getState().highlightLinks).toBe(true);
    expect(document.documentElement.getAttribute('data-highlight-links')).toBe('true');
  });

  it('should toggle reading ruler and set ruler Y position', () => {
    expect(useAccessibilityStore.getState().readingRuler).toBe(false);
    useAccessibilityStore.getState().toggleReadingRuler();
    expect(useAccessibilityStore.getState().readingRuler).toBe(true);

    useAccessibilityStore.getState().setRulerY(350);
    expect(useAccessibilityStore.getState().rulerY).toBe(350);
  });

  it('should toggle VLibras enabled state', () => {
    expect(useAccessibilityStore.getState().vlibrasEnabled).toBe(false);
    useAccessibilityStore.getState().toggleVlibras();
    expect(useAccessibilityStore.getState().vlibrasEnabled).toBe(true);
  });

  it('should toggle toolbar open and close', () => {
    expect(useAccessibilityStore.getState().isToolbarOpen).toBe(false);
    useAccessibilityStore.getState().toggleToolbar();
    expect(useAccessibilityStore.getState().isToolbarOpen).toBe(true);
    useAccessibilityStore.getState().setToolbarOpen(false);
    expect(useAccessibilityStore.getState().isToolbarOpen).toBe(false);
  });

  it('should reset all preferences to default', () => {
    useAccessibilityStore.getState().setFontScale(200);
    useAccessibilityStore.getState().setFontFamily('dyslexic');
    useAccessibilityStore.getState().setContrastMode('high-contrast');

    useAccessibilityStore.getState().resetAccessibility();

    const state = useAccessibilityStore.getState();
    expect(state.fontScale).toBe(100);
    expect(state.fontFamily).toBe('standard');
    expect(state.contrastMode).toBe('normal');
    expect(document.documentElement.getAttribute('data-font-scale')).toBe('100');
  });

  it('should gracefully handle localStorage errors in applyAccessibilityToDocument', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new Error('QuotaExceededError');
    });

    expect(() => applyAccessibilityToDocument(DEFAULT_A11Y_PREFERENCES)).not.toThrow();
    setItemSpy.mockRestore();
  });

  it('should return default preferences if localStorage is empty or corrupted', () => {
    localStorage.clear();
    expect(loadStoredPreferences()).toEqual(DEFAULT_A11Y_PREFERENCES);

    localStorage.setItem('aprovaenem_a11y_prefs', 'invalid-json{');
    expect(loadStoredPreferences()).toEqual(DEFAULT_A11Y_PREFERENCES);
  });
});
