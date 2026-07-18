// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { MousePanHandler } from '../src/handlers/mousePanHandler';
import { makeTransform, makeHelper } from './helpers/handlerStubs';

function pev(type: string, init: PointerEventInit & { clientX?: number; clientY?: number }) {
  return new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 1, pointerType: 'mouse', ...init });
}

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('mouse pan drag safety', () => {
  it('a pointercancel (tab-switch) ends the drag; buttonless moves do nothing after', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const t = makeTransform();
    const h = new MousePanHandler(el, t, makeHelper(), {});
    h.enable();

    el.dispatchEvent(pev('pointerdown', { button: 0, buttons: 1, clientX: 100, clientY: 100 }));
    window.dispatchEvent(pev('pointermove', { buttons: 1, clientX: 130, clientY: 130 }));
    const adjustsAfterDrag = t.adjustCalls;
    expect(adjustsAfterDrag).toBeGreaterThan(0);

    window.dispatchEvent(pev('pointercancel', {}));
    window.dispatchEvent(pev('pointermove', { buttons: 0, clientX: 200, clientY: 200 }));
    expect(t.adjustCalls).toBe(adjustsAfterDrag); // fails before fix: buttonless move keeps panning

    h.destroy();
  });

  it('a buttons===0 move mid-drag ends the drag (missed pointerup)', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const t = makeTransform();
    const h = new MousePanHandler(el, t, makeHelper(), {});
    h.enable();
    el.dispatchEvent(pev('pointerdown', { button: 0, buttons: 1, clientX: 100, clientY: 100 }));
    window.dispatchEvent(pev('pointermove', { buttons: 1, clientX: 130, clientY: 130 }));
    const n = t.adjustCalls;
    window.dispatchEvent(pev('pointermove', { buttons: 0, clientX: 160, clientY: 160 }));
    expect(t.adjustCalls).toBe(n);
    h.destroy();
  });

  it('a new grab cancels in-flight inertia', () => {
    let nextId = 1;
    const queue = new Map<number, FrameRequestCallback>();
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => { const id = nextId++; queue.set(id, cb); return id; });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => { queue.delete(id); });
    // Synchronous dispatches would give dt=0 and zero velocity — advance a fake
    // clock 20ms per performance.now() call so the flick builds real velocity.
    let clock = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => (clock += 20));
    const flush = () => { const cbs = [...queue.values()]; queue.clear(); cbs.forEach((cb) => cb(clock)); };

    const el = document.createElement('div');
    document.body.appendChild(el);
    const t = makeTransform();
    const h = new MousePanHandler(el, t, makeHelper(), {});
    h.enable();

    // Flick: down, fast moves, up -> schedules inertia
    el.dispatchEvent(pev('pointerdown', { button: 0, buttons: 1, clientX: 100, clientY: 100 }));
    window.dispatchEvent(pev('pointermove', { buttons: 1, clientX: 140, clientY: 100 }));
    window.dispatchEvent(pev('pointermove', { buttons: 1, clientX: 180, clientY: 100 }));
    window.dispatchEvent(pev('pointerup', { buttons: 0, clientX: 180, clientY: 100 }));
    expect(queue.size).toBeGreaterThan(0); // inertia scheduled

    // Immediately grab again — glide must stop dead
    el.dispatchEvent(pev('pointerdown', { button: 0, buttons: 1, clientX: 180, clientY: 100 }));
    const cx = t.center.x, cy = t.center.y;
    flush(); flush(); flush();
    expect(t.center.x).toBe(cx); // fails before fix: inertia keeps sliding under the held pointer
    expect(t.center.y).toBe(cy);
    h.destroy();
  });

  it('a cross-handler grab (right button) stops in-flight inertia', () => {
    let nextId = 1;
    const queue = new Map<number, FrameRequestCallback>();
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => { const id = nextId++; queue.set(id, cb); return id; });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => { queue.delete(id); });
    let clock = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => (clock += 20));
    const flush = () => { const cbs = [...queue.values()]; queue.clear(); cbs.forEach((cb) => cb(clock)); };

    const el = document.createElement('div');
    document.body.appendChild(el);
    const t = makeTransform();
    const h = new MousePanHandler(el, t, makeHelper(), {});
    h.enable();

    // Flick with the pan button (left) -> schedules inertia
    el.dispatchEvent(pev('pointerdown', { button: 0, buttons: 1, clientX: 100, clientY: 100 }));
    window.dispatchEvent(pev('pointermove', { buttons: 1, clientX: 140, clientY: 100 }));
    window.dispatchEvent(pev('pointermove', { buttons: 1, clientX: 180, clientY: 100 }));
    window.dispatchEvent(pev('pointerup', { buttons: 0, clientX: 180, clientY: 100 }));
    expect(queue.size).toBeGreaterThan(0); // inertia scheduled

    // A right-button down (rotate grab owned by another handler) must still stop the glide
    el.dispatchEvent(pev('pointerdown', { button: 2, buttons: 2, clientX: 180, clientY: 100 }));
    const cx = t.center.x, cy = t.center.y;
    flush(); flush(); flush();
    expect(t.center.x).toBe(cx); // fails before fix: right-button down never reaches inertia-cancel
    expect(t.center.y).toBe(cy);
    h.destroy();
  });

  it('a different pointer\'s buttonless hover does not cancel an active mouse drag', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const t = makeTransform();
    const h = new MousePanHandler(el, t, makeHelper(), {});
    h.enable();
    el.dispatchEvent(pev('pointerdown', { pointerId: 1, button: 0, buttons: 1, clientX: 100, clientY: 100 }));
    window.dispatchEvent(pev('pointermove', { pointerId: 1, buttons: 1, clientX: 130, clientY: 130 }));
    const n = t.adjustCalls;
    // pen hover: different pointerId, buttons 0 — must be ignored, not treated as a cancel
    window.dispatchEvent(pev('pointermove', { pointerId: 7, buttons: 0, clientX: 500, clientY: 500 }));
    window.dispatchEvent(pev('pointermove', { pointerId: 1, buttons: 1, clientX: 160, clientY: 160 }));
    expect(t.adjustCalls).toBeGreaterThan(n); // fails before fix: pen hover cancelled the drag
    h.destroy();
  });

  it('a foreign pointer\'s pointercancel does not cancel an active mouse drag; the owner\'s does', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const t = makeTransform();
    const h = new MousePanHandler(el, t, makeHelper(), {});
    h.enable();
    el.dispatchEvent(pev('pointerdown', { pointerId: 1, button: 0, buttons: 1, clientX: 100, clientY: 100 }));
    window.dispatchEvent(pev('pointermove', { pointerId: 1, buttons: 1, clientX: 130, clientY: 130 }));
    const n = t.adjustCalls;
    // palm-rejected touch: foreign pointerId cancel — must not tear down the mouse drag
    window.dispatchEvent(pev('pointercancel', { pointerId: 7 }));
    window.dispatchEvent(pev('pointermove', { pointerId: 1, buttons: 1, clientX: 160, clientY: 160 }));
    expect(t.adjustCalls).toBeGreaterThan(n); // fails before fix: foreign cancel killed the drag
    // the owning pointer's cancel still ends the drag
    const m = t.adjustCalls;
    window.dispatchEvent(pev('pointercancel', { pointerId: 1 }));
    window.dispatchEvent(pev('pointermove', { pointerId: 1, buttons: 1, clientX: 190, clientY: 190 }));
    expect(t.adjustCalls).toBe(m);
    h.destroy();
  });
});
