# Behavior Changes (unreleased — since 0.4.2)

Consumer-visible changes from the Phase 1/2 remediation, ahead of the next release.

- **Rotations take the shortest path.** `easeTo`/`flyTo`/`rotateTo` re-express
  angular targets to the equivalent angle within ±180°, so animating 170°→-170°
  sweeps 20°, not 340°. Multi-turn spins via a single call are no longer
  expressible; equivalent-angle targets (e.g. `rotateTo(350)` from -10°) are no-ops.
- **`fitBounds` result wins.** The computed center/zoom/bearing now take
  precedence over any `center`/`zoom`/`bearing` passed in the options, and
  `offset`/`padding` are applied exactly once.
- **Keyboard input is focus-scoped.** The map element receives `tabindex="0"`
  (when it has no tabindex attribute) and arrow/zoom/rotate keys act only while
  the map has focus. Page-level key hijacking is gone.
- **Context-menu suppression is element-scoped** — right-click works normally
  on the rest of the page.
- **Shift+left-drag arbitration:** box zoom owns shift+left when enabled;
  otherwise pitch-only. Left-drag pan yields shift+left to those gestures.
- **Handler options accept `false`.** `touch: false`, `keyboard: false`,
  `dblclick: false`, `boxZoom: false`, `mousePan: false`,
  `mouseRotatePitch: false` genuinely disable the handler.
- **`touch-action: none` is applied to the map element** while the touch
  handler is enabled (opt out with `handlers: { touch: { setTouchAction: false } }`).
- **`prefers-reduced-motion` now covers `flyTo`** (opt out per call with
  `essential: true`), and instant jumps cancel any in-flight animation.
- **`renderFrame` event payload type** tightened from `{}` to `Record<string, never>`.
- **SSR:** `createControllerForNext` returns a complete no-op stub on the
  server; check it with the exported `isSSRStub()` guard.
- **Instant jumps settle soft pan bounds.** A reduced-motion or `animate: false`
  easeTo that lands outside `panBounds` (with `softPanBounds` enabled) now eases
  back inside, like animated paths always did.
- **`softPanBounds` settle is a clean lifecycle.** The settle back inside bounds
  runs after the triggering movement's `moveend`, as its own movestart/moveend pair.
