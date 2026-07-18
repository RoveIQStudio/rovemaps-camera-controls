import { describe, it, expect, vi, afterEach } from 'vitest';

const g: any = globalThis as any;
let nextRafId = 1;
const pending = new Map<number, FrameRequestCallback>();
g.window = {
  requestAnimationFrame: (cb: FrameRequestCallback) => { const id = nextRafId++; pending.set(id, cb); return id; },
  cancelAnimationFrame: (id: number) => { pending.delete(id); },
  matchMedia: () => ({ matches: false, addListener() {}, removeListener() {} }),
  addEventListener() {},
  removeEventListener() {},
};
// Node 21+ exposes a read-only `navigator` global (getter-only), so an
// unconditional assignment throws. Guard it like tests/helpers/nodePolyfill.ts;
// the built-in navigator's maxTouchPoints is undefined (undefined > 0 === false),
// matching the intended non-touch { maxTouchPoints: 0 } behavior.
if (!g.navigator) g.navigator = { maxTouchPoints: 0 };
g.document = {
  body: { appendChild() {} },
  createElement: () => ({
    addEventListener() {},
    removeEventListener() {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 }),
    style: {},
    clientWidth: 800,
    clientHeight: 600,
  }),
};

function flushFrames(now: number) {
  const cbs = [...pending.values()];
  pending.clear();
  for (const cb of cbs) cb(now);
}

import * as THREE from 'three';
import { CameraController } from '../src/core/cameraController';
import { browser } from '../src/util/browser';

afterEach(() => vi.restoreAllMocks());

describe('animation interruption', () => {
  it('an interrupting easeTo leaves exactly one live RAF loop and one axis event per frame', () => {
    let fakeNow = 0;
    vi.spyOn(browser, 'now').mockImplementation(() => fakeNow);
    const camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000);
    const ctl = new CameraController({ camera, domElement: document.createElement('div') as any });

    ctl.easeTo({ zoom: 5, duration: 100 });
    expect(pending.size).toBe(1);
    fakeNow = 16;
    flushFrames(fakeNow);
    expect(pending.size).toBe(1); // loop rescheduled itself

    ctl.easeTo({ zoom: 1, duration: 100 }); // interrupt
    expect(pending.size).toBe(1); // old loop cancelled — fails before fix (2)

    // Per-frame emissions are the axis events (zoom) + renderFrame, not 'move'
    let zoomCount = 0;
    ctl.on('zoom', () => zoomCount++);
    fakeNow = 32;
    flushFrames(fakeNow);
    expect(zoomCount).toBe(1); // exactly one loop advancing — fails before fix (2)

    let moveendCount = 0;
    ctl.on('moveend', () => moveendCount++);
    fakeNow = 300;
    flushFrames(fakeNow);
    expect(moveendCount).toBe(1);
    expect(pending.size).toBe(0);
    ctl.dispose();
  });
});
