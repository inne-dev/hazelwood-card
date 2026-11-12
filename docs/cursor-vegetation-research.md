# Hazelwood: cursor-reactive vegetation

Research: 2026-10-10. Scope: add static pixel-art vegetation beyond the existing vines. Existing vines remain drag/stretch only and receive no cursor proximity response. Recommendations are engineering proposals, not measured performance claims.

## Recommended implementation

Add a small set of local SVG plants around the header, card edges and footer. Use stepped stems and square leaves matching the site's existing pixel artwork. Give each plant a fixed base and a movable upper group. Keep the artwork static at rest and move only the upper group with a CSS `transform`.

Use pointer events to set a bounded transform target on nearby new plants. Start with a 70 CSS px influence radius, at most 4 CSS px translation and 3 degrees rotation. Let a short CSS transition smooth each change and return to the identity transform after the pointer leaves. Those values are visual tuning proposals. CSS transitions interpolate changed property values over a specified duration, so this interaction needs no continuing JavaScript simulation. [W3C CSS Transitions](https://www.w3.org/TR/css-transitions-1/#transitions).

Use one passive `pointermove` listener for the decoration region. Store the latest coordinates and schedule at most one pending `requestAnimationFrame` callback to calculate nearby plant targets and batch style writes. Schedule another callback only after new input, scrolling or resizing. Cache plant bounds until layout changes and read bounds before writing styles. Reset targets on `pointerleave`. Pointer Events permits coalescing movement events; rAF callbacks are one-shot unless explicitly rescheduled. [W3C Pointer Events](https://www.w3.org/TR/pointerevents3/#the-pointermove-event), [HTML animation frames](https://html.spec.whatwg.org/multipage/imagebitmap-and-animations.html#animation-frames).

Keep decoration hit testing disabled so plants do not cover links or buttons. Listen on the surrounding region, and apply proximity checks only to the new plant elements. Treat the SVG as decorative with `aria-hidden="true"`. Do not add dragging, wind, spring physics or timers to these plants unless an explicit interaction later requires them.

## Motion and rendering limits

Restrict cursor response to hover-capable input and ignore touch movement. Keep touch scrolling usable. Use pointer type for mixed input devices rather than assuming a hover media query describes every device. When reduced motion is requested, keep the plants static and disable transitions. [W3C interaction media queries](https://www.w3.org/TR/mediaqueries-4/#mf-interaction), [Pointer Events device types](https://www.w3.org/TR/pointerevents3/#pointerevent-interface), [reduced motion](https://www.w3.org/TR/mediaqueries-5/#prefers-reduced-motion).

Use transform updates instead of changing stem paths, positions or dimensions during motion. Avoid animated filters, blur and shadows, and avoid permanent `will-change` on every plant. Chrome's animation guidance recommends transform and opacity to avoid repeated layout/paint where possible. Actual SVG compositing behavior still needs profiling; CSS alone does not guarantee cheap rendering. [Chrome team's animation guide](https://web.dev/articles/animations-guide).

Use integer coordinates for resting artwork and `shape-rendering: crispEdges` for SVG blocks. Keep rotation small because `crispEdges` is a rendering hint and does not guarantee pixel alignment while transformed. [SVG shape-rendering specification](https://www.w3.org/TR/SVG2/painting.html#ShapeRenderingProperty).

Before claiming a performance benefit, compare idle, pointer motion, return to rest and scrolling on a weak phone. Idle should have no scheduled plant callbacks or active plant transitions. No application code was changed and no profiling or tests were run for this research.
