import Hammer from "hammerjs";

/**
 * Gesture machinery for the map: Hammer recognizers, rubber-band limits at
 * the zoom cap / fitted state / pan bounds, fling inertia, and the settle
 * tweens that ease the map back inside after an overshoot.
 *
 * The component owns the svg-pan-zoom instance; this module owns everything
 * that makes it feel native under touch.
 */

// ---- Zoom limits ------------------------------------------------------------

/** Maximum relative zoom (1 = fitted); pinch may overshoot with resistance. */
const MAX_ZOOM = 2;
/** Asymptotic pinch overshoot beyond MAX_ZOOM. */
const ZOOM_RANGE = 1;
/** Asymptotic pinch undershoot below the fitted zoom. */
const DOWN_RANGE = 0.35;
/** Hard library caps so pinch over/undershoot stays bounded. */
export const LIB_MAX_ZOOM = MAX_ZOOM + ZOOM_RANGE;
export const LIB_MIN_ZOOM = 1 - DOWN_RANGE;
/** Relative zoom above which panning unlocks. */
const PAN_UNLOCK_ZOOM = 1.02;
/** Wheel / doubletap zoom step factor (svg-pan-zoom option). */
export const ZOOM_SENSITIVITY = 0.3;

// ---- Pan rubber band --------------------------------------------------------

/** Asymptotic px overshoot when dragging past the pan bounds. */
const PAN_RANGE = 60;

// ---- Motion tuning ----------------------------------------------------------

const PAN_SETTLE_MS = 200;
const ZOOM_SETTLE_MS = 280;
/** Hammer echoes panend right after a pinch; ignore releases in this window. */
const PINCH_RELEASE_GUARD_MS = 50;
/** Fling velocity decay factor per ms of travel. */
const INERTIA_DAMPING = 0.004;
/** Release speed (px/ms) below which no fling starts. */
const INERTIA_MIN_VELOCITY = 0.1;
/** Fling ends when decayed speed drops below this (px/ms). */
const INERTIA_STOP_VELOCITY = 0.02;
/** Cap on the per-frame step so a stalled frame can't teleport the map. */
const INERTIA_MAX_STEP_MS = 50;

/** Touch events the library must not handle — Hammer owns them. */
export const HALTED_TOUCH_EVENTS = [
  "touchstart",
  "touchend",
  "touchmove",
  "touchleave",
  "touchcancel",
];

// ---- Shared state -----------------------------------------------------------

/**
 * Flags the svg-pan-zoom guards read to decide how hard a limit is.
 * `internal` is set around every tween-driven transform write so the guards
 * let settle animations through; `pinching` is set for a live pinch so the
 * limits rubber-band instead of hard-stopping.
 */
export type GestureGuards = { internal: boolean; pinching: boolean };

type FrameSlot = { id: number };

export type GestureContext = {
  guards: GestureGuards;
  frames: { inertia: FrameSlot; panSettle: FrameSlot; zoomSettle: FrameSlot };
};

export const createGestureContext = (): GestureContext => ({
  guards: { internal: false, pinching: false },
  frames: { inertia: { id: 0 }, panSettle: { id: 0 }, zoomSettle: { id: 0 } },
});

const cancelFrame = (slot: FrameSlot) => {
  if (slot.id) {
    cancelAnimationFrame(slot.id);
    slot.id = 0;
  }
};

export const stopAllMotion = ({ frames }: GestureContext) => {
  cancelFrame(frames.inertia);
  cancelFrame(frames.panSettle);
  cancelFrame(frames.zoomSettle);
};

/** Run `fn` with the guards open, for transform writes driven by a settle. */
const withInternal = (guards: GestureGuards, fn: () => void) => {
  guards.internal = true;
  fn();
  guards.internal = false;
};

// ---- Math helpers -----------------------------------------------------------

const easeOutCubic = (k: number) => 1 - Math.pow(1 - k, 3);

/**
 * Rubber-band offset: eases in with slope 1 at the boundary and approaches
 * `range` asymptotically, so crossing a limit never kinks the motion.
 */
const rubber = (excess: number, range: number) =>
  range * (1 - Math.exp(-excess / range));

type PanPoint = { x: number; y: number };

/** Legal pan range keeping the content bounds covering the viewport. */
const clampPan = (inst: SvgPanZoom.Instance, pan: PanPoint): PanPoint => {
  const sizes = inst.getSizes();
  const vb = sizes.viewBox;
  const rz = sizes.realZoom;
  // Content screen rect: vb.x * rz + pan.x .. (vb.x + vb.width) * rz + pan.x
  const minX = sizes.width - (vb.x + vb.width) * rz;
  const maxX = -vb.x * rz;
  const minY = sizes.height - (vb.y + vb.height) * rz;
  const maxY = -vb.y * rz;
  const axis = (min: number, max: number, v: number) =>
    min <= max ? Math.min(max, Math.max(min, v)) : (min + max) / 2;
  return { x: axis(minX, maxX, pan.x), y: axis(minY, maxY, pan.y) };
};

const isOutside = (inst: SvgPanZoom.Instance, pan: PanPoint) => {
  const clamped = clampPan(inst, pan);
  return clamped.x !== pan.x || clamped.y !== pan.y;
};

/** Pinch target scale: free inside the caps, rubber-banded past either end. */
const pinchZoomTarget = (requested: number) =>
  requested >= 1
    ? requested <= MAX_ZOOM
      ? requested
      : MAX_ZOOM + rubber(requested - MAX_ZOOM, ZOOM_RANGE)
    : 1 - rubber(1 - requested, DOWN_RANGE);

/** Zoom and pan of the centered fitted state, in library coordinates. */
const fitView = (inst: SvgPanZoom.Instance) => {
  const sizes = inst.getSizes();
  const vb = sizes.viewBox;
  const zoom = Math.min(sizes.width / vb.width, sizes.height / vb.height);
  return {
    zoom,
    pan: {
      x: (sizes.width - (vb.width + 2 * vb.x) * zoom) / 2,
      y: (sizes.height - (vb.height + 2 * vb.y) * zoom) / 2,
    },
  };
};

// ---- svg-pan-zoom guards ----------------------------------------------------

/**
 * beforePan: while fitted, panning is refused so the map stays locked in
 * place; during a pinch or a settle the clamp still applies but eases the
 * overshoot like an overscroll bounce.
 */
export const constrainPan = (
  inst: SvgPanZoom.Instance,
  guards: GestureGuards,
  pan: PanPoint,
): PanPoint | false => {
  if (
    !guards.internal &&
    !guards.pinching &&
    inst.getZoom() <= PAN_UNLOCK_ZOOM
  ) {
    return false;
  }
  const clamped = clampPan(inst, pan);
  const axis = (next: number, legal: number) =>
    legal + Math.sign(next - legal) * rubber(Math.abs(next - legal), PAN_RANGE);
  return { x: axis(pan.x, clamped.x), y: axis(pan.y, clamped.y) };
};

/**
 * beforeZoom: outside a pinch or a settle nothing may zoom past MAX_ZOOM or
 * below the fitted zoom (the library bounds are looser to allow rubber-band
 * over/undershoot); zooming out is otherwise free.
 */
export const allowZoom = (
  inst: SvgPanZoom.Instance,
  guards: GestureGuards,
  newScale: number,
) =>
  guards.pinching ||
  guards.internal ||
  (newScale >= 1 && (newScale <= MAX_ZOOM || newScale < inst.getZoom()));

/**
 * onZoom: zooming out past the fit snaps back to the centered fitted state,
 * since pan offsets cannot be undone while panning is locked. During a pinch
 * the snap is deferred to pinchend so the gesture isn't jarred.
 */
export const snapBackIfUndershot = (
  inst: SvgPanZoom.Instance,
  guards: GestureGuards,
  newZoom: number,
) => {
  if (guards.internal || guards.pinching || newZoom > PAN_UNLOCK_ZOOM) {
    return;
  }
  withInternal(guards, () => inst.reset());
};

// ---- Settle tweens ----------------------------------------------------------

/** RAF tween over `ms` with easeOutCubic; cancels any tween on the slot. */
const tween = (
  slot: FrameSlot,
  ms: number,
  apply: (eased: number) => void,
  onDone?: () => void,
) => {
  cancelFrame(slot);
  const t0 = performance.now();
  const tick = (now: number) => {
    const k = Math.min((now - t0) / ms, 1);
    apply(easeOutCubic(k));
    if (k < 1) {
      slot.id = requestAnimationFrame(tick);
    } else {
      slot.id = 0;
      onDone?.();
    }
  };
  slot.id = requestAnimationFrame(tick);
};

// ---- Hammer wiring ----------------------------------------------------------

/**
 * Attach Hammer to the svg and wire every gesture handler. `ctx` is shared
 * with the component so its svg-pan-zoom guards see the same flags and frame
 * slots; session state (pan baseline, pinch anchor, …) stays local here.
 */
export const bindGestures = (
  { instance, svgElement }: SvgPanZoom.CustomEventOptions,
  ctx: GestureContext,
): HammerManager => {
  const { guards, frames } = ctx;
  let initialScale = 1;
  let pannedX = 0;
  let pannedY = 0;
  let lastCenter: HammerPoint | null = null;
  let lastSvgAnchor: PanPoint | null = null;
  let pinchEndAt = 0;

  /** Ease an out-of-bounds pan back inside — the rubber-band return. */
  const settleToBounds = () => {
    const start = instance.getPan();
    const target = clampPan(instance, start);
    if (start.x === target.x && start.y === target.y) {
      return;
    }
    tween(frames.panSettle, PAN_SETTLE_MS, (e) =>
      instance.pan({
        x: start.x + (target.x - start.x) * e,
        y: start.y + (target.y - start.y) * e,
      }),
    );
  };

  /**
   * Ease an undershot pinch back to the centered fit: both the zoom and the
   * recentering pan are animated so nothing snaps.
   */
  const settleToFit = () => {
    const fit = fitView(instance);
    const startZoom = instance.getZoom();
    const startPan = instance.getPan();
    tween(frames.zoomSettle, ZOOM_SETTLE_MS, (e) =>
      withInternal(guards, () => {
        instance.zoom(startZoom + (1 - startZoom) * e);
        instance.pan({
          x: startPan.x + (fit.pan.x - startPan.x) * e,
          y: startPan.y + (fit.pan.y - startPan.y) * e,
        });
      }),
    );
  };

  const hammer = new Hammer(svgElement, {
    inputClass:
      typeof PointerEvent !== "undefined"
        ? Hammer.PointerEventInput
        : Hammer.TouchInput,
    touchAction: "none",
  });
  hammer.get("pinch").set({ enable: true });
  hammer.get("pan").set({ direction: Hammer.DIRECTION_ALL });
  // Let pan and pinch emit together; pinchmove owns the translation while a
  // pinch is live, and pan takes over seamlessly when a finger lifts.
  hammer.get("pinch").recognizeWith(hammer.get("pan"));
  hammer.on("doubletap", () => instance.zoomIn());

  // A new drag takes over inertia/pan settling, but a zoom settle is short
  // enough to finish underneath the finger.
  hammer.on("panstart", () => {
    cancelFrame(frames.inertia);
    cancelFrame(frames.panSettle);
  });
  hammer.on("pinchstart", () => stopAllMotion(ctx));

  hammer.on("panstart panmove", (ev) => {
    // ev.deltaX/Y accumulate over the whole touch session, so a pan
    // re-engaging after a pinch carries the pinch's displacement —
    // re-baseline on panstart or the map jumps. During an active pinch the
    // baseline still tracks so the handoff is seamless.
    if (ev.type === "panstart") {
      pannedX = ev.deltaX;
      pannedY = ev.deltaY;
      return;
    }
    if (!guards.pinching) {
      instance.panBy({ x: ev.deltaX - pannedX, y: ev.deltaY - pannedY });
    }
    pannedX = ev.deltaX;
    pannedY = ev.deltaY;
  });

  // Fling inertia: decay the release velocity until it dies out, then ease
  // back inside if the pan ended past the bounds.
  hammer.on("panend", (ev) => {
    // A pinch release also fires panend; pinchend already owns the settle,
    // and leftover pinch velocity must not fling the map.
    if (performance.now() - pinchEndAt < PINCH_RELEASE_GUARD_MS) {
      return;
    }
    if (isOutside(instance, instance.getPan())) {
      settleToBounds();
      return;
    }
    let vx = ev.velocityX;
    let vy = ev.velocityY;
    if (Math.hypot(vx, vy) < INERTIA_MIN_VELOCITY) {
      return;
    }
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(now - last, INERTIA_MAX_STEP_MS);
      last = now;
      instance.panBy({ x: vx * dt, y: vy * dt });
      const damp = Math.exp(-dt * INERTIA_DAMPING);
      vx *= damp;
      vy *= damp;
      if (
        isOutside(instance, instance.getPan()) ||
        Math.hypot(vx, vy) < INERTIA_STOP_VELOCITY
      ) {
        frames.inertia.id = 0;
        settleToBounds();
        return;
      }
      frames.inertia.id = requestAnimationFrame(step);
    };
    frames.inertia.id = requestAnimationFrame(step);
  });

  hammer.on("pinchstart pinchmove", (ev) => {
    if (ev.type === "pinchstart") {
      guards.pinching = true;
      initialScale = instance.getZoom();
      lastCenter = null;
      lastSvgAnchor = null;
    }
    const screenCTM = svgElement.getScreenCTM();
    if (!screenCTM) {
      return;
    }
    const point = new DOMPoint(ev.center.x, ev.center.y).matrixTransform(
      screenCTM.inverse(),
    );
    lastSvgAnchor = { x: point.x, y: point.y };
    instance.zoomAtPoint(
      pinchZoomTarget(initialScale * ev.scale),
      lastSvgAnchor,
    );
    // Two-finger translate pans the map alongside the zoom.
    if (lastCenter) {
      instance.panBy({
        x: ev.center.x - lastCenter.x,
        y: ev.center.y - lastCenter.y,
      });
    }
    lastCenter = ev.center;
  });

  hammer.on("pinchend pinchcancel", () => {
    guards.pinching = false;
    pinchEndAt = performance.now();
    const zoom = instance.getZoom();
    if (zoom <= PAN_UNLOCK_ZOOM) {
      settleToFit();
      return;
    }
    // Ease an overshot pinch back to the cap, anchored under the last pinch
    // center so the map doesn't jump; the pan settle runs only afterward so
    // the two tweens never fight.
    if (zoom > MAX_ZOOM) {
      const from = zoom;
      const anchor = lastSvgAnchor;
      tween(
        frames.zoomSettle,
        ZOOM_SETTLE_MS,
        (e) => {
          const s = from + (MAX_ZOOM - from) * e;
          if (anchor) {
            instance.zoomAtPoint(s, anchor);
          } else {
            instance.zoom(s);
          }
        },
        settleToBounds,
      );
      return;
    }
    settleToBounds();
  });

  return hammer;
};
