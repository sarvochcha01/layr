"use client";

import { useEffect, useRef, useCallback, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AnimationDefinition, ANIMATION_PRESETS, PresetMeta } from "@/types/animation";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Hook that applies GSAP animations to a component element.
 *
 * - Only runs in preview mode (no-op in editor).
 * - Entering preview = fresh page load: all animations replay from scratch.
 * - Supports multiple animations per component (chained).
 * - Supports timeline/stagger for container children.
 *
 * Performance: The effect is keyed on a JSON-serialized snapshot of the
 * animations array, so it only re-runs when animation data truly changes —
 * not on every parent re-render.
 */
export function useComponentAnimation(
  ref: React.RefObject<HTMLElement | null>,
  animations: AnimationDefinition[] | undefined,
  isPreviewMode: boolean,
) {
  const tweensRef = useRef<gsap.core.Tween[]>([]);
  const triggersRef = useRef<ScrollTrigger[]>([]);
  const timelinesRef = useRef<gsap.core.Timeline[]>([]);
  const listenersRef = useRef<Array<{ el: HTMLElement; event: string; handler: EventListener }>>([]);
  const hasInitializedRef = useRef(false);

  // Stable serialization — only changes when animation data actually changes
  const animKey = useMemo(
    () => (animations && animations.length > 0 ? JSON.stringify(animations) : ""),
    [animations],
  );

  const cleanup = useCallback(() => {
    if (!hasInitializedRef.current) return; // Nothing to clean up
    tweensRef.current.forEach((t) => t.kill());
    tweensRef.current = [];
    timelinesRef.current.forEach((tl) => tl.kill());
    timelinesRef.current = [];
    triggersRef.current.forEach((st) => st.kill());
    triggersRef.current = [];
    listenersRef.current.forEach(({ el, event, handler }) => {
      el.removeEventListener(event, handler);
    });
    listenersRef.current = [];
    if (ref.current) {
      gsap.set(ref.current, { clearProps: "all" });
    }
    hasInitializedRef.current = false;
  }, [ref]);

  useEffect(() => {
    // Fast path: nothing to do
    if (!isPreviewMode || !animKey) {
      if (hasInitializedRef.current) cleanup();
      return;
    }

    const el = ref.current;
    if (!el) return;

    const activeAnims: AnimationDefinition[] = JSON.parse(animKey);
    const enabled = activeAnims.filter((a) => a.enabled);
    if (enabled.length === 0) {
      if (hasInitializedRef.current) cleanup();
      return;
    }

    // Find scrollable container once
    const scroller = el.closest("[data-panel='canvas']") || window;

    const initTimeout = setTimeout(() => {
      // Set scroller default once (batched via module-level debounce)
      ScrollTrigger.defaults({ scroller });
      scheduleScrollTriggerRefresh();

      enabled.forEach((anim) => {
        try {
          applyAnimation(el, anim, scroller, tweensRef, triggersRef, timelinesRef, listenersRef);
        } catch (err) {
          console.warn(`[Animation] Failed to apply "${anim.preset}" (${anim.trigger}):`, err);
        }
      });
      hasInitializedRef.current = true;
    }, 100);

    return () => {
      clearTimeout(initTimeout);
      cleanup();
    };
    // animKey is a stable string — only changes when animation data truly changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, isPreviewMode, animKey, cleanup]);
}

// ─── Global batched ScrollTrigger refresh ────────────────
// Multiple components mounting simultaneously only trigger ONE refresh
let refreshTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleScrollTriggerRefresh() {
  if (refreshTimer) clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => {
    ScrollTrigger.refresh();
    refreshTimer = null;
  }, 200);
}

// ═══════════════════════════════════════════════════════════
// Core dispatcher
// ═══════════════════════════════════════════════════════════

function applyAnimation(
  el: HTMLElement,
  anim: AnimationDefinition,
  scroller: Element | Window,
  tweensRef: React.MutableRefObject<gsap.core.Tween[]>,
  triggersRef: React.MutableRefObject<ScrollTrigger[]>,
  timelinesRef: React.MutableRefObject<gsap.core.Timeline[]>,
  listenersRef: React.MutableRefObject<Array<{ el: HTMLElement; event: string; handler: EventListener }>>,
) {
  const preset = ANIMATION_PRESETS[anim.preset];
  if (!preset) return;

  const { duration, delay, ease } = anim;
  const isCustom = (anim.preset as string) === "custom";

  switch (anim.trigger) {
    case "onLoad":
      applyOnLoad(el, anim, preset, isCustom, duration, delay, ease, tweensRef, timelinesRef);
      break;
    case "onScroll":
      applyOnScroll(el, anim, preset, isCustom, duration, delay, ease, scroller, tweensRef, triggersRef, timelinesRef);
      break;
    case "onHover":
      applyOnHover(el, anim, preset, isCustom, duration, ease, tweensRef, listenersRef);
      break;
    case "onClick":
      applyOnClick(el, anim, preset, isCustom, duration, ease, tweensRef, listenersRef);
      break;
    case "whileInView":
      applyWhileInView(el, anim, preset, isCustom, duration, delay, ease, scroller, tweensRef, triggersRef);
      break;
    case "loop":
      applyLoop(el, anim, preset, isCustom, duration, delay, ease, tweensRef, timelinesRef);
      break;
  }
}

// ─── Helpers ─────────────────────────────────────────────

/** Get the "from" vars for a preset (the starting hidden state for entrances) */
function getFromVars(anim: AnimationDefinition, preset: PresetMeta, isCustom: boolean): Record<string, any> {
  return isCustom ? (anim.from || {}) : { ...preset.fromVars };
}

/** Get the "to" vars for a preset */
function getToVars(anim: AnimationDefinition, preset: PresetMeta, isCustom: boolean): Record<string, any> {
  return isCustom ? (anim.to || {}) : { ...(preset.toVars || {}) };
}

/**
 * For hover/click with entrance presets (mode="from"), we need to generate
 * a sensible hover effect instead of using fromVars (which would hide the element).
 * E.g., fadeIn's fromVars={opacity:0} should NOT set opacity to 0 on hover.
 * Instead, generate a subtle interactive version.
 */
function getInteractiveVars(preset: PresetMeta, isCustom: boolean, anim: AnimationDefinition): Record<string, any> {
  // For "to" mode presets (attention/exit), use toVars directly — they're designed for this
  if (preset.mode === "to" && preset.toVars) {
    return { ...preset.toVars };
  }

  // For custom, use the user's to values
  if (isCustom) {
    return anim.to || {};
  }

  // For "from" mode presets (entrance), generate interactive versions
  // Instead of going to the "hidden" state, create a subtle highlight effect
  const vars: Record<string, any> = {};
  const from = preset.fromVars;

  if (from.opacity !== undefined) {
    // Don't hide on hover — do a subtle opacity dip
    vars.opacity = 0.85;
  }
  if (from.y !== undefined) {
    // Move slightly in the opposite direction
    vars.y = from.y > 0 ? -8 : 8;
  }
  if (from.x !== undefined) {
    vars.x = from.x > 0 ? -6 : 6;
  }
  if (from.scale !== undefined) {
    // Subtle scale — zoom in slightly
    vars.scale = from.scale < 1 ? 1.05 : 0.95;
  }
  if (from.rotation !== undefined) {
    vars.rotation = from.rotation > 0 ? -3 : 3;
  }
  if (from.rotateX !== undefined) {
    vars.rotateX = 5;
  }
  if (from.rotateY !== undefined) {
    vars.rotateY = 5;
  }

  // If we generated nothing, fall back to a generic scale pulse
  if (Object.keys(vars).length === 0) {
    vars.scale = 1.03;
  }

  return vars;
}

/** Generate reset values to undo GSAP changes */
function getResetVars(vars: Record<string, any>): Record<string, any> {
  const reset: Record<string, any> = {};
  for (const key of Object.keys(vars)) {
    switch (key) {
      case "opacity":
        reset[key] = 1;
        break;
      case "x": case "y": case "rotation": case "rotateX": case "rotateY":
        reset[key] = 0;
        break;
      case "scale": case "scaleX": case "scaleY":
        reset[key] = 1;
        break;
      default:
        reset[key] = 0;
    }
  }
  return reset;
}

// ─── On Load ─────────────────────────────────────────────

function applyOnLoad(
  el: HTMLElement,
  anim: AnimationDefinition,
  preset: PresetMeta,
  isCustom: boolean,
  duration: number,
  delay: number,
  ease: string,
  tweensRef: React.MutableRefObject<gsap.core.Tween[]>,
  timelinesRef: React.MutableRefObject<gsap.core.Timeline[]>,
) {
  // Stagger children
  if (anim.stagger && anim.stagger > 0 && el.children.length > 0) {
    const tl = gsap.timeline({ delay });
    const fromVars = getFromVars(anim, preset, isCustom);
    tl.from(Array.from(el.children), {
      ...fromVars,
      duration,
      ease,
      stagger: { amount: anim.stagger * el.children.length, from: anim.staggerFrom || "start" },
    });
    timelinesRef.current.push(tl);
    return;
  }

  if (preset.mode === "from" || isCustom) {
    const tween = gsap.from(el, { ...getFromVars(anim, preset, isCustom), duration, delay, ease });
    tweensRef.current.push(tween);
  } else if (preset.mode === "to") {
    const tween = gsap.to(el, { ...getToVars(anim, preset, isCustom), duration, delay, ease, yoyo: true, repeat: 1 });
    tweensRef.current.push(tween);
  } else if (preset.mode === "fromTo") {
    const tween = gsap.fromTo(el, getFromVars(anim, preset, isCustom), { ...getToVars(anim, preset, isCustom), duration, delay, ease });
    tweensRef.current.push(tween);
  }
}

// ─── On Scroll ───────────────────────────────────────────

function applyOnScroll(
  el: HTMLElement,
  anim: AnimationDefinition,
  preset: PresetMeta,
  isCustom: boolean,
  duration: number,
  delay: number,
  ease: string,
  scroller: Element | Window,
  tweensRef: React.MutableRefObject<gsap.core.Tween[]>,
  triggersRef: React.MutableRefObject<ScrollTrigger[]>,
  timelinesRef: React.MutableRefObject<gsap.core.Timeline[]>,
) {
  const scrollConfig: ScrollTrigger.Vars = {
    trigger: el,
    scroller,
    start: anim.scrollStart || "top 80%",
    end: anim.scrollEnd || "top 20%",
    scrub: anim.scrub || false,
    toggleActions: "play none none none",
  };

  // Stagger children
  if (anim.stagger && anim.stagger > 0 && el.children.length > 0) {
    const tl = gsap.timeline({ scrollTrigger: scrollConfig, delay });
    tl.from(Array.from(el.children), {
      ...getFromVars(anim, preset, isCustom),
      duration,
      ease,
      stagger: { amount: anim.stagger * el.children.length, from: anim.staggerFrom || "start" },
    });
    timelinesRef.current.push(tl);
    if (tl.scrollTrigger) triggersRef.current.push(tl.scrollTrigger);
    return;
  }

  if (preset.mode === "fromTo") {
    const tween = gsap.fromTo(el, getFromVars(anim, preset, isCustom), {
      ...getToVars(anim, preset, isCustom),
      duration, ease,
      scrollTrigger: { ...scrollConfig, scrub: true },
    });
    tweensRef.current.push(tween);
    if (tween.scrollTrigger) triggersRef.current.push(tween.scrollTrigger);
  } else if (preset.mode === "from" || isCustom) {
    const tween = gsap.from(el, {
      ...getFromVars(anim, preset, isCustom),
      duration, delay, ease,
      scrollTrigger: scrollConfig,
    });
    tweensRef.current.push(tween);
    if (tween.scrollTrigger) triggersRef.current.push(tween.scrollTrigger);
  } else {
    const tween = gsap.to(el, {
      ...getToVars(anim, preset, isCustom),
      duration, delay, ease,
      scrollTrigger: scrollConfig,
    });
    tweensRef.current.push(tween);
    if (tween.scrollTrigger) triggersRef.current.push(tween.scrollTrigger);
  }
}

// ─── On Hover ────────────────────────────────────────────

function applyOnHover(
  el: HTMLElement,
  anim: AnimationDefinition,
  preset: PresetMeta,
  isCustom: boolean,
  duration: number,
  ease: string,
  tweensRef: React.MutableRefObject<gsap.core.Tween[]>,
  listenersRef: React.MutableRefObject<Array<{ el: HTMLElement; event: string; handler: EventListener }>>,
) {
  // Use interactive vars — NOT fromVars (which would hide the element for entrance presets)
  const hoverVars = getInteractiveVars(preset, isCustom, anim);
  let hoverTween: gsap.core.Tween | null = null;

  const onEnter = () => {
    hoverTween?.kill();
    hoverTween = gsap.to(el, { ...hoverVars, duration, ease });
    tweensRef.current.push(hoverTween);
  };

  const onLeave = () => {
    if (anim.reverse !== false) {
      hoverTween?.kill();
      hoverTween = gsap.to(el, { ...getResetVars(hoverVars), duration: duration * 0.6, ease });
      tweensRef.current.push(hoverTween);
    }
  };

  el.addEventListener("mouseenter", onEnter);
  el.addEventListener("mouseleave", onLeave);
  listenersRef.current.push({ el, event: "mouseenter", handler: onEnter });
  listenersRef.current.push({ el, event: "mouseleave", handler: onLeave });
}

// ─── On Click ────────────────────────────────────────────

function applyOnClick(
  el: HTMLElement,
  anim: AnimationDefinition,
  preset: PresetMeta,
  isCustom: boolean,
  duration: number,
  ease: string,
  tweensRef: React.MutableRefObject<gsap.core.Tween[]>,
  listenersRef: React.MutableRefObject<Array<{ el: HTMLElement; event: string; handler: EventListener }>>,
) {
  const clickVars = getInteractiveVars(preset, isCustom, anim);
  let isActive = false;

  const onClick = () => {
    if (anim.reverse && isActive) {
      const tween = gsap.to(el, { ...getResetVars(clickVars), duration: duration * 0.6, ease });
      tweensRef.current.push(tween);
      isActive = false;
    } else {
      const tween = gsap.to(el, { ...clickVars, duration, ease });
      tweensRef.current.push(tween);
      isActive = true;
      if (!anim.reverse) {
        const resetTween = gsap.to(el, {
          ...getResetVars(clickVars),
          duration: duration * 0.5, ease, delay: duration,
        });
        tweensRef.current.push(resetTween);
      }
    }
  };

  el.addEventListener("click", onClick);
  listenersRef.current.push({ el, event: "click", handler: onClick });
}

// ─── While In View ───────────────────────────────────────

function applyWhileInView(
  el: HTMLElement,
  anim: AnimationDefinition,
  preset: PresetMeta,
  isCustom: boolean,
  duration: number,
  delay: number,
  ease: string,
  scroller: Element | Window,
  tweensRef: React.MutableRefObject<gsap.core.Tween[]>,
  triggersRef: React.MutableRefObject<ScrollTrigger[]>,
) {
  const scrollOpts: ScrollTrigger.Vars = {
    trigger: el,
    scroller,
    start: anim.scrollStart || "top 80%",
    end: anim.scrollEnd || "bottom 20%",
    toggleActions: "play reverse play reverse",
  };

  if (preset.mode === "from" || isCustom) {
    const tween = gsap.from(el, {
      ...getFromVars(anim, preset, isCustom),
      duration, delay, ease,
      scrollTrigger: scrollOpts,
    });
    tweensRef.current.push(tween);
    if (tween.scrollTrigger) triggersRef.current.push(tween.scrollTrigger);
  } else {
    const tween = gsap.to(el, {
      ...getToVars(anim, preset, isCustom),
      duration, delay, ease,
      scrollTrigger: scrollOpts,
    });
    tweensRef.current.push(tween);
    if (tween.scrollTrigger) triggersRef.current.push(tween.scrollTrigger);
  }
}

// ─── Loop ────────────────────────────────────────────────

function applyLoop(
  el: HTMLElement,
  anim: AnimationDefinition,
  preset: PresetMeta,
  isCustom: boolean,
  duration: number,
  delay: number,
  ease: string,
  tweensRef: React.MutableRefObject<gsap.core.Tween[]>,
  timelinesRef: React.MutableRefObject<gsap.core.Timeline[]>,
) {
  const repeat = anim.repeat ?? -1;
  const yoyo = anim.yoyo !== false;

  // Special multi-step timelines
  if (anim.preset === "shake") {
    const tl = gsap.timeline({ repeat, delay, yoyo: false });
    tl.to(el, { x: -10, duration: 0.06, ease: "power1.inOut" })
      .to(el, { x: 10, duration: 0.06, ease: "power1.inOut" })
      .to(el, { x: -8, duration: 0.06, ease: "power1.inOut" })
      .to(el, { x: 8, duration: 0.06, ease: "power1.inOut" })
      .to(el, { x: -4, duration: 0.06, ease: "power1.inOut" })
      .to(el, { x: 0, duration: 0.06, ease: "power1.inOut" })
      .to(el, { duration: 0.5 });
    timelinesRef.current.push(tl);
    return;
  }

  if (anim.preset === "heartbeat") {
    const tl = gsap.timeline({ repeat, delay });
    tl.to(el, { scale: 1.15, duration: 0.15, ease: "power2.inOut" })
      .to(el, { scale: 1, duration: 0.15, ease: "power2.inOut" })
      .to(el, { scale: 1.1, duration: 0.12, ease: "power2.inOut" })
      .to(el, { scale: 1, duration: 0.15, ease: "power2.inOut" })
      .to(el, { duration: 0.6 });
    timelinesRef.current.push(tl);
    return;
  }

  // Generic loop — use toVars for attention presets, fromVars (as targets) for entrance presets
  if (preset.mode === "to" && preset.toVars) {
    const tween = gsap.to(el, { ...getToVars(anim, preset, isCustom), duration, delay, ease, repeat, yoyo });
    tweensRef.current.push(tween);
  } else {
    // For entrance presets in loop mode, animate TO the fromVars and yoyo back
    const tween = gsap.to(el, { ...getFromVars(anim, preset, isCustom), duration, delay, ease, repeat, yoyo });
    tweensRef.current.push(tween);
  }
}
