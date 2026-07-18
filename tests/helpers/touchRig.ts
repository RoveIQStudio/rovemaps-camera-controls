// tests/helpers/touchRig.ts
export type FakeTouch = { identifier: number; clientX: number; clientY: number };

function makeTouchList(points: FakeTouch[]) {
  return {
    length: points.length,
    item: (i: number) => points[i] ?? null,
  };
}

/**
 * Dispatch a touch event carrying a fake TouchList. happy-dom's TouchEvent
 * constructor is unreliable, so we ride on a plain Event and only supply what
 * TouchMultiHandler actually reads:
 *   - onDown/onMove read `e.touches` (length / .item(i)) and `e.preventDefault()`
 *   - onUp reads `e.changedTouches` (length / .item(i)) to know which fingers lifted
 * `points` populates BOTH lists (the handler never needs them to differ here),
 * so `dispatchTouch(window, 'touchend', [])` yields empty touches AND empty
 * changedTouches — no throw when onUp iterates the lifted set.
 */
export function dispatchTouch(
  target: EventTarget,
  type: 'touchstart' | 'touchmove' | 'touchend' | 'touchcancel',
  points: FakeTouch[],
) {
  const e = new Event(type, { bubbles: true, cancelable: true });
  const list = makeTouchList(points);
  Object.defineProperty(e, 'touches', { value: list });
  Object.defineProperty(e, 'changedTouches', { value: list });
  target.dispatchEvent(e);
  return e;
}
