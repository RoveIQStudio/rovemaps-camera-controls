// Node-env DOM polyfill (same pattern as tests/external-loop.test.ts).
// Import this FIRST — before three or any src module.
const g: any = globalThis as any;
if (!g.window) {
  g.window = {
    requestAnimationFrame: (cb: any) => setTimeout(() => cb(performance.now()), 16),
    cancelAnimationFrame: (h: any) => clearTimeout(h),
    matchMedia: () => ({ matches: false, addListener() {}, removeListener() {} }),
    addEventListener() {},
    removeEventListener() {},
  };
}
if (!g.navigator) g.navigator = { maxTouchPoints: 0 };
if (!g.document) {
  g.document = {
    body: { appendChild() {} },
    createElement: () => ({
      addEventListener() {},
      removeEventListener() {},
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 }),
      style: {},
      clientWidth: 800,
      clientHeight: 600,
    }),
  };
}
export {};
