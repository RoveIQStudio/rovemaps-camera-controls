// tests/helpers/rafQueue.ts — controllable RAF queue for node-env tests.
// Import FIRST (before three or any src module). Do NOT combine with nodePolyfill.
const g: any = globalThis as any;
let nextRafId = 1;
export const pending = new Map<number, FrameRequestCallback>();
g.window = {
  requestAnimationFrame: (cb: FrameRequestCallback) => { const id = nextRafId++; pending.set(id, cb); return id; },
  cancelAnimationFrame: (id: number) => { pending.delete(id); },
  matchMedia: () => ({ matches: false, addListener() {}, removeListener() {} }),
  addEventListener() {},
  removeEventListener() {},
};
if (!g.navigator) g.navigator = { maxTouchPoints: 0 };
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

export function flushFrames(now: number) {
  const cbs = [...pending.values()];
  pending.clear();
  for (const cb of cbs) cb(now);
}
