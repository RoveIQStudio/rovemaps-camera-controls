import { describe, it, expect } from 'vitest';

import './helpers/nodePolyfill';

import * as THREE from 'three';
import { ThreePlanarTransform } from '../src/transform/threePlanarTransform';
import { PlanarCameraHelper } from '../src/helpers/planarCameraHelper';

describe('fitBounds under z-up', () => {
  const bounds = { min: { x: -50, y: -20 }, max: { x: 50, y: 20 } };

  function fitZoom(upAxis: 'y' | 'z') {
    const camera = new THREE.PerspectiveCamera(60, 800 / 600, 0.1, 4000);
    const t = new ThreePlanarTransform({ camera, width: 800, height: 600, upAxis });
    const helper = new PlanarCameraHelper();
    return helper.cameraForBoxAndBearing(t as any, bounds).zoom;
  }

  it('computes the same fit zoom for y-up and z-up', () => {
    const zy = fitZoom('y');
    const zz = fitZoom('z');
    expect(Number.isFinite(zz)).toBe(true);
    expect(Math.abs(zy - zz)).toBeLessThan(0.1);
  });

  it('y-up and z-up agree under nonzero bearing with padding', () => {
    const mk = (upAxis: 'y' | 'z') => {
      const camera = new THREE.PerspectiveCamera(60, 800 / 600, 0.1, 4000);
      const t = new ThreePlanarTransform({ camera, width: 800, height: 600, upAxis });
      return new PlanarCameraHelper().cameraForBoxAndBearing(t as any, bounds, { bearing: 30, padding: { left: 100 } } as any);
    };
    const a = mk('y'); const b = mk('z');
    expect(Math.abs(a.zoom - b.zoom)).toBeLessThan(0.1);
  });
});
