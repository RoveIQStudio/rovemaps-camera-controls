// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { HandlerManager } from '../src/handlers/handlerManager';
import { makeTransform, makeHelper } from './helpers/handlerStubs';

function pev(type: string, init: PointerEventInit & { clientX?: number; clientY?: number }) {
  return new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 1, pointerType: 'mouse', ...init });
}

describe('explicit false disables handlers', () => {
  it('keyboard: false ignores keys', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const h = makeHelper();
    const hm = new HandlerManager(el, makeTransform(), h, { keyboard: false });
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true }));
    expect(h.calls.length).toBe(0); // fails before fix
    hm.dispose();
  });

  it('mousePan: false ignores left-drag', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const t = makeTransform();
    const hm = new HandlerManager(el, t, makeHelper(), { mousePan: false });
    el.dispatchEvent(pev('pointerdown', { button: 0, buttons: 1, clientX: 100, clientY: 100 }));
    window.dispatchEvent(pev('pointermove', { buttons: 1, clientX: 150, clientY: 150 }));
    expect(t.adjustCalls).toBe(0); // fails before fix
    hm.dispose();
  });

  it('dblclick: false ignores double-click', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const h = makeHelper();
    const hm = new HandlerManager(el, makeTransform(), h, { dblclick: false });
    el.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true, clientX: 100, clientY: 100 }));
    expect(h.calls.length).toBe(0); // fails before fix
    hm.dispose();
  });
});
