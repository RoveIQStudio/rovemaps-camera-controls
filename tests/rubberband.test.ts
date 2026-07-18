import { describe, it, expect } from 'vitest';
import { rubberbandDamp } from '../src/util/math';

describe('rubberband damping (library implementation)', () => {
  it('does not damp inside bounds', () => {
    expect(10 * rubberbandDamp(0, 0.5)).toBeCloseTo(10, 6);
  });
  it('damps progressively with overshoot', () => {
    expect(10 * rubberbandDamp(1, 0.5)).toBeLessThan(10);
    expect(10 * rubberbandDamp(2, 0.5)).toBeLessThan(10 * rubberbandDamp(1, 0.5));
  });
  it('damps more with higher strength', () => {
    expect(10 * rubberbandDamp(1, 1.0)).toBeLessThan(10 * rubberbandDamp(1, 0.5));
  });
});
