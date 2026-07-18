import './helpers/nodePolyfill';
import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { ThreePlanarTransform } from '../src/transform/threePlanarTransform';
import { PlanarCameraHelper } from '../src/helpers/planarCameraHelper';

describe('fitBounds under zoom constraints', () => {
  it('computes padding/offset shift at the clamped zoom, not the raw search zoom', () => {
    const camera = new THREE.PerspectiveCamera(60, 800 / 600, 0.1, 4000);
    const t = new ThreePlanarTransform({ camera, width: 800, height: 600 });
    t.setConstraints({ minZoom: -Infinity, maxZoom: 2, minPitch: 0, maxPitch: 85 });
    const helper = new PlanarCameraHelper();
    // Tiny bounds whose natural fit zoom is far above maxZoom
    const bounds = { min: { x: -0.001, y: -0.001 }, max: { x: 0.001, y: 0.001 } };
    const cam = helper.cameraForBoxAndBearing(t as any, bounds, { offset: { x: 100, y: 0 } } as any);
    expect(cam.zoom).toBeLessThanOrEqual(2);
    // offset shift at zoom 2 => 100 / 2^2 = 25 world units (bearing 0 -> center.x -= 25)
    expect(Math.abs(cam.center.x - (0 - 25))).toBeLessThan(0.5); // fails before fix: shift ~0
  });
});
