// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { TouchMultiHandler } from '../src/handlers/touchMultiHandler';
import { makeTransform, makeHelper } from './helpers/handlerStubs';

describe('touch-action', () => {
  it('enable() sets touch-action: none and destroy() restores the prior value', () => {
    const el = document.createElement('div');
    el.style.touchAction = 'pan-y';
    document.body.appendChild(el);
    const t = new TouchMultiHandler(el, makeTransform(), makeHelper(), {});
    t.enable();
    expect(el.style.touchAction).toBe('none'); // fails before fix
    t.destroy();
    expect(el.style.touchAction).toBe('pan-y');
  });

  it('setTouchAction: false leaves the element style alone', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const t = new TouchMultiHandler(el, makeTransform(), makeHelper(), { setTouchAction: false } as any);
    t.enable();
    expect(el.style.touchAction).toBe('');
    t.destroy();
  });
});
