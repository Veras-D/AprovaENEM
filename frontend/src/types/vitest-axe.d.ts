import 'vitest';
import type { AxeMatchers } from 'vitest-axe/matchers';

declare module 'vitest' {
  interface Assertion<T = unknown> extends AxeMatchers {
    _vitestAxeAssertionMarker?: T;
  }
  interface AsymmetricMatchersContaining extends AxeMatchers {
    _vitestAxeMatcherMarker?: unknown;
  }
}
