import { describe, it, expect } from 'vitest';

import './helpers/nodePolyfill';

import * as THREE from 'three';
import { ThreePlanarTransform } from '../src/transform/threePlanarTransform';

function makeTransform() {
  const camera = new THREE.PerspectiveCamera(60, 800 / 600, 0.1, 4000);
  const t = new ThreePlanarTransform({ camera, width: 800, height: 600 });
  t.setZoom(3);
  t.setCenter({ x: 10, y: -5, z: 0 });
  return t;
}

/** Re-anchor P after a mutation, exactly as the handlers do. */
function anchor(t: ThreePlanarTransform, P: { x: number; y: number }, before: { gx: number; gz: number }) {
  const after = t.groundFromScreen(P)!;
  t.adjustCenterByGroundDelta(before.gx - after.gx, before.gz - after.gz);
}

function screenOf(t: ThreePlanarTransform, g: { gx: number; gz: number }) {
  return t.worldToScreen(new THREE.Vector3(g.gx, 0, g.gz))!;
}

describe('around-point anchoring on the real transform', () => {
  const P = { x: 600, y: 200 };

  it('holds the ground point under the cursor across a zoom', () => {
    const t = makeTransform();
    const before = t.groundFromScreen(P)!;
    t.setZoom(t.zoom + 1);
    anchor(t, P, before);
    const sp = screenOf(t, before);
    expect(sp.x).toBeCloseTo(P.x, 0);
    expect(sp.y).toBeCloseTo(P.y, 0);
  });

  it('holds the ground point under the cursor across a rotation', () => {
    const t = makeTransform();
    const before = t.groundFromScreen(P)!;
    t.setBearing(t.bearing + 30);
    anchor(t, P, before);
    const sp = screenOf(t, before);
    expect(sp.x).toBeCloseTo(P.x, 0);
    expect(sp.y).toBeCloseTo(P.y, 0);
  });

  it('holds the ground point under the cursor across a zoom while pitched', () => {
    const t = makeTransform();
    t.setPitch(45);
    const before = t.groundFromScreen(P)!;
    t.setZoom(t.zoom + 0.5);
    anchor(t, P, before);
    const sp = screenOf(t, before);
    expect(Math.hypot(sp.x - P.x, sp.y - P.y)).toBeLessThan(1.5);
  });
});
