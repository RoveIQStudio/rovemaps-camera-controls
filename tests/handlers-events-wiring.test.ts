// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { HandlerManager } from '../src/handlers/handlerManager';
import { makeTransform, makeHelper } from './helpers/handlerStubs';

describe('handler onChange wiring', () => {
  it('keyboard gestures reach the manager-level onChange by default', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const deltas: any[] = [];
    const hm = new HandlerManager(el, makeTransform(), makeHelper(), {
      onChange: (d) => deltas.push(d),
    });
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true }));
    expect(deltas.length).toBe(1); // fails before fix: keyboard constructed without onChange
    expect(deltas[0].axes.pan).toBe(true);
    hm.dispose();
  });
});
