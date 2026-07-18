import './helpers/nodePolyfill';
import { describe, it, expect, vi, afterEach } from 'vitest';
import * as THREE from 'three';
import { CameraController } from '../src/core/cameraController';
import { browser } from '../src/util/browser';

afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers(); });

function makeController(extra: Record<string, any> = {}) {
  const camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000);
  return new CameraController({
    camera,
    domElement: document.createElement('div') as any,
    useExternalAnimationLoop: true,
    ...extra,
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

  it('an absorbed rotate burst still applies the bearing snap the debounce would have', () => {
    vi.useFakeTimers();
    let fakeNow = 0;
    vi.spyOn(browser, 'now').mockImplementation(() => fakeNow);
    const ctl = makeController({ bearingSnap: 5 });
    ctl.jumpTo({ bearing: 3 });

    (ctl as any)._externalChange({ axes: { rotate: true } }); // rotate burst
    ctl.easeTo({ zoom: 2, duration: 100 });                   // zoom-only animation

    // The absorbed rotate burst must snap the bearing to 0 before the animation captures start.
    expect(ctl.getBearing()).toBe(0); // fails before fix: 3

    fakeNow = 200;
    ctl.update(); // zoom animation completes; bearing untouched
    expect(ctl.getBearing()).toBe(0);
    ctl.dispose();
  });

  it('a reduced-motion jump re-applies soft pan bounds (settle animation runs)', () => {
    vi.useFakeTimers();
    const fakeNow = 0;
    vi.spyOn(browser, 'now').mockImplementation(() => fakeNow);
    vi.spyOn(browser, 'reducedMotion').mockReturnValue(true);
    const ctl = makeController({
      softPanBounds: true,
      panBounds: { min: { x: -10, y: -10 }, max: { x: 10, y: 10 } },
    });

    ctl.easeTo({ center: { x: 50, y: 0 } }); // reduced motion -> instant jump outside bounds

    // The jump lands at x=50 (outside bounds); soft pan bounds must nudge back via a settle animation.
    expect(ctl.isMoving()).toBe(true); // fails before fix: false
    ctl.dispose();
  });

  it('a degenerate flyTo delegate forwards the absorbed gesture axes to easeTo', () => {
    vi.useFakeTimers();
    const fakeNow = 0;
    vi.spyOn(browser, 'now').mockImplementation(() => fakeNow);
    const ctl = makeController();
    let rotateEnded = false;
    ctl.on('rotateend', () => { rotateEnded = true; });

    (ctl as any)._externalChange({ axes: { rotate: true } }); // rotate burst
    // Degenerate flyTo: same center (no pan), zoom-only -> u1 < 1e-3 -> delegates to easeTo.
    ctl.flyTo({ center: { x: 0, y: 0 }, zoom: 3, duration: 100 });

    // The delegated easeTo does not continue rotate, so the absorbed rotate axis must be ended.
    expect(rotateEnded).toBe(true);       // fails before fix: axis leaks, no rotateend
    expect(ctl.isRotating()).toBe(false); // fails before fix: stuck true
    ctl.dispose();
  });

  it('a reduced-motion flyTo delegate forwards the absorbed gesture burst to easeTo', () => {
    vi.useFakeTimers();
    const fakeNow = 0;
    vi.spyOn(browser, 'now').mockImplementation(() => fakeNow);
    vi.spyOn(browser, 'reducedMotion').mockReturnValue(true);
    const ctl = makeController();
    const events: string[] = [];
    (['zoomend', 'moveend'] as const).forEach((t) => ctl.on(t, () => events.push(t)));

    (ctl as any)._externalChange({ axes: { zoom: true } }); // wheel-ish burst
    // Non-degenerate flyTo (real pan) under reduced motion -> delegates to easeTo({ animate: false }).
    ctl.flyTo({ center: { x: 50, y: 25 }, zoom: 4 });

    // The delegated easeTo must end the absorbed zoom burst (no leak).
    expect(events).toContain('zoomend');  // fails before fix: burst axis leaks, no zoomend
    expect(events).toContain('moveend');  // fails before fix: move lifecycle never closes
    expect(ctl.isZooming()).toBe(false);  // fails before fix: stuck true
    expect(ctl.isMoving()).toBe(false);   // fails before fix: stuck true
    // And the camera landed on the fully-resolved target.
    expect(ctl.getCenter().x).toBe(50);
    expect(ctl.getZoom()).toBe(4);
    ctl.dispose();
  });
});
