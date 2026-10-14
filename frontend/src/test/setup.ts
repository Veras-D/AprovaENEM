import '@testing-library/jest-dom';

// Polyfill crypto.randomUUID if running in non-secure test context
if (!globalThis.crypto?.randomUUID) {
  Object.defineProperty(globalThis, 'crypto', {
    value: {
      randomUUID: () => 'test-uuid-1234-5678-9012',
    },
  });
}
