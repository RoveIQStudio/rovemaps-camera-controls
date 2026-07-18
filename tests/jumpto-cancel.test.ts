import './helpers/nodePolyfill';
import { describe, it, expect, vi, afterEach } from 'vitest';
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
  });
}

describe('jumpTo vs in-flight animation', () => {
  it('a direct jumpTo cancels the animation instead of being overwritten by it', () => {
    let fakeNow = 0;
    vi.spyOn(browser, 'now').mockImplementation(() => fakeNow);
    const ctl = makeController();
    const events: string[] = [];
    (['moveend', 'zoomend'] as const).forEach((t) => ctl.on(t, () => events.push(t)));

    ctl.easeTo({ zoom: 5, duration: 100 });
    fakeNow = 50;
    ctl.update();
    ctl.jumpTo({ zoom: 2 });
    expect(events.filter((e) => e === 'moveend').length).toBe(1); // animation closed out at the jump
    expect(events.filter((e) => e === 'zoomend').length).toBe(1);
    expect(ctl.isMoving()).toBe(false);

    fakeNow = 200;
    ctl.update(); // a live animation would finish here and clobber the jump
    expect(ctl.getZoom()).toBe(2); // fails before fix: 5
    ctl.dispose();
  });
});
