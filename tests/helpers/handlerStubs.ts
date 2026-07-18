// tests/helpers/handlerStubs.ts
export function makeTransform() {
  const t: any = {
    center: { x: 0, y: 0, z: 0 },
    zoom: 0, bearing: 0, pitch: 0, roll: 0,
    width: 800, height: 600, scale: 1, padding: { top: 0, right: 0, bottom: 0, left: 0 },
    adjustCalls: 0,
    groundFromScreen: (p: { x: number; y: number }) => ({ gx: p.x, gz: p.y }),
    adjustCenterByGroundDelta(dgx: number, dgz: number) {
      t.adjustCalls++;
      t.center = { x: t.center.x + dgx, y: t.center.y + dgz, z: 0 };
    },
    getPanBounds: () => undefined,
    screenToWorld: (p: { x: number; y: number }) => ({ x: p.x, y: p.y }),
    worldToScreen: () => null,
    setCenter(c: any) { t.center = { ...c }; },
    setZoom(z: number) { t.zoom = z; },
    setBearing(b: number) { t.bearing = b; },
    setPitch(p: number) { t.pitch = p; },
    setRoll(r: number) { t.roll = r; },
    setPadding() {}, setViewport() {}, setConstraints() {},
    deferApply: (fn: () => void) => fn(),
  };
  return t;
}

export function makeHelper() {
  const calls: Array<[string, ...unknown[]]> = [];
  const h: any = {
    calls,
    handleMapControlsPan(_t: unknown, dx: number, dy: number) { calls.push(['pan', dx, dy]); },
    handleMapControlsRollPitchBearingZoom(_t: unknown, dr: number, dp: number, db: number, dz: number) {
      calls.push(['rpbz', dr, dp, db, dz]);
    },
    handleJumpToCenterZoom() {}, handleEaseTo() {}, handleFlyTo() {}, handlePanInertia() {},
    cameraForBoxAndBearing: () => ({ center: { x: 0, y: 0 }, zoom: 0, bearing: 0, pitch: 0 }),
  };
  return h;
}
