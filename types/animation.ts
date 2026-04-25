// ═══════════════════════════════════════════════════════════
// Animation System Types & Preset Registry
// ═══════════════════════════════════════════════════════════

export type AnimationTrigger =
  | "onLoad"       // When page/component first appears
  | "onScroll"     // When scrolled into viewport (ScrollTrigger)
  | "onHover"      // Mouse enter/leave
  | "onClick"      // Click/tap
  | "whileInView"  // Continuous while visible in viewport
  | "loop";        // Infinite loop animation

export type AnimationPreset =
  // Entrance
  | "fadeIn"
  | "fadeInUp"
  | "fadeInDown"
  | "fadeInLeft"
  | "fadeInRight"
  | "slideUp"
  | "slideDown"
  | "slideLeft"
  | "slideRight"
  | "zoomIn"
  | "zoomOut"
  | "flipX"
  | "flipY"
  | "bounceIn"
  | "rotateIn"
  // Attention / Emphasis
  | "pulse"
  | "shake"
  | "bounce"
  | "wiggle"
  | "flash"
  | "heartbeat"
  // Exit
  | "fadeOut"
  | "fadeOutUp"
  | "fadeOutDown"
  | "slideOutLeft"
  | "slideOutRight"
  // Special
  | "parallax"
  | "custom";

export type AnimationCategory = "entrance" | "attention" | "exit" | "special";

export type EasePreset =
  | "power1.out"
  | "power2.out"
  | "power3.out"
  | "power4.out"
  | "power1.inOut"
  | "power2.inOut"
  | "power3.inOut"
  | "back.out(1.7)"
  | "back.inOut(1.7)"
  | "elastic.out(1,0.3)"
  | "bounce.out"
  | "circ.out"
  | "expo.out"
  | "sine.out"
  | "sine.inOut"
  | "linear"
  | "none";

export interface AnimationDefinition {
  id: string;
  trigger: AnimationTrigger;
  preset: AnimationPreset;

  // Timing
  duration: number;       // seconds (default: 0.6)
  delay: number;          // seconds (default: 0)
  ease: string;           // GSAP easing string

  // Scroll-specific
  scrollStart?: string;   // e.g. "top 80%"
  scrollEnd?: string;     // e.g. "top 20%"
  scrub?: boolean;        // Tie progress to scroll position

  // Hover/Click-specific
  reverse?: boolean;      // Reverse on mouse leave / second click

  // Stagger (for container children)
  stagger?: number;       // seconds between each child
  staggerFrom?: "start" | "end" | "center" | "edges" | "random";

  // Repeat
  repeat?: number;        // -1 for infinite
  yoyo?: boolean;         // Reverse on each repeat

  // Custom overrides (when preset = "custom")
  from?: Record<string, any>;
  to?: Record<string, any>;

  // State
  enabled: boolean;
}

// ─── Preset Metadata ─────────────────────────────────────

export interface PresetMeta {
  label: string;
  category: AnimationCategory;
  icon: string;            // Emoji for quick visual reference
  description: string;
  /** GSAP "from" values — the starting state before animating to natural position */
  fromVars: Record<string, any>;
  /** GSAP "to" values — used for attention/loop animations */
  toVars?: Record<string, any>;
  /** Default duration for this preset */
  defaultDuration: number;
  /** Default ease for this preset */
  defaultEase: string;
  /** Whether this preset naturally works with "from" (entrance) or "to" (attention/exit) */
  mode: "from" | "to" | "fromTo";
}

export const ANIMATION_PRESETS: Record<AnimationPreset, PresetMeta> = {
  // ═══ ENTRANCE ═══
  fadeIn: {
    label: "Fade In",
    category: "entrance",
    icon: "✨",
    description: "Fades in from transparent",
    fromVars: { opacity: 0 },
    defaultDuration: 0.6,
    defaultEase: "power2.out",
    mode: "from",
  },
  fadeInUp: {
    label: "Fade In Up",
    category: "entrance",
    icon: "⬆️",
    description: "Fades in while sliding up",
    fromVars: { opacity: 0, y: 40 },
    defaultDuration: 0.7,
    defaultEase: "power2.out",
    mode: "from",
  },
  fadeInDown: {
    label: "Fade In Down",
    category: "entrance",
    icon: "⬇️",
    description: "Fades in while sliding down",
    fromVars: { opacity: 0, y: -40 },
    defaultDuration: 0.7,
    defaultEase: "power2.out",
    mode: "from",
  },
  fadeInLeft: {
    label: "Fade In Left",
    category: "entrance",
    icon: "⬅️",
    description: "Fades in while sliding from the left",
    fromVars: { opacity: 0, x: -60 },
    defaultDuration: 0.7,
    defaultEase: "power2.out",
    mode: "from",
  },
  fadeInRight: {
    label: "Fade In Right",
    category: "entrance",
    icon: "➡️",
    description: "Fades in while sliding from the right",
    fromVars: { opacity: 0, x: 60 },
    defaultDuration: 0.7,
    defaultEase: "power2.out",
    mode: "from",
  },
  slideUp: {
    label: "Slide Up",
    category: "entrance",
    icon: "📤",
    description: "Slides up from below",
    fromVars: { y: 80 },
    defaultDuration: 0.6,
    defaultEase: "power3.out",
    mode: "from",
  },
  slideDown: {
    label: "Slide Down",
    category: "entrance",
    icon: "📥",
    description: "Slides down from above",
    fromVars: { y: -80 },
    defaultDuration: 0.6,
    defaultEase: "power3.out",
    mode: "from",
  },
  slideLeft: {
    label: "Slide Left",
    category: "entrance",
    icon: "◀️",
    description: "Slides in from the right",
    fromVars: { x: 100 },
    defaultDuration: 0.6,
    defaultEase: "power3.out",
    mode: "from",
  },
  slideRight: {
    label: "Slide Right",
    category: "entrance",
    icon: "▶️",
    description: "Slides in from the left",
    fromVars: { x: -100 },
    defaultDuration: 0.6,
    defaultEase: "power3.out",
    mode: "from",
  },
  zoomIn: {
    label: "Zoom In",
    category: "entrance",
    icon: "🔍",
    description: "Scales up from small",
    fromVars: { opacity: 0, scale: 0.5 },
    defaultDuration: 0.6,
    defaultEase: "back.out(1.7)",
    mode: "from",
  },
  zoomOut: {
    label: "Zoom Out",
    category: "entrance",
    icon: "🔎",
    description: "Scales down from large",
    fromVars: { opacity: 0, scale: 1.5 },
    defaultDuration: 0.6,
    defaultEase: "power2.out",
    mode: "from",
  },
  flipX: {
    label: "Flip X",
    category: "entrance",
    icon: "🔄",
    description: "Flips horizontally into view",
    fromVars: { opacity: 0, rotateX: 90 },
    defaultDuration: 0.8,
    defaultEase: "power3.out",
    mode: "from",
  },
  flipY: {
    label: "Flip Y",
    category: "entrance",
    icon: "🔃",
    description: "Flips vertically into view",
    fromVars: { opacity: 0, rotateY: 90 },
    defaultDuration: 0.8,
    defaultEase: "power3.out",
    mode: "from",
  },
  bounceIn: {
    label: "Bounce In",
    category: "entrance",
    icon: "🏀",
    description: "Bounces into view with elastic feel",
    fromVars: { opacity: 0, scale: 0.3 },
    defaultDuration: 0.8,
    defaultEase: "elastic.out(1,0.3)",
    mode: "from",
  },
  rotateIn: {
    label: "Rotate In",
    category: "entrance",
    icon: "🌀",
    description: "Rotates and fades into position",
    fromVars: { opacity: 0, rotation: -180, scale: 0.5 },
    defaultDuration: 0.8,
    defaultEase: "back.out(1.7)",
    mode: "from",
  },

  // ═══ ATTENTION / EMPHASIS ═══
  pulse: {
    label: "Pulse",
    category: "attention",
    icon: "💗",
    description: "Gentle scale pulse",
    fromVars: {},
    toVars: { scale: 1.05 },
    defaultDuration: 0.5,
    defaultEase: "sine.inOut",
    mode: "to",
  },
  shake: {
    label: "Shake",
    category: "attention",
    icon: "📳",
    description: "Quick horizontal shake",
    fromVars: {},
    toVars: { x: 10 },
    defaultDuration: 0.08,
    defaultEase: "power1.inOut",
    mode: "to",
  },
  bounce: {
    label: "Bounce",
    category: "attention",
    icon: "⚡",
    description: "Bounces up and down",
    fromVars: {},
    toVars: { y: -20 },
    defaultDuration: 0.4,
    defaultEase: "power2.out",
    mode: "to",
  },
  wiggle: {
    label: "Wiggle",
    category: "attention",
    icon: "〰️",
    description: "Rotational wiggle",
    fromVars: {},
    toVars: { rotation: 5 },
    defaultDuration: 0.1,
    defaultEase: "sine.inOut",
    mode: "to",
  },
  flash: {
    label: "Flash",
    category: "attention",
    icon: "💡",
    description: "Quick opacity flash",
    fromVars: {},
    toVars: { opacity: 0 },
    defaultDuration: 0.3,
    defaultEase: "power1.inOut",
    mode: "to",
  },
  heartbeat: {
    label: "Heartbeat",
    category: "attention",
    icon: "❤️",
    description: "Double-pulse like a heartbeat",
    fromVars: {},
    toVars: { scale: 1.15 },
    defaultDuration: 0.25,
    defaultEase: "power2.inOut",
    mode: "to",
  },

  // ═══ EXIT ═══
  fadeOut: {
    label: "Fade Out",
    category: "exit",
    icon: "👻",
    description: "Fades to transparent",
    fromVars: {},
    toVars: { opacity: 0 },
    defaultDuration: 0.5,
    defaultEase: "power2.in",
    mode: "to",
  },
  fadeOutUp: {
    label: "Fade Out Up",
    category: "exit",
    icon: "⬆️",
    description: "Fades out while sliding up",
    fromVars: {},
    toVars: { opacity: 0, y: -40 },
    defaultDuration: 0.5,
    defaultEase: "power2.in",
    mode: "to",
  },
  fadeOutDown: {
    label: "Fade Out Down",
    category: "exit",
    icon: "⬇️",
    description: "Fades out while sliding down",
    fromVars: {},
    toVars: { opacity: 0, y: 40 },
    defaultDuration: 0.5,
    defaultEase: "power2.in",
    mode: "to",
  },
  slideOutLeft: {
    label: "Slide Out Left",
    category: "exit",
    icon: "◀️",
    description: "Slides out to the left",
    fromVars: {},
    toVars: { x: -100, opacity: 0 },
    defaultDuration: 0.5,
    defaultEase: "power3.in",
    mode: "to",
  },
  slideOutRight: {
    label: "Slide Out Right",
    category: "exit",
    icon: "▶️",
    description: "Slides out to the right",
    fromVars: {},
    toVars: { x: 100, opacity: 0 },
    defaultDuration: 0.5,
    defaultEase: "power3.in",
    mode: "to",
  },

  // ═══ SPECIAL ═══
  parallax: {
    label: "Parallax",
    category: "special",
    icon: "🏔️",
    description: "Moves slower than scroll for depth effect",
    fromVars: { y: -50 },
    toVars: { y: 50 },
    defaultDuration: 1,
    defaultEase: "none",
    mode: "fromTo",
  },
  custom: {
    label: "Custom",
    category: "special",
    icon: "⚙️",
    description: "Define your own GSAP animation values",
    fromVars: {},
    toVars: {},
    defaultDuration: 0.6,
    defaultEase: "power2.out",
    mode: "from",
  },
};

// ─── Helpers ─────────────────────────────────────────────

export const TRIGGER_LABELS: Record<AnimationTrigger, { label: string; icon: string; description: string }> = {
  onLoad:      { label: "On Load",       icon: "🚀", description: "Plays when the page loads" },
  onScroll:    { label: "On Scroll",     icon: "📜", description: "Plays when scrolled into view" },
  onHover:     { label: "On Hover",      icon: "🖱️", description: "Plays on mouse enter, reverses on leave" },
  onClick:     { label: "On Click",      icon: "👆", description: "Plays when clicked/tapped" },
  whileInView: { label: "While In View", icon: "👁️", description: "Active while visible in viewport" },
  loop:        { label: "Loop",          icon: "🔄", description: "Repeats indefinitely" },
};

export const EASE_OPTIONS: { label: string; value: string }[] = [
  { label: "Smooth (Power2)", value: "power2.out" },
  { label: "Gentle (Power1)", value: "power1.out" },
  { label: "Strong (Power3)", value: "power3.out" },
  { label: "Extra Strong (Power4)", value: "power4.out" },
  { label: "Smooth In-Out", value: "power2.inOut" },
  { label: "Bounce", value: "bounce.out" },
  { label: "Elastic", value: "elastic.out(1,0.3)" },
  { label: "Back (Overshoot)", value: "back.out(1.7)" },
  { label: "Circular", value: "circ.out" },
  { label: "Expo", value: "expo.out" },
  { label: "Sine", value: "sine.out" },
  { label: "Sine In-Out", value: "sine.inOut" },
  { label: "Linear", value: "linear" },
  { label: "None (Instant)", value: "none" },
];

/** Creates a default AnimationDefinition for a given trigger and preset */
export function createAnimationDefinition(
  trigger: AnimationTrigger,
  preset: AnimationPreset,
): AnimationDefinition {
  const meta = ANIMATION_PRESETS[preset];
  return {
    id: `anim_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    trigger,
    preset,
    duration: meta.defaultDuration,
    delay: 0,
    ease: meta.defaultEase,
    // Scroll defaults
    ...(trigger === "onScroll" ? { scrollStart: "top 80%", scrollEnd: "top 20%", scrub: false } : {}),
    // Hover/click defaults
    ...(trigger === "onHover" || trigger === "onClick" ? { reverse: true } : {}),
    // Loop defaults
    ...(trigger === "loop" ? { repeat: -1, yoyo: true } : {}),
    enabled: true,
  };
}

/** Get presets filtered by category */
export function getPresetsByCategory(category: AnimationCategory): { key: AnimationPreset; meta: PresetMeta }[] {
  return (Object.entries(ANIMATION_PRESETS) as [AnimationPreset, PresetMeta][])
    .filter(([_, meta]) => meta.category === category)
    .map(([key, meta]) => ({ key, meta }));
}
