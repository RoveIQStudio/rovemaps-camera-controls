import './helpers/nodePolyfill';
import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { ThreePlanarTransform } from '../src/transform/threePlanarTransform';
import { PlanarCameraHelper } from '../src/helpers/planarCameraHelper';

function makeTransform(minPitch: number, maxPitch: number) {
  const camera = new THREE.PerspectiveCamera(60, 800 / 600, 0.1, 4000);
  const t = new ThreePlanarTransform({ camera, width: 800, height: 600 });
  t.setConstraints({ minZoom: -Infinity, maxZoom: Infinity, minPitch, maxPitch });
  return t;
}

describe('interactive pitch vs transform constraints', () => {
  const helper = new PlanarCameraHelper();

  it('allows drag-pitch beyond 85 when maxPitch permits', () => {
    const t = makeTransform(0, 89);
    t.setPitch(84);
    helper.handleMapControlsRollPitchBearingZoom(t as any, 0, 4, 0, 0);
    expect(t.pitch).toBe(88); // fails before fix: capped at 85
  });

  it('respects a configured minPitch floor', () => {
    const t = makeTransform(20, 85);
    t.setPitch(25);
    helper.handleMapControlsRollPitchBearingZoom(t as any, 0, -10, 0, 0);
    expect(t.pitch).toBe(20); // regression guard: helper no longer undercuts a configured minPitch floor
  });
});
