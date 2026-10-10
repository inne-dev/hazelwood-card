# Hazelwood: performance on weak phones

Research: 2026-10-10. Scope: preserve carousel autoplay/manual controls, ambient lighting, interactive header decoration, themes, languages and authenticated map. Recommendations below are engineering proposals, not measured performance claims.

## Animation strategy

Prefer CSS/WAAPI `transform` and `opacity` for the carousel and light crossfade. These properties can avoid repeated layout/paint; switching to JavaScript alone does not make an expensive effect cheaper. Compositor layers still consume memory and need management, so avoid permanent `will-change`/`translateZ(0)` on every large element. [web.dev animation guide](https://web.dev/articles/animations-guide), [layer management](https://web.dev/articles/stick-to-compositor-only-properties-and-manage-layer-count).

For this app: retain prerendered ambient WebPs, keep only the outgoing/incoming light layers during a fade, and keep the settled frame static. Flatten multiple rays/blur into the asset during generation. This proposal preserves the appearance while reducing the number of runtime layers; its benefit must be measured. [Rendering pipeline and layer costs](https://web.dev/articles/animations-overview).

## What a 25 fps cap does

`requestAnimationFrame` normally follows display refresh and provides a timestamp. For custom vine physics, render at most once per 40 ms using that timestamp; advance motion by elapsed time, stop scheduling when settled, and restart after input. This limits this animation's JS/DOM updates. It is **not a global browser/GPU frame cap**, and does not throttle independently running CSS transitions; that conclusion follows from the separate rAF and compositor animation mechanisms. Prefer a compositor fade for photos; use 25 fps for custom decoration only if profiling shows a benefit. On a 60 Hz screen, 25 fps also produces uneven refresh spacing (an arithmetic consequence of 60/25), so compare it with 30 fps visually. [MDN rAF](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame), [CSS/compositor behavior](https://web.dev/articles/animations-and-performance/).

## Pause invisible work

Keep autoplay, but run its timer only while the document and carousel are visible. Use `visibilitychange` for the tab and `IntersectionObserver` for the carousel; resume without replaying missed transitions. Pause header motion when its element is outside the viewport. Page Visibility explicitly supports carousel use cases; Intersection Observer observes viewport intersection asynchronously. [Page Visibility](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API), [Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API).

## Images and map

Load/decode the current and next scene rather than all six day/night scenes; wait for `decode()` before swapping and retain the old scene if loading fails. `decode()` resolves when an image is decoded and ready for insertion. Give scene images responsive candidates through `srcset`/`sizes` so phones need not download desktop dimensions. Apply the same bounded preparation to ambient assets instead of warming every theme eagerly. [Image decode](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/decode), [responsive image selection](https://web.dev/learn/performance/image-performance).

Keep the public cached map image and create the interactive iframe only when the authorized user opens its modal; remove its `src` on close. This is a proposal following deferred resource loading, and avoids keeping a hidden interactive renderer active. [MDN lazy loading](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Lazy_loading).

## Applied to Hazelwood

The carousel now keeps two scene image elements for crossfades and advertises 840 px, 1200 px, and full-size candidates. Browsers can choose a closer match for device pixel density instead of jumping from 840 px directly to the 1672 px source. Pre-rendered light assets remain cached in the background so changing scenes does not compute the rays on the client.

Header vines use a damped spring that updates at most 25 times per second, reacts to pointer movement, and pauses when the hero leaves view, the tab is hidden, or reduced motion is requested. This caps only the vine simulation updates; it does not cap CSS transitions or the browser's overall frame rate. The simulation has not been profiled on a weak phone, so its visual smoothness and GPU impact still need a real-device check.

## Acceptance checks

Record idle, autoplay transition, manual switching, scrolling, header interaction and map open/close before and after. Inspect layout/paint and layer count; use calibrated low-tier CPU throttling plus a real weak Android phone. CPU throttling approximates device CPU performance; device emulation does not reproduce every mobile hardware characteristic, so it cannot prove reduced GPU load by itself. [Chrome throttling settings](https://developer.chrome.com/docs/devtools/settings/throttling), [Device Mode limitations](https://developer.chrome.com/docs/devtools/device-mode), [animation diagnostics](https://web.dev/articles/animations-guide).
