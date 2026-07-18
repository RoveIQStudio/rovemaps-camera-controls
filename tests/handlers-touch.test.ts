// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { TouchMultiHandler } from '../src/handlers/touchMultiHandler';
import { makeTransform, makeHelper } from './helpers/handlerStubs';
import { dispatchTouch } from './helpers/touchRig';

let active: TouchMultiHandler | null = null;

afterEach(() => {
  active?.destroy();
  active = null;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function setup() {
  let clock = 0;
  vi.spyOn(performance, 'now').mockImplementation(() => (clock += 30));
  const el = document.createElement('div');
  document.body.appendChild(el);
  const t = makeTransform();
  const deltas: any[] = [];
  const h = new TouchMultiHandler(el, t, makeHelper(), { onChange: (d: any) => deltas.push(d) });
  h.enable();
  active = h;
  return { el, t, h, deltas };
}

describe('touch gestures (real events, fake TouchList)', () => {
  it('single-finger drag pans in ground space', () => {
    const { el, t, deltas } = setup();
    // touchstart seeds the ground anchor under the finger; each move re-anchors
    // and applies (lastGround - nowGround) via adjustCenterByGroundDelta.
    dispatchTouch(el, 'touchstart', [{ identifier: 0, clientX: 100, clientY: 100 }]);
    dispatchTouch(window, 'touchmove', [{ identifier: 0, clientX: 140, clientY: 130 }]);
    dispatchTouch(window, 'touchmove', [{ identifier: 0, clientX: 180, clientY: 160 }]);
    expect(t.adjustCalls).toBeGreaterThan(0);
    expect(deltas.some((d) => d.axes.pan)).toBe(true);
    dispatchTouch(window, 'touchend', []);
  });

  it('two-finger pinch-out zooms in', () => {
    const { el, deltas } = setup();
    // Start 100px apart; spreading to 140px gives scaleZoom(1.4)=log2(1.4)≈0.485,
    // well past the default zoomThreshold (0.04), so zoom engages on the 2nd move.
    dispatchTouch(el, 'touchstart', [
      { identifier: 0, clientX: 350, clientY: 300 },
      { identifier: 1, clientX: 450, clientY: 300 },
    ]);
    // spread from 100px apart to 300px apart, several moves to cross thresholds
    for (let d = 100; d <= 300; d += 40) {
      dispatchTouch(window, 'touchmove', [
        { identifier: 0, clientX: 400 - d / 2, clientY: 300 },
        { identifier: 1, clientX: 400 + d / 2, clientY: 300 },
      ]);
    }
    expect(deltas.some((d) => d.axes.zoom)).toBe(true);
    dispatchTouch(window, 'touchend', []);
  });
});
