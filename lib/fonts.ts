/**
 * Google Fonts Integration
 * 
 * Curated list of ~80 popular Google Fonts, 
 * dynamic font loading, and utilities.
 */

export interface FontOption {
  family: string;
  category: "sans-serif" | "serif" | "display" | "handwriting" | "monospace";
  weights?: number[];
}

// ─── Curated Popular Google Fonts ────────────────────────────────────────────
export const GOOGLE_FONTS: FontOption[] = [
  // Sans-Serif
  { family: "Inter", category: "sans-serif" },
  { family: "Roboto", category: "sans-serif" },
  { family: "Open Sans", category: "sans-serif" },
  { family: "Lato", category: "sans-serif" },
  { family: "Montserrat", category: "sans-serif" },
  { family: "Poppins", category: "sans-serif" },
  { family: "Nunito", category: "sans-serif" },
  { family: "Raleway", category: "sans-serif" },
  { family: "Outfit", category: "sans-serif" },
  { family: "Plus Jakarta Sans", category: "sans-serif" },
  { family: "DM Sans", category: "sans-serif" },
  { family: "Manrope", category: "sans-serif" },
  { family: "Work Sans", category: "sans-serif" },
  { family: "Lexend", category: "sans-serif" },
  { family: "Sora", category: "sans-serif" },
  { family: "Figtree", category: "sans-serif" },
  { family: "Geist", category: "sans-serif" },
  { family: "Albert Sans", category: "sans-serif" },
  { family: "Urbanist", category: "sans-serif" },
  { family: "Space Grotesk", category: "sans-serif" },
  { family: "Archivo", category: "sans-serif" },
  { family: "Karla", category: "sans-serif" },
  { family: "Rubik", category: "sans-serif" },
  { family: "Barlow", category: "sans-serif" },
  { family: "Cabin", category: "sans-serif" },
  { family: "Mulish", category: "sans-serif" },
  { family: "Source Sans 3", category: "sans-serif" },
  { family: "Titillium Web", category: "sans-serif" },
  { family: "Overpass", category: "sans-serif" },
  { family: "IBM Plex Sans", category: "sans-serif" },
  { family: "Red Hat Display", category: "sans-serif" },
  { family: "Exo 2", category: "sans-serif" },
  { family: "Quicksand", category: "sans-serif" },
  { family: "Josefin Sans", category: "sans-serif" },
  { family: "Comfortaa", category: "sans-serif" },
  { family: "Bebas Neue", category: "sans-serif" },
  { family: "Rajdhani", category: "sans-serif" },

  // Serif
  { family: "Playfair Display", category: "serif" },
  { family: "Merriweather", category: "serif" },
  { family: "Lora", category: "serif" },
  { family: "Source Serif 4", category: "serif" },
  { family: "Bitter", category: "serif" },
  { family: "DM Serif Display", category: "serif" },
  { family: "Libre Baskerville", category: "serif" },
  { family: "Crimson Text", category: "serif" },
  { family: "Cormorant Garamond", category: "serif" },
  { family: "IBM Plex Serif", category: "serif" },
  { family: "Fraunces", category: "serif" },
  { family: "Zilla Slab", category: "serif" },
  { family: "Noto Serif", category: "serif" },
  { family: "Frank Ruhl Libre", category: "serif" },
  { family: "Instrument Serif", category: "serif" },

  // Display
  { family: "Righteous", category: "display" },
  { family: "Staatliches", category: "display" },
  { family: "Bungee", category: "display" },
  { family: "Abril Fatface", category: "display" },
  { family: "Lobster", category: "display" },
  { family: "Fredoka", category: "display" },
  { family: "Bungee Shade", category: "display" },
  { family: "Monoton", category: "display" },
  { family: "Orbitron", category: "display" },
  { family: "Press Start 2P", category: "display" },
  { family: "Silkscreen", category: "display" },
  { family: "Black Ops One", category: "display" },

  // Handwriting
  { family: "Caveat", category: "handwriting" },
  { family: "Dancing Script", category: "handwriting" },
  { family: "Pacifico", category: "handwriting" },
  { family: "Satisfy", category: "handwriting" },
  { family: "Kalam", category: "handwriting" },
  { family: "Permanent Marker", category: "handwriting" },

  // Monospace
  { family: "JetBrains Mono", category: "monospace" },
  { family: "Fira Code", category: "monospace" },
  { family: "Source Code Pro", category: "monospace" },
  { family: "Space Mono", category: "monospace" },
  { family: "IBM Plex Mono", category: "monospace" },
  { family: "Roboto Mono", category: "monospace" },
  { family: "Ubuntu Mono", category: "monospace" },
  { family: "Inconsolata", category: "monospace" },
];

// Category fallback stacks
const CATEGORY_FALLBACKS: Record<string, string> = {
  "sans-serif": "system-ui, -apple-system, sans-serif",
  "serif": "Georgia, 'Times New Roman', serif",
  "display": "system-ui, sans-serif",
  "handwriting": "cursive",
  "monospace": "'Courier New', monospace",
};

/**
 * Get the full font-family CSS value including fallbacks
 */
export function getFontFamilyValue(family: string): string {
  const font = GOOGLE_FONTS.find((f) => f.family === family);
  const fallback = font ? CATEGORY_FALLBACKS[font.category] : "system-ui, sans-serif";
  return `'${family}', ${fallback}`;
}

// ─── Dynamic Font Loader ─────────────────────────────────────────────────────
const loadedFonts = new Set<string>();

/**
 * Load a Google Font by injecting a <link> stylesheet.
 * No-ops if already loaded. Works without API key.
 */
export function loadGoogleFont(family: string, weights: number[] = [300, 400, 500, 600, 700, 800]) {
  if (!family || loadedFonts.has(family)) return;
  loadedFonts.add(family);

  if (typeof document === "undefined") return; // SSR guard

  const weightsStr = weights.join(";");
  const encodedFamily = family.replace(/ /g, "+");
  const url = `https://fonts.googleapis.com/css2?family=${encodedFamily}:wght@${weightsStr}&display=swap`;

  // Check if already in DOM
  const existing = document.querySelector(`link[href="${url}"]`);
  if (existing) return;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;
  link.crossOrigin = "anonymous";
  document.head.appendChild(link);
}

/**
 * Load multiple Google Fonts at once
 */
export function loadGoogleFonts(families: string[]) {
  families.filter(Boolean).forEach((f) => loadGoogleFont(f));
}
