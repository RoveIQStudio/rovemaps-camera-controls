import './helpers/nodePolyfill';
import { describe, it, expect, vi, afterEach } from 'vitest';
import * as THREE from 'three';
import { CameraController } from '../src/core/cameraController';
import { browser } from '../src/util/browser';

afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers(); });

function makeController() {
  const camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000);
  return new CameraController({
    camera,
    domElement: document.createElement('div') as any,
    useExternalAnimationLoop: true,
  });
}

describe('external-gesture debounce vs programmatic animation', () => {
  it('an easeTo started inside the debounce window does not get its moveend swallowed', () => {
    vi.useFakeTimers();
    let fakeNow = 0;
    vi.spyOn(browser, 'now').mockImplementation(() => fakeNow);
    const ctl = makeController();
    const events: string[] = [];
    (['moveend', 'zoomend'] as const).forEach((t) => ctl.on(t, () => events.push(t)));

    (ctl as any)._externalChange({ axes: { zoom: true } }); // wheel-ish burst
    ctl.easeTo({ zoom: 2, duration: 100 });                 // within 120ms

    vi.advanceTimersByTime(150); // old timer would have fired here
    expect(events).toEqual([]);          // fails before fix: ['zoomend','moveend'] mid-animation
    expect(ctl.isMoving()).toBe(true);   // fails before fix: false

    fakeNow = 200;
    ctl.update(); // animation completes
    expect(events.filter((e) => e === 'moveend').length).toBe(1);
    expect(events.filter((e) => e === 'zoomend').length).toBe(1);
    ctl.dispose();
  });

  it('external axes the animation does not continue are ended at animation start', () => {
    vi.useFakeTimers();
    let fakeNow = 0;
    vi.spyOn(browser, 'now').mockImplementation(() => fakeNow);
    const ctl = makeController();
    const events: string[] = [];
    (['dragend', 'zoomend', 'zoomstart'] as const).forEach((t) => ctl.on(t, () => events.push(t)));

    (ctl as any)._externalChange({ axes: { pan: true } }); // drag burst
    ctl.easeTo({ zoom: 2, duration: 100 });                // zoom-only animation
    expect(events).toContain('dragend'); // pan axis ended at animation start — fails before fix

    fakeNow = 200;
    ctl.update();
    expect(events).toContain('zoomend');
    ctl.dispose();
  });

  it('an axis continued by the animation does not flicker end/start at the seam', () => {
    vi.useFakeTimers();
    let fakeNow = 0;
    vi.spyOn(browser, 'now').mockImplementation(() => fakeNow);
    const ctl = makeController();
    const events: string[] = [];
    (['zoomstart', 'zoomend'] as const).forEach((t) => ctl.on(t, () => events.push(t)));

    (ctl as any)._externalChange({ axes: { zoom: true } });
    ctl.easeTo({ zoom: 2, duration: 100 });
    // zoom started once (external), must not have ended/restarted at the seam
    expect(events).toEqual(['zoomstart']);
    vi.advanceTimersByTime(150); // pre-fix: the surviving debounce timer fires zoomend here
    expect(events).toEqual(['zoomstart']); // fails before fix: ['zoomstart','zoomend']
    fakeNow = 200;
    ctl.update();
    expect(events).toEqual(['zoomstart', 'zoomend']);
    ctl.dispose();
  });
});
