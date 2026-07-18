import { flushFrames } from './helpers/rafQueue';
import { describe, it, expect, vi, afterEach } from 'vitest';
import * as THREE from 'three';
import { CameraController } from '../src/core/cameraController';
import { browser } from '../src/util/browser';

afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers(); });

function makeController() {
  const camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000);
  return new CameraController({
    camera,
    domElement: document.createElement('div') as any,
    softPanBounds: true,
    panBounds: { min: { x: -10, y: -10 }, max: { x: 10, y: 10 } },
  });
}

describe('softPanBounds settle', () => {
  it('settles back inside bounds with a clean movestart/moveend pair after the outer moveend', () => {
    let fakeNow = 0;
    vi.spyOn(browser, 'now').mockImplementation(() => fakeNow);
    const ctl = makeController();
    const events: string[] = [];
    (['movestart', 'moveend'] as const).forEach((t) => ctl.on(t, () => events.push(t)));

    ctl.easeTo({ center: { x: 50, y: 0 }, duration: 100 }); // ends out of bounds
    fakeNow = 16; flushFrames(fakeNow);
    fakeNow = 150; flushFrames(fakeNow); // done -> outer moveend, settle scheduled
    // drive the settle to completion
    for (let t = 160; t <= 500; t += 16) { fakeNow = t; flushFrames(fakeNow); }
    expect(ctl.getCenter().x).toBeLessThanOrEqual(10.001); // settled inside bounds
    // Clean pairs: movestart,moveend (outer), movestart,moveend (settle) — pre-fix the settle was clobbered entirely (camera stranded, sequence ['movestart','moveend'])
    expect(events).toEqual(['movestart', 'moveend', 'movestart', 'moveend']);
    ctl.dispose();
  });

  it('dispose during the settle cancels it', () => {
    let fakeNow = 0;
    vi.spyOn(browser, 'now').mockImplementation(() => fakeNow);
    const ctl = makeController();
    ctl.easeTo({ center: { x: 50, y: 0 }, duration: 100 });
    fakeNow = 150; flushFrames(fakeNow); // done, settle scheduled
    fakeNow = 166; flushFrames(fakeNow); // settle advancing
    const cx = ctl.getCenter().x;
    ctl.dispose();
    for (let t = 180; t <= 400; t += 16) { fakeNow = t; flushFrames(fakeNow); }
    expect(ctl.getCenter().x).toBe(cx); // regression guard: dispose cancels the settle (passed pre-fix via the generation bump)
  });

  it('a second out-of-bounds movement during a prior settle still settles (no stranding)', () => {
    let fakeNow = 0;
    vi.spyOn(browser, 'now').mockImplementation(() => fakeNow);
    const ctl = makeController();

    ctl.easeTo({ center: { x: 50, y: 0 }, duration: 100 });
    fakeNow = 150; flushFrames(fakeNow); // done -> settle #1 starts (old code: flag set for 220ms)
    fakeNow = 166; flushFrames(fakeNow); // settle #1 advancing

    // interrupt with a second out-of-bounds move that finishes inside the old flag window
    ctl.easeTo({ center: { x: 60, y: 0 }, duration: 50 });
    for (let t = 170; t <= 240; t += 16) { fakeNow = t; flushFrames(fakeNow); }
    // old code: done fires at ~t=220 while the flag is still set -> no settle #2 -> stranded at 60
    for (let t = 250; t <= 700; t += 16) { fakeNow = t; flushFrames(fakeNow); }
    expect(ctl.getCenter().x).toBeLessThanOrEqual(10.001); // fails before fix: 60
    ctl.dispose();
  });
});
