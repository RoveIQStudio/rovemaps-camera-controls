// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { DblclickHandler } from '../src/handlers/dblclickHandler';
import { makeTransform, makeHelper } from './helpers/handlerStubs';

afterEach(() => vi.restoreAllMocks());

describe('double-tap zoom dedup', () => {
  it('a browser-synthesized dblclick right after a touch double-tap does not zoom twice', () => {
    let clock = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => (clock += 50));
    const el = document.createElement('div');
    document.body.appendChild(el);
    const h = makeHelper();
    const dbl = new DblclickHandler(el, makeTransform(), h, {});
    dbl.enable();
    const tap = (x: number, y: number) =>
      el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, pointerType: 'touch', clientX: x, clientY: y }));
    tap(100, 100);
    tap(102, 101); // second tap within 300ms/25px -> manual double-tap zoom
    const zoomsAfterTap = h.calls.filter((c: any[]) => c[0] === 'rpbz').length;
    expect(zoomsAfterTap).toBe(1);
    // browser now synthesizes dblclick from the same gesture
    el.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true, clientX: 102, clientY: 101 }));
    expect(h.calls.filter((c: any[]) => c[0] === 'rpbz').length).toBe(1); // fails before fix: 2
    dbl.destroy();
  });

  it('a genuine mouse dblclick with no preceding touch tap still zooms', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const h = makeHelper();
    const dbl = new DblclickHandler(el, makeTransform(), h, {});
    dbl.enable();
    el.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true, clientX: 50, clientY: 50 }));
    expect(h.calls.filter((c: any[]) => c[0] === 'rpbz').length).toBe(1);
    dbl.destroy();
  });
});
