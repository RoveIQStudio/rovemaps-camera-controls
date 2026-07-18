// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { HandlerManager } from '../src/handlers/handlerManager';
import { makeTransform, makeHelper } from './helpers/handlerStubs';

describe('context menu suppression scope', () => {
  it('suppresses on the map element but NOT elsewhere on the page', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const hm = new HandlerManager(el, makeTransform(), makeHelper(), {});

    const outside = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    document.body.dispatchEvent(outside);
    expect(outside.defaultPrevented).toBe(false); // fails before fix

    const inside = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    el.dispatchEvent(inside);
    expect(inside.defaultPrevented).toBe(true);

    hm.dispose();
    const afterDispose = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    el.dispatchEvent(afterDispose);
    expect(afterDispose.defaultPrevented).toBe(false);
  });
});
