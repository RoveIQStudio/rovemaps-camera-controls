# Changelog

## [0.5.0](https://github.com/RoveIQStudio/rovemaps-camera-controls/compare/three-rovemaps-camera-controls-v0.4.2...three-rovemaps-camera-controls-v0.5.0) (2026-07-18)


### ⚠ BREAKING CHANGES

* clamp, lerp, mod, degToRad, radToDeg, rubberbandDamp, on, off, raf, caf, browser, and ListenerOptions are no longer exported from the package root. Import equivalents from your own utilities. Map-domain helpers (normalizeAngleDeg, shortestAngleDelta, zoomScale, scaleZoom) and easings (defaultEasing, cubicBezier) remain exported.

### Features

* **anchor:** add Anchor Tightness option (0..1) and demo slider; apply to zoom/rotate/pitch/pan pointer-anchored corrections ([d63e431](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/d63e431f6b9bbf1bad53174a942584ac7bf1862f))
* **core:** SSR-safe dispose and soft pan clamping\n\n- Guard dispose/moveend timers and RAF for SSR\n- Soft pan clamping uses SSR-safe timers\n\nfeat(easeTo): around anchoring with pointer support\n\n- Implement around:'pointer' with aroundPoint + anchorTightness\n- Mirror handler anchoring sequence (ground delta correction)\n\nfeat(handlers): wheel zoom inertia opt-in (default off)\n\n- Add zoomInertia option to ScrollZoomHandler, default false for MapLibre parity\n\ndocs: update API around anchoring + inertia\n\ntests: add SSR dispose + wheel inertia default tests ([cbbde2d](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/cbbde2df2394ee4d427dd31ff14d16e8d86cec30))
* curate the public export surface; CJS gets its own types condition ([f915654](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/f915654d1dad4db705d62315f265013689a85977))
* **demo:** add Show Debug Gizmos + Antialias toggle; strengthen twist anchoring with anchorTightness in Safari gestures ([f672ae6](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/f672ae6983e4d185a256805dec235ec17a2643cd))
* export handler option and delta types from the package root ([8ffff3f](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/8ffff3f8eb147e3ccb699613090995ef83212f5e))
* touch handler applies touch-action:none while enabled; drop no-op visualViewport arithmetic ([ff6e983](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/ff6e983c313b0dd6fbd9796ccbc25c42bdfbfb81))


### Bug Fixes

* absorbed gesture bursts keep bearing snap; instant jumps re-apply soft pan bounds ([09f82fd](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/09f82fde1c977844e9be59a7261e3ca7a9e65ecb))
* any mouse grab stops pan inertia; lint in prepublishOnly ([f3d230e](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/f3d230e92d783583682f5e3a468a02024a53a6c9))
* **around-point:** robust pointer pivot by world-before/after delta for zoom/rotate/pitch; map-style pan; suppress contextmenu for trackpad ([69abf58](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/69abf58869a689f5c6129cdde30aedd38b946d72))
* cancel prior RAF loop on animation interrupt; guard stale loops with a generation counter ([0991fa3](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/0991fa3d11c5980de509a5d6c35d0169d05b3741))
* degenerate flyTo delegate forwards absorbed gesture axes to easeTo ([89af68c](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/89af68cb92af11dfe3a0eec38ae210c09f951cd3))
* **demo:** avoid referencing toolbar before initialization; use currentHandlers.antialias in buildController ([9fed529](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/9fed529cd445eadc8857f6a2f4054e9878ea6fa9))
* dispose closes the move lifecycle with a final moveend ([72a9be2](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/72a9be243c1be12afea7fd29948d7c7a2a46c681))
* end drags on pointercancel/blur/missed pointerup; cancel inertia when a new grab starts ([df41e67](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/df41e674534f9d8e0a73d1f0e3e3fa7b327b8995))
* end orphaned axis lifecycles on animation interrupt and debounced external moveend ([8a15f85](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/8a15f85ee37e5818795e66f83d55b2f39f0e6bca))
* ensure mouse handlers ignore touch/pen pointer events (pointerType!=='mouse') to avoid double-handling on mobile causing shake and lateral jumps; touch handlers remain responsible for touch ([d2bdcd8](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/d2bdcd8120afa2bc87c7effb8bf659c5dc797e19))
* fitBounds no longer double-applies offset and padding via easeTo ([1961cfb](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/1961cfbcc6eaf8530006138388918defa42d730c))
* fitBounds padding/offset math uses the constraint-clamped zoom ([a1f6b0c](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/a1f6b0c885ecf70ba731a4b404a92ee1b37c9445))
* flyTo honors prefers-reduced-motion unless essential ([7058cac](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/7058cac2b7cd34e860ab1eae561143271ba5799a))
* honor boxZoom:false by not constructing the box zoom handler ([1f9db88](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/1f9db8869c97aff6915fdea0a5b0167ab6997b42))
* **inertia:** avoid double sign on velocity; make camera forward gizmo orange to distinguish from velocity ([a5232c9](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/a5232c9e2e43f37e44bdb9ce906f0d7bd32e518a))
* instant easeTo jumps cancel in-flight animations ([b9e5c4a](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/b9e5c4a9a401bd9bb8c651b8d86a9e1c34d0e4b9))
* interactive pitch delegates clamping to the transform's configured constraints ([84af86c](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/84af86c76f9065839ee00b232bc25d152207e830))
* interpolate bearing/roll animations along the shortest angular path ([02dabc4](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/02dabc4b3e8a9cd0b6159fe975a5eee10f8cbab6))
* jumpTo cancels in-flight animations (MapLibre parity) ([0e6d92d](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/0e6d92d8b49e778f37b044423308cebb4b765e69))
* map-style pan rotation by bearing; default wheel zoom around pointer; suppress context menu; right-drag rotate+pitch ([e7ecc0a](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/e7ecc0a64b24f482def17566b1d31b707a0b33c2))
* mouse drag handlers track their active pointerId; foreign pointers can no longer cancel or feed a drag ([5078d9a](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/5078d9a034cab5f37f521ee6ed7fb5c12d01b545))
* noop onChange fallback in all handlers; keyboard respects explicit tabindex=-1 ([f8023eb](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/f8023eb2ec1456c49736ad186b9d7a5bc4f22fd6))
* **pan:** apply pan sign to pointer-anchored ground deltas; ensure damping only scales in correct direction ([0fad72b](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/0fad72b794d050939c9722fa6297d03121001da5))
* **pan:** prevent NaN center after release\n\n- Avoid passing undefined frictions from HandlerManager\n- MousePanHandler: sanitize options merge and friction fallback\n\nThis fixes a NaN center regression when pan inertia decays with undefined friction. ([af08512](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/af08512304136f161c4c65bf463414f7f5f569d9))
* pitch-modifier activation is left-button only; shift+right pans cleanly in rightButtonPan mode ([2fa91a4](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/2fa91a4ce6aa854325b9d663cd7c302501d11117))
* pointercancel is gated by the active pointerId ([d3267ab](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/d3267ab5b2374130941f3aa5846edacbca2589fa))
* programmatic animations absorb the external-gesture debounce instead of racing it ([ab02f0e](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/ab02f0ea6542bd41f19b9b1abf51441947688745))
* project fitBounds corners on the correct ground plane for z-up transforms ([53560d5](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/53560d58104039dabee96f4987972c5b6737ed13))
* reduced-motion easeTo applies offset; duration:0 animation cannot produce NaN ([e8652e2](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/e8652e2083139185675c1005e8d0cffafc58a628))
* reduced-motion flyTo delegate forwards the absorbed gesture burst ([544b41c](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/544b41cf131f5930d4cb871edfd9187cf633e033))
* reserve shift+left-drag for box zoom; pan and rotate/pitch yield ([7b04a6d](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/7b04a6dbdb0797035337b1c2def8aa37ec7e5d0e))
* scope context-menu suppression to the map element instead of the whole window ([592c0a3](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/592c0a3394248627827e7d7545b196efdc0cae53))
* scope keyboard handler to a focusable map element instead of window ([3c2fe6b](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/3c2fe6bc7b1a4e7c32434262a24f48908e402d19))
* shift+left-drag arbitration is two-way — box zoom, else pitch; pan always yields ([ec047b5](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/ec047b5a0421dd78dc3895b234cfb99dfc47752f))
* softPanBounds settle guard is the bounds check itself; no more 220ms stranding window ([14d2f65](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/14d2f653d215ce199e5e6c701c356849f6323415))
* softPanBounds settle runs as its own clean move lifecycle and is disposable ([ea485bb](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/ea485bba01380aa69f0664a734e2f6fff908f5f1))
* SSR stub covers the full controller API; add isSSRStub type guard ([e99c401](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/e99c401825014bd3a6427d4e3838e9bdb04c247c))
* SSR stub survives string coercion (Symbol.toPrimitive guard) ([204e193](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/204e19375c9f0318adf856784a807f1a4dfdca4f))
* stronger contextmenu suppression for two-finger/right-drag rotate; pointer-around zoom default ([8d94a4c](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/8d94a4c06321fc28994a1dd75075fd6b4c2b1371))
* suppress synthesized dblclick after a handled touch double-tap ([56bf75c](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/56bf75c93c7046012e4a57afe5f119b4f0a64cb1))
* **top-down:** avoid mirrored orientation at pitch=0 by setting camera.up to ground ‘north’ rotated by bearing; ensures bearing still rotates map in planar top-down (persp+ortho) ([b8c5b8f](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/b8c5b8f59278e2a39775b2e969c9325e0addbbd5))
* touch/keyboard/dblclick/mousePan/mouseRotatePitch honor explicit false ([f069826](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/f0698266e02daa273c31171d5d19a43c4a849520))
* wire manager onChange into keyboard/dblclick/boxZoom/touch handlers on the default path ([2e31531](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/2e31531f798885446fa0df64ec9d69fd58802f66))


### Performance Improvements

* avoid updateProjectionMatrix on every pan/rotate (perspective). Track _projDirty and only update projection after viewport change; ortho still updates per frustum change. ([2906046](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/290604611d21b225703d7ba5c836c6463c913776))
* **core:** add ITransform.deferApply batching; coalesce multiple setter calls in helpers and controller loops to a single camera apply per tick. Update perspective projection update strategy and tests. ([257f59d](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/257f59df43a1f553441011b9656443b1cf5d2b17))
* reduce frame drops while holding pointer by caching getBoundingClientRect during gestures (mouse pan/rotate, touch multi) and cleaning up global contextmenu listeners; remove duplicate overlay listeners in demo ([2be8b4c](https://github.com/RoveIQStudio/rovemaps-camera-controls/commit/2be8b4cf83d612541b31636d276f737e64cfdfbf))
