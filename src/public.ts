import type { Camera } from 'three';
import { CameraController } from './core/cameraController';

export type ControllerOptions = ConstructorParameters<typeof CameraController>[0];

export function createController(options: ControllerOptions) {
  return new CameraController(options);
}

export type SSRControllerStub = CameraController & { isSSRStub: true };

export function isSSRStub(c: CameraController): c is SSRControllerStub {
  return (c as any).isSSRStub === true;
}

function makeSSRStub(): SSRControllerStub {
  const padding = () => ({ top: 0, right: 0, bottom: 0, left: 0 });
  const center = () => ({ x: 0, y: 0, z: 0 });
  const transformStub: any = {
    center: center(), zoom: 0, bearing: 0, pitch: 0, roll: 0,
    padding: padding(), width: 0, height: 0, scale: 1,
    worldToScreen: () => null, screenToWorld: () => null, groundFromScreen: () => null,
    getPanBounds: () => undefined,
    adjustCenterByGroundDelta: () => {},
    deferApply: (fn: () => void) => fn(),
    setCenter: () => {}, setZoom: () => {}, setBearing: () => {}, setPitch: () => {},
    setRoll: () => {}, setPadding: () => {}, setViewport: () => {}, setConstraints: () => {},
  };
  const values: Record<PropertyKey, unknown> = {
    isSSRStub: true,
    transform: transformStub,
    getCenter: center,
    getZoom: () => 0, getBearing: () => 0, getPitch: () => 0, getRoll: () => 0,
    getPadding: padding,
    isMoving: () => false, isZooming: () => false, isRotating: () => false,
    isPitching: () => false, isRolling: () => false,
    getStateSnapshot: () => ({ center: center(), zoom: 0, bearing: 0, pitch: 0, roll: 0, padding: padding() }),
    cameraForBounds: () => ({ center: { x: 0, y: 0 }, zoom: 0, bearing: 0, pitch: 0 }),
  };
  const chain = () => stub; // every unlisted member is a chainable no-op method
  const stub: any = new Proxy({}, {
    get(_t, prop) {
      if (prop === 'then') return undefined; // never look thenable to await/Promise.resolve
      if (prop === Symbol.toPrimitive) return undefined; // let String(stub) fall back to Object.prototype.toString
      if (prop in values) return values[prop];
      return chain;
    },
    has: () => true,
  });
  return stub as SSRControllerStub;
}

// SSR-safe factory for Next.js
export function createControllerForNext(
  options: ControllerOptions | (() => ControllerOptions),
): CameraController {
  if (typeof window === 'undefined') {
    return makeSSRStub();
  }
  const resolved = typeof options === 'function' ? (options as () => ControllerOptions)() : options;
  return new CameraController(resolved);
}

export type { Camera };

