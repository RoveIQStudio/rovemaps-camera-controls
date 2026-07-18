// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { KeyboardHandler } from '../src/handlers/keyboardHandler';
import { makeTransform, makeHelper } from './helpers/handlerStubs';

function key(el: EventTarget, k: string) {
  el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
}

describe('keyboard handler scoping', () => {
  it('reacts to keys on its own element only, and makes it focusable', () => {
    const el1 = document.createElement('div');
    const el2 = document.createElement('div');
    document.body.appendChild(el1);
    document.body.appendChild(el2);
    const h1 = makeHelper(); const h2 = makeHelper();
    const kb1 = new KeyboardHandler(el1, makeTransform(), h1, {});
    const kb2 = new KeyboardHandler(el2, makeTransform(), h2, {});
    kb1.enable(); kb2.enable();

    expect(el1.tabIndex).toBe(0); // focusable for keyboard a11y

    key(el1, 'ArrowUp');
    expect(h1.calls.filter((c: any[]) => c[0] === 'pan').length).toBe(1);
    expect(h2.calls.length).toBe(0); // fails before fix: window listener fires both

    key(document.body, 'ArrowDown');
    expect(h1.calls.filter((c: any[]) => c[0] === 'pan').length).toBe(1); // unchanged — fails before fix

    kb1.destroy(); kb2.destroy();
  });

  it('still ignores editable targets inside the element', () => {
    const el = document.createElement('div');
    const input = document.createElement('input');
    el.appendChild(input);
    document.body.appendChild(el);
    const h = makeHelper();
    const kb = new KeyboardHandler(el, makeTransform(), h, {});
    kb.enable();
    key(input, 'ArrowUp'); // bubbles to el, but target is editable
    expect(h.calls.length).toBe(0);
    kb.destroy();
  });
});
