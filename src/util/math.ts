export function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

export function degToRad(d: number) {
  return (d * Math.PI) / 180;
}

export function radToDeg(r: number) {
  return (r * 180) / Math.PI;
}

export function normalizeAngleDeg(a: number) {
  // (-180, 180]
  const n = mod(a + 180, 360) - 180;
  return n === -180 ? 180 : n;
}

export function zoomScale(zoomDelta: number) {
  return Math.pow(2, zoomDelta);
}

export function scaleZoom(scale: number) {
  return Math.log2(scale);
}

export function shortestAngleDelta(from: number, to: number) {
  // Signed delta in (-180, 180] taking the short way around the circle
  return normalizeAngleDeg(to - from);
}

export function rubberbandDamp(overshoot: number, strength: number) {
  // 1 inside bounds; approaches 0 as overshoot grows. Matches handler inline damping.
  return overshoot > 0 ? 1 / (1 + overshoot * strength) : 1;
}

