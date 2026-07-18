export * from './public';
export * from './core/cameraController';
export * from './core/evented';
export * from './transform/interfaces';
export * from './helpers/icameraHelper';

// Curated utilities: map-domain math and easings consumers legitimately need.
// Generic helpers (clamp/lerp/deg-rad) and DOM/browser internals are no longer public.
export { normalizeAngleDeg, shortestAngleDelta, zoomScale, scaleZoom } from './util/math';
export { defaultEasing, cubicBezier } from './util/easing';
export type { Easing } from './util/easing';

export type { HandlerManagerOptions } from './handlers/handlerManager';
export type { HandlerAxes, HandlerDelta } from './handlers/types';
export type { ScrollZoomOptions } from './handlers/scrollZoomHandler';
export type { MousePanOptions } from './handlers/mousePanHandler';
export type { MouseRotatePitchOptions } from './handlers/mouseRotatePitchHandler';
export type { TouchMultiOptions } from './handlers/touchMultiHandler';
export type { KeyboardOptions } from './handlers/keyboardHandler';
export type { DblclickOptions } from './handlers/dblclickHandler';
export type { BoxZoomOptions } from './handlers/boxZoomHandler';
export type { SafariGestureOptions } from './handlers/safariGestureHandler';
