import { describe, it, expect } from 'vitest';
import { createControllerForNext, isSSRStub } from '../src/public';

describe('SSR stub API completeness', () => {
  it('covers the client API without throwing on the server', () => {
    expect(typeof (globalThis as any).window).toBe('undefined');
    const ctl = createControllerForNext(() => {
      throw new Error('options thunk must not run on the server');
    });
    expect(isSSRStub(ctl)).toBe(true);
    expect(() => ctl.on('move', () => {})).not.toThrow();
    expect(() => ctl.off('move', () => {})).not.toThrow();
    expect(ctl.getZoom()).toBe(0);
    expect(ctl.getCenter()).toEqual({ x: 0, y: 0, z: 0 });
    expect(ctl.getPadding()).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
    expect(ctl.easeTo({ zoom: 3 })).toBe(ctl);
    expect(ctl.flyTo({ center: { x: 1, y: 2 } })).toBe(ctl);
    expect(ctl.jumpTo({ zoom: 1 })).toBe(ctl);
    expect(ctl.isMoving()).toBe(false);
    expect(ctl.getStateSnapshot().zoom).toBe(0);
    expect(ctl.transform).toBeTruthy();
    expect(ctl.transform.groundFromScreen({ x: 0, y: 0 })).toBeNull();
    expect(() => ctl.dispose()).not.toThrow();
  });
});
