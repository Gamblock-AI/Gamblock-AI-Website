import '@testing-library/jest-dom/vitest';
// sonner (toast) touches browser-only APIs at import time; stub minimally.
if (typeof globalThis.matchMedia === 'undefined') {
  globalThis.matchMedia = ((q: string) => ({
    matches: false,
    media: q,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    onchange: null,
    dispatchEvent: () => false,
  })) as unknown as typeof globalThis.matchMedia;
}
