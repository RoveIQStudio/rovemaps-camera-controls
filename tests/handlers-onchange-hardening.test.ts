// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { KeyboardHandler } from '../src/handlers/keyboardHandler';
import { makeTransform, makeHelper } from './helpers/handlerStubs';

describe('onChange hardening', () => {
  it('an explicit onChange: undefined falls back to a noop instead of throwing', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const kb = new KeyboardHandler(el, makeTransform(), makeHelper(), { onChange: undefined } as any);
    kb.enable();
    expect(() =>
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true }))
    ).not.toThrow(); // fails before fix: this.opts.onChange is not a function
    kb.destroy();
  });
});
