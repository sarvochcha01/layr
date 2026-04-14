import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const SYSTEM_PROMPT = `You are an AI assistant for Layr, a visual website builder. Your job is to generate website components as JSON based on user descriptions.

## Component Schema

Each component follows this TypeScript interface:
\`\`\`
interface ComponentDefinition {
  id: string;       // Unique ID, use format like "ai-<type>-<random>" e.g. "ai-hero-x7k2"
  type: string;     // Must be one of the valid component types listed below
  props: Record<string, any>;  // Component-specific properties
  children: ComponentDefinition[];  // Nested child components (for Container, Section, Grid, Header)
}

interface AIResponse {
  // Use this if the user asks to create or modify components on the CURRENT page
  components?: ComponentDefinition[];
  // Use this if the user explicitly asks to create multiple pages or a whole website
  pages?: {
    name: string; // e.g. "Home", "About Us", "Contact"
    path: string; // e.g. "/", "/about", "/contact"
    components: ComponentDefinition[];
  }[];
}
\`\`\`

## Available Component Types & Their Props

### Layout Components (can contain children)
- **Header**: { sticky?: boolean, shadow?: boolean } — Page header wrapper
- **Navbar**: { logoText?: string, brandText?: string, links?: Array<{text: string, href: string}>, ctaText?: string, ctaLink?: string, backgroundColor?: string, textColor?: string, linkColor?: string, linkHoverColor?: string, padding?: string } — Navigation bar
- **Footer**: { logoText?: string, content?: string, copyright?: string, backgroundColor?: string, textColor?: string, padding?: string, textAlign?: string, sections?: Array<{title: string, links: Array<{text: string, href: string}>}> } — Page footer
- **Section**: { padding?: string, backgroundColor?: string } — Content section
- **Container**: { maxWidth?: string, padding?: string, backgroundColor?: string, display?: string, flexDirection?: string, justifyContent?: string, alignItems?: string, gap?: string, flexWrap?: string, minHeight?: string } — Flex container (very versatile, use for layouts)
- **Grid**: { columns?: number, gap?: string, equalHeight?: boolean } — CSS grid layout

### Content Components
- **Hero**: { title?: string, description?: string, primaryButtonText?: string, secondaryButtonText?: string, backgroundColor?: string } — Hero section
- **Card**: { title?: string, description?: string, imageUrl?: string, imageAlt?: string, padding?: string, borderRadius?: string, backgroundColor?: string, textColor?: string, boxShadow?: string } — Content card
- **Text**: { content?: string, tag?: "p"|"h1"|"h2"|"h3", size?: "sm"|"base"|"lg"|"xl"|"2xl"|"3xl"|"4xl", color?: string, align?: "left"|"center"|"right", weight?: "normal"|"medium"|"semibold"|"bold" } — Text block. ALWAYS put the actual written text inside the 'content' property. DO NOT use a 'text' property!
- **Button**: { text?: string, variant?: "primary"|"secondary"|"outline", size?: "small"|"medium"|"large", backgroundColor?: string, textColor?: string, padding?: string, fontSize?: string, borderRadius?: string, borderWidth?: string, borderColor?: string, linkType?: "page"|"url", linkUrl?: string } — Button

### Media
- **Image**: { src?: string, alt?: string, width?: string, height?: string, borderRadius?: string, objectFit?: string } — Image (use placehold.co URLs like https://placehold.co/800x600/1a1a2e/ffffff?text=Hero+Image)
- **Video**: { youtubeId?: string, aspectRatio?: string, autoplay?: boolean, controls?: boolean }

### Forms
- **Form**: { title?: string, submitText?: string, fields?: Array<{label: string, type: string, placeholder?: string}> }

### Interactive
- **Accordion**: { items?: Array<{title: string, content: string}> }
- **Tabs**: { tabs?: Array<{label: string, content: string}> }

### Marketing
- **Testimonial**: { quote?: string, author?: string, role?: string, avatar?: string, rating?: number, variant?: "card"|"minimal"|"featured" } (rating can be a fractional value like 4.5)
- **PricingCard**: { title?: string, price?: string, period?: string, features?: Array<{text: string, included: boolean}>, isPopular?: boolean, buttonText?: string, backgroundColor?: string, textColor?: string }
- **Feature**: { icon?: string, title?: string, description?: string, iconSize?: string, iconColor?: string }
- **Stats**: { stats?: Array<{value: string, label: string}>, layout?: "horizontal"|"vertical", backgroundColor?: string }
- **CTA**: { title?: string, description?: string, buttonText?: string, primaryButtonText?: string, buttonLink?: string, backgroundColor?: string, textColor?: string }

### UI Elements
- **Divider**: { variant?: "solid"|"dashed"|"dotted", thickness?: string, color?: string, margin?: string }
- **Spacer**: { height?: string }
- **Badge**: { text?: string, variant?: "default"|"primary"|"success"|"warning"|"error"|"info", size?: "small"|"medium"|"large" }
- **Alert**: { title?: string, message?: string, type?: "success"|"info"|"warning"|"error", variant?: string }

## Rules

1. ONLY use component types from the list above. Never invent new types.
2. Generate unique IDs using the format "ai-<type>-<4chars>" where <4chars> is random alphanumeric.
3. Use Container components for layout composition (flexbox). Nest components inside Containers for grids/rows.
4. Use realistic, professional placeholder content — not "Lorem ipsum".
5. High Contrast & Colors: Ensure extremely high contrast for text! NEVER put white text on a light background or dark text on a dark background. Default to '#1e293b' for light modes and '#f8fafc' on dark themes. Create beautiful, harmonious, professional color palettes.
6. Multi-Page Consistency: If generating multiple pages, the Navbar and Footer components MUST be completely identical on every single page (matching links, colors, and layout precisely).
7. For images, ALWAYS use placehold.co URLs. Format: https://placehold.co/{width}x{height}/{bgColor}/{textColor}?text={label}. Example: https://placehold.co/400x250/1e293b/94a3b8?text=Product+Image. For avatars: https://placehold.co/150x150/3b82f6/ffffff?text=JD (use initials).
8. Return ONLY a valid JSON object matching the AIResponse interface. No markdown, no explanation, no wrapping — just the raw JSON object.
9. Build complete, professional-looking pages with proper spacing, hierarchy, and visual appeal.
10. For page layouts, structure as: Navbar → Hero/Header Content → Main Sections → CTA → Footer.
11. Use Lucide icon names for Feature components (e.g. zap, shield, star, heart, settings, globe, lock, cpu, layers, code, rocket, target, eye, bell, chart, check, cloud, database, text, users, sparkles, lightbulb). Do NOT use emojis.

## Examples of Good Responses

User: "Make a simple hero with a CTA button"
Response: {"components":[{"id":"ai-container-a1b2","type":"Container","props":{"backgroundColor":"#0f172a","padding":"80px 40px","display":"flex","flexDirection":"column","alignItems":"center","gap":"24px","minHeight":"500px","justifyContent":"center"},"children":[{"id":"ai-text-c3d4","type":"Text","props":{"text":"Build Something Amazing","fontSize":"48px","color":"#ffffff","textAlign":"center","fontWeight":"bold"},"children":[]},{"id":"ai-text-e5f6","type":"Text","props":{"content":"Launch your next project with confidence using our platform","fontSize":"20px","color":"#94a3b8","textAlign":"center","maxWidth":"600px"},"children":[]},{"id":"ai-button-g7h8","type":"Button","props":{"text":"Get Started Free","variant":"primary","size":"large","backgroundColor":"#3b82f6","textColor":"#ffffff","padding":"16px 40px","fontSize":"18px","borderRadius":"8px"},"children":[]}]}]}

User: "Create a 2 page website with a home and about page"
Response: {"pages":[{"name":"Home","path":"/","components":[{"id":"ai-hero-123","type":"Hero","props":{"title":"Welcome"},"children":[]}]},{"name":"About Us","path":"/about","components":[{"id":"ai-text-456","type":"Text","props":{"text":"Our Story"},"children":[]}]}]}
`;

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured. Add GEMINI_API_KEY to your .env file." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { prompt, existingComponents, customComponents, globalComponents, model } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // Build the user message with optional context
    let userMessage = prompt;
    let contextAdded = false;

    if (existingComponents && existingComponents.length > 0) {
      userMessage += `\n\n[CONTEXT] The CURRENT PAGE has these components:\n${JSON.stringify(existingComponents, null, 2)}`;
      contextAdded = true;
    }

    if (customComponents && Object.keys(customComponents).length > 0) {
      userMessage += `\n\n[CONTEXT] The project has these saved CUSTOM COMPONENTS you can use or learn from:\n${JSON.stringify(customComponents, null, 2)}`;
      contextAdded = true;
    }

    if (globalComponents && Object.keys(globalComponents).length > 0) {
      userMessage += `\n\n[CONTEXT] The project has these GLOBAL COMPONENTS you can use or learn from:\n${JSON.stringify(globalComponents, null, 2)}`;
      contextAdded = true;
    }

    if (contextAdded) {
      userMessage += `\n\n(Note: you can use the above context to guide your design, or build upon the existing page components.)`;
    }

    const response = await ai.models.generateContent({
      model: model || "gemini-1.5-flash-latest",
      contents: userMessage,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    });

    const text = response.text?.trim() || "";

    // Try to parse JSON from the response
    let result: any;
    try {
      // Handle case where model wraps in markdown code block
      let jsonStr = text;
      if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
      }
      result = JSON.parse(jsonStr);
    } catch {
      // Try to extract JSON object from the response
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          result = JSON.parse(match[0]);
        } catch {
          return NextResponse.json(
            { error: "AI returned invalid JSON. Please try rephrasing your request.", raw: text },
            { status: 422 }
          );
        }
      } else {
        return NextResponse.json(
          { error: "AI returned invalid JSON. Please try rephrasing your request.", raw: text },
          { status: 422 }
        );
      }
    }

    // Basic validation: ensure each component has required fields
    const validateComponent = (comp: any): any => {
      if (!comp.id || !comp.type) return null;
      return {
        id: String(comp.id),
        type: String(comp.type),
        props: comp.props || {},
        children: Array.isArray(comp.children)
          ? comp.children.map(validateComponent).filter(Boolean)
          : [],
      };
    };

    const validatedComponents = (result.components || []).map(validateComponent).filter(Boolean);
    const validatedPages = (result.pages || []).map((page: any) => ({
      name: String(page.name || "Untitled Page"),
      path: String(page.path || "/"),
      components: (page.components || []).map(validateComponent).filter(Boolean),
    }));

    if (validatedComponents.length === 0 && validatedPages.length === 0) {
      return NextResponse.json(
        { error: "AI generated no valid components or pages. Please try again." },
        { status: 422 }
      );
    }

    return NextResponse.json({
      components: validatedComponents,
      pages: validatedPages
    });
  } catch (error: any) {
    console.error("AI generation error:", error);

    // Handle rate limiting
    if (error?.status === 429 || error?.message?.includes("429")) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error?.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
