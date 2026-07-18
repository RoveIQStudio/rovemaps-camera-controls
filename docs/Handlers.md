## Handlers

### Scroll Zoom
- Trackpad vs wheel detection with `onWheelModeChange(mode)`
- `around: 'center'|'pointer'` keeps target under cursor during zoom
- Inertia smoothing with reduced tiny deltas on high-DPR devices

### Mouse Pan / Rotate / Pitch
- Pan: left drag with rubberband resistance near pan bounds and inertia
- Rotate: right drag; `around: 'pointer'` preserves world point under cursor
- Pitch: Shift + drag; `around: 'pointer'` preserves world point

Shift+left-drag arbitration: box zoom owns shift+left-drag when enabled; with
`boxZoom: false`, shift+left-drag is pitch-only (via the mouse rotate/pitch
handler's shift modifier). Left-drag pan always yields shift+left to whichever
of those is active; disable both to make shift+left pan again.

### Touch (Two-finger)
- Pinch (zoom) + rotate: locks mode and preserves centroid when `around: 'pinch'`
- Two-finger pitch: vertical movement maps to pitch; centroid preserved
- Rubberband resistance during pan mode and during inertia
 - Auto profile: when `autoTouchProfile` is enabled (default), touch-capable devices get conservative defaults (`rotateThresholdDeg: 0.5`, `pitchThresholdPx: 12`, `zoomThreshold: 0.04`) unless you override them in `handlers.touch`.

#### Rotation Sensitivity
- `touch.rotateStartThresholdDeg`: degrees to START rotation; higher = less sensitive (default: `1.0`).
- `touch.rotateContinueThresholdDeg`: degrees to CONTINUE rotation after it has started (default: `0.5` or `touch.rotateThresholdDeg` if provided).
- `touch.rotateDebounceMs`: suppress rotation for the first N ms of a two‑finger gesture, letting zoom establish first (default: `100`).

Example:

```ts
import { createController } from 'three-rovemaps-camera-controls';
import type { HandlerManagerOptions } from 'three-rovemaps-camera-controls';

const handlers: HandlerManagerOptions = {
  scrollZoom: { around: 'pointer' },
  mousePan: { dragThresholdPx: 3 },
  boxZoom: { minAreaPx: 64 },
  keyboard: { panStepPx: 100 },
};
const controller = createController({ camera, domElement, handlers });
```

### Keyboard
- Arrow pan, +/- zoom, Q/E rotate, PageUp/Down pitch

Keyboard input is scoped to the map element: the element is given `tabindex="0"` if it
is not already focusable, and arrow/zoom/rotate keys act only while the map has focus
(click the map or Tab to it). This prevents a map from hijacking page scrolling and
lets multiple maps coexist on one page.

### Dblclick / Double-tap, Box Zoom
- Dblclick/tap zoom around pointer; Shift invert
- Box zoom with Shift + drag; fit bounds via projection-based solver
