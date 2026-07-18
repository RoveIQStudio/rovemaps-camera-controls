import { describe, it, expect } from 'vitest';

import './helpers/nodePolyfill';

import * as THREE from 'three';
import { CameraController } from '../src/core/cameraController';

function makeController() {
  const camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000);
  return new CameraController({
    camera,
    domElement: document.createElement('div') as any,
    width: 800,
    height: 600,
  });
}

describe('fitBounds offset/padding application', () => {
  const bounds = { min: { x: -10, y: -10 }, max: { x: 10, y: 10 } };

  it('applies offset exactly once', () => {
    const ctl = makeController();
    const expected = ctl.cameraForBounds(bounds, { offset: { x: 100, y: 0 } });
    ctl.fitBounds(bounds, { offset: { x: 100, y: 0 }, animate: false } as any);
    expect(ctl.getCenter().x).toBeCloseTo(expected.center.x, 6);
    expect(ctl.getCenter().y).toBeCloseTo(expected.center.y, 6);
    ctl.dispose();
  });

  it('does not additionally push padding into transform state', () => {
    const ctl = makeController();
    const expected = ctl.cameraForBounds(bounds, { padding: { left: 200 } as any });
    ctl.fitBounds(bounds, { padding: { left: 200 }, animate: false } as any);
    expect(ctl.getCenter().x).toBeCloseTo(expected.center.x, 6);
    expect(ctl.getPadding().left).toBe(0); // padding was consumed by the fit, not applied to transform
    ctl.dispose();
  });

  it('applies offset once under nonzero bearing', () => {
    const ctl = makeController();
    const expected = ctl.cameraForBounds(bounds, { bearing: 45, offset: { x: 100, y: 0 } } as any);
    ctl.fitBounds(bounds, { bearing: 45, offset: { x: 100, y: 0 }, animate: false } as any);
    expect(ctl.getCenter().x).toBeCloseTo(expected.center.x, 6);
    expect(ctl.getCenter().y).toBeCloseTo(expected.center.y, 6);
    ctl.dispose();
  });
});
