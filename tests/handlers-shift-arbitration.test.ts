// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { MousePanHandler } from '../src/handlers/mousePanHandler';
import { MouseRotatePitchHandler } from '../src/handlers/mouseRotatePitchHandler';
import { HandlerManager } from '../src/handlers/handlerManager';
import { makeTransform, makeHelper } from './helpers/handlerStubs';

function pev(type: string, init: PointerEventInit & { clientX?: number; clientY?: number }) {
  return new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 1, pointerType: 'mouse', ...init });
}

describe('shift+left-drag arbitration', () => {
  it('pan yields shift+left to box zoom when told to', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const t = makeTransform();
    const h = new MousePanHandler(el, t, makeHelper(), { yieldShiftLeft: true } as any);
    h.enable();
    el.dispatchEvent(pev('pointerdown', { button: 0, buttons: 1, shiftKey: true, clientX: 100, clientY: 100 }));
    window.dispatchEvent(pev('pointermove', { buttons: 1, shiftKey: true, clientX: 150, clientY: 150 }));
    expect(t.adjustCalls).toBe(0); // fails before fix
    h.destroy();
  });

  it('rotate/pitch yields shift+left but still works on the rotate button', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const helper = makeHelper();
    const h = new MouseRotatePitchHandler(el, makeTransform(), helper, { yieldToBoxZoomShift: true } as any);
    h.enable();

    el.dispatchEvent(pev('pointerdown', { button: 0, buttons: 1, shiftKey: true, clientX: 100, clientY: 100 }));
    window.dispatchEvent(pev('pointermove', { buttons: 1, shiftKey: true, clientX: 150, clientY: 150 }));
    expect(helper.calls.length).toBe(0); // fails before fix: shift+left pitched

    el.dispatchEvent(pev('pointerdown', { button: 2, buttons: 2, clientX: 100, clientY: 100 }));
    window.dispatchEvent(pev('pointermove', { buttons: 2, clientX: 150, clientY: 150 }));
    expect(helper.calls.length).toBeGreaterThan(0); // right-drag still rotates/pitches
    h.destroy();
  });

  it('with boxZoom:false, shift+left is pitch-only (pan yields to shift-pitch)', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const t = makeTransform();
    const helper = makeHelper();
    // Spy on the one method box zoom's onUp calls to run its fit.
    let boxZoomFitRan = false;
    const origCam = helper.cameraForBoxAndBearing;
    helper.cameraForBoxAndBearing = (...args: unknown[]) => { boxZoomFitRan = true; return origCam(...args); };
    const mgr = new HandlerManager(el, t, helper, { boxZoom: false, onChange: () => {} });

    el.dispatchEvent(pev('pointerdown', { button: 0, buttons: 1, shiftKey: true, clientX: 100, clientY: 100 }));
    window.dispatchEvent(pev('pointermove', { buttons: 1, shiftKey: true, clientX: 150, clientY: 150 }));
    window.dispatchEvent(pev('pointerup', { buttons: 0, shiftKey: true, clientX: 150, clientY: 150 }));

    expect(boxZoomFitRan).toBe(false); // box zoom handler was never constructed/enabled
    expect(t.zoom).toBe(0); // and no box-zoom fit mutated zoom
    expect(t.adjustCalls).toBe(0); // pan yielded shift+left to the active shift-pitch gesture
    const rpbz = helper.calls.find((c: unknown[]) => c[0] === 'rpbz');
    expect(rpbz).toBeDefined(); // pitch ran on shift+left
    expect(rpbz && (rpbz[2] as number)).not.toBe(0); // nonzero pitch delta
    mgr.dispose();
  });

  it('with defaults (box zoom enabled), shift+left drives neither pan nor pitch — box zoom owns it', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const t = makeTransform();
    const helper = makeHelper();
    const mgr = new HandlerManager(el, t, helper, { onChange: () => {} });

    el.dispatchEvent(pev('pointerdown', { button: 0, buttons: 1, shiftKey: true, clientX: 100, clientY: 100 }));
    window.dispatchEvent(pev('pointermove', { buttons: 1, shiftKey: true, clientX: 150, clientY: 150 }));

    expect(t.adjustCalls).toBe(0); // pan yielded shift+left to box zoom
    expect(helper.calls.some((c: unknown[]) => c[0] === 'rpbz')).toBe(false); // rotate/pitch yielded too
    mgr.dispose();
  });

  it('rightButtonPan mode: shift+right-drag pans only — no pitch double-handling', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const t = makeTransform();
    const helper = makeHelper();
    const hm = new HandlerManager(el, t, helper, { rightButtonPan: true });
    el.dispatchEvent(pev('pointerdown', { button: 2, buttons: 2, shiftKey: true, clientX: 100, clientY: 100 }));
    window.dispatchEvent(pev('pointermove', { buttons: 2, shiftKey: true, clientX: 150, clientY: 150 }));
    expect(t.adjustCalls).toBeGreaterThan(0); // secondary pan owns the drag
    expect(helper.calls.filter((c: any[]) => c[0] === 'rpbz').length).toBe(0); // fails before fix: pitch fired too
    hm.dispose();
  });
});
