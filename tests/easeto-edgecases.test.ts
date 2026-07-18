import { describe, it, expect, vi, afterEach } from 'vitest';

import './helpers/nodePolyfill';

import * as THREE from 'three';
import { CameraController } from '../src/core/cameraController';
import { browser } from '../src/util/browser';

afterEach(() => vi.restoreAllMocks());

function makeController() {
  const camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000);
  return new CameraController({
    camera,
    domElement: document.createElement('div') as any,
    useExternalAnimationLoop: true,
    width: 800,
    height: 600,
  });
}

describe('easeTo edge cases', () => {
  it('reduced motion still applies offset', () => {
    vi.spyOn(browser, 'reducedMotion').mockReturnValue(true);
    const ctl = makeController();
    // zoom 0 => scale 1, bearing 0 => offset {x:100} shifts center.x by -100
    ctl.easeTo({ offset: { x: 100, y: 0 } });
    // At zoom 0 / bearing 0, offset {x:100} shifts center.x by -100/scale.
    // If ThreePlanarTransform.scale is not exactly 1 at zoom 0, assert against
    // -(100 / (ctl.transform as any).scale) instead — the invariant under test
    // is that offset is not dropped (center.x must not remain 0).
    expect(ctl.getCenter().x).toBeCloseTo(-100 / ((ctl.transform as any).scale ?? 1), 6);
    expect(ctl.getCenter().x).not.toBe(0);
    ctl.dispose();
  });

  it('duration 0 with same-tick update lands exactly on target without NaN', () => {
    vi.spyOn(browser, 'now').mockReturnValue(1000);
    const ctl = makeController();
    ctl.easeTo({ zoom: 5, duration: 0 });
    ctl.update(); // now === t0 -> previously 0/0 = NaN
    expect(ctl.getZoom()).toBe(5);
    expect(Number.isFinite(ctl.getCenter().x)).toBe(true);
    ctl.dispose();
  });

  it('animate:false easeTo hard-cancels an in-flight animation (no resurrection)', () => {
    let fakeNow = 0;
    vi.spyOn(browser, 'now').mockImplementation(() => fakeNow);
    const ctl = makeController();

    ctl.easeTo({ zoom: 5, duration: 1000 });
    fakeNow = 100;
    ctl.update(); // advance the in-flight animation partway toward zoom 5

    let moveendCount = 0;
    ctl.on('moveend', () => moveendCount++);

    ctl.easeTo({ zoom: 2, animate: false }); // instant jump must supersede the glide
    fakeNow = 1100; // past the original end time
    ctl.update(); // a live loop would finish at 5 here — fails before fix

    expect(ctl.getZoom()).toBe(2);
    expect(ctl.isMoving()).toBe(false);
    expect(moveendCount).toBe(1);
    ctl.dispose();
  });

  it('reduced-motion easeTo hard-cancels an in-flight animation (no resurrection)', () => {
    let fakeNow = 0;
    vi.spyOn(browser, 'now').mockImplementation(() => fakeNow);
    const ctl = makeController();

    ctl.easeTo({ zoom: 5, duration: 1000 });
    fakeNow = 100;
    ctl.update();

    let moveendCount = 0;
    ctl.on('moveend', () => moveendCount++);

    vi.spyOn(browser, 'reducedMotion').mockReturnValue(true);
    ctl.easeTo({ zoom: 2 }); // reduced-motion -> instant jump, ordinary params
    fakeNow = 1100;
    ctl.update();

    expect(ctl.getZoom()).toBe(2);
    expect(ctl.isMoving()).toBe(false);
    expect(moveendCount).toBe(1);
    ctl.dispose();
  });
});
