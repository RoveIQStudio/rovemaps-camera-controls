import { describe, it, expect, vi, afterEach } from 'vitest';

import './helpers/nodePolyfill';

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

describe('axis lifecycle', () => {
  it('ends orphaned axes when an animation is interrupted', () => {
    let fakeNow = 0;
    vi.spyOn(browser, 'now').mockImplementation(() => fakeNow);
    const ctl = makeController();
    const events: string[] = [];
    (['rotateend', 'zoomend', 'dragend'] as const).forEach((t) => ctl.on(t, () => events.push(t)));

    ctl.flyTo({ center: { x: 10, y: 10 }, zoom: 4, bearing: 90, duration: 100 });
    fakeNow = 50;
    ctl.update();
    expect(ctl.isRotating()).toBe(true);

    fakeNow = 60;
    ctl.easeTo({ zoom: 2, duration: 100 }); // no bearing/center — rotate & pan are orphaned
    expect(events).toContain('rotateend'); // fails before fix
    expect(events).toContain('dragend');
    expect(ctl.isRotating()).toBe(false);

    fakeNow = 200;
    ctl.update();
    expect(events).toContain('zoomend');
    ctl.dispose();
  });

  it('debounced external moveend ends the union of burst axes', () => {
    vi.useFakeTimers();
    const ctl = makeController();
    const events: string[] = [];
    (['dragstart', 'dragend', 'zoomend'] as const).forEach((t) => ctl.on(t, () => events.push(t)));

    (ctl as any)._externalChange({ axes: { pan: true } });
    (ctl as any)._externalChange({ axes: { zoom: true } }); // re-arms the 120ms timer
    vi.advanceTimersByTime(150);

    expect(events).toContain('dragend'); // fails before fix — only zoomend fires
    expect(events).toContain('zoomend');
    ctl.dispose();
  });
});
