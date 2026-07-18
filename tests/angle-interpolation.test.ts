import './helpers/nodePolyfill';
import { describe, it, expect, vi, afterEach } from 'vitest';
import * as THREE from 'three';
import { CameraController } from '../src/core/cameraController';
import { shortestAngleDelta, normalizeAngleDeg } from '../src/util/math';
import { browser } from '../src/util/browser';

afterEach(() => vi.restoreAllMocks());

describe('shortestAngleDelta', () => {
  it('takes the short way around', () => {
    expect(shortestAngleDelta(170, -170)).toBe(20);
    expect(shortestAngleDelta(-170, 170)).toBe(-20);
    expect(shortestAngleDelta(0, 270)).toBe(-90);
    expect(shortestAngleDelta(-10, 350)).toBe(0);
    expect(shortestAngleDelta(179, -179)).toBe(2);
  });
});

describe('bearing animation path', () => {
  function makeController() {
    const camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000);
    return new CameraController({
      camera,
      domElement: document.createElement('div') as any,
      useExternalAnimationLoop: true,
    });
  }

  it('easeTo animates 170 -> -170 through 180, not through 0', () => {
    let fakeNow = 1000;
    vi.spyOn(browser, 'now').mockImplementation(() => fakeNow);
    const ctl = makeController();
    ctl.jumpTo({ bearing: 170 });
    ctl.easeTo({ bearing: -170, duration: 100 });
    fakeNow = 1050;
    ctl.update();
    const b = ctl.getBearing();
    // On the short arc, distance-to-start + distance-to-end === 20.
    // On the long arc (e.g. mid-path bearing 0) it is 340.
    const total = Math.abs(normalizeAngleDeg(b - 170)) + Math.abs(normalizeAngleDeg(b + 170));
    expect(total).toBeLessThan(21);
    fakeNow = 1200;
    ctl.update();
    expect(ctl.getBearing()).toBe(-170);
    ctl.dispose();
  });

  it('flyTo animates 170 -> -170 through 180, not through 0', () => {
    let fakeNow = 1000;
    vi.spyOn(browser, 'now').mockImplementation(() => fakeNow);
    const ctl = makeController();
    ctl.jumpTo({ bearing: 170, center: { x: 0, y: 0 } });
    // Real pan distance so the Van Wijk path (not the easeTo delegate) runs
    ctl.flyTo({ center: { x: 50, y: 50 }, bearing: -170, duration: 100 });
    fakeNow = 1050;
    ctl.update();
    const b = ctl.getBearing();
    const total = Math.abs(normalizeAngleDeg(b - 170)) + Math.abs(normalizeAngleDeg(b + 170));
    expect(total).toBeLessThan(21); // long way gives ~340
    fakeNow = 1200;
    ctl.update();
    expect(ctl.getBearing()).toBe(-170);
    ctl.dispose();
  });
});
