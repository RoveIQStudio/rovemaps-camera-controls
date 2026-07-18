// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { MousePanHandler } from '../src/handlers/mousePanHandler';
import { MouseRotatePitchHandler } from '../src/handlers/mouseRotatePitchHandler';
import { makeTransform, makeHelper } from './helpers/handlerStubs';

function pev(type: string, init: PointerEventInit & { clientX?: number; clientY?: number }) {
  return new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 1, pointerType: 'mouse', ...init });
}

describe('shift+left-drag arbitration', () => {
  it('pan yields shift+left to box zoom when told to', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const t = makeTransform();
    const h = new MousePanHandler(el, t, makeHelper(), { yieldToBoxZoomShift: true } as any);
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
});
