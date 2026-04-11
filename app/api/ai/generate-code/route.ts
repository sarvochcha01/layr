import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const SYSTEM_PROMPT = `You are an AI assistant that generates HTML and CSS code for custom UI components.

## Rules
1. Return ONLY valid JSON with this exact structure: { "name": "ComponentName", "html": "<html code>", "css": "<css code>" }
2. Write clean, semantic HTML. Use class names to style elements.
3. Write vanilla CSS (not Tailwind). Keep styles self-contained.
4. Make components visually appealing with modern design (rounded corners, subtle shadows, good spacing, clean typography).
5. Use placehold.co for any images: https://placehold.co/{width}x{height}/{bgColor}/{textColor}?text={label}
6. Do NOT use external fonts, JavaScript, or any framework-specific syntax.
7. Keep the code concise and production-quality.
8. Use relative units (rem, em, %) for sizing where appropriate.

## Example

User: "Create a user profile card"
Response:
{
  "name": "Profile Card",
  "html": "<div class=\\"profile-card\\">\\n  <img src=\\"https://placehold.co/80x80/3b82f6/ffffff?text=JD\\" alt=\\"Avatar\\" class=\\"profile-avatar\\" />\\n  <h3 class=\\"profile-name\\">John Doe</h3>\\n  <p class=\\"profile-role\\">Senior Developer</p>\\n  <div class=\\"profile-stats\\">\\n    <div class=\\"stat\\"><strong>142</strong><span>Posts</span></div>\\n    <div class=\\"stat\\"><strong>1.2K</strong><span>Followers</span></div>\\n    <div class=\\"stat\\"><strong>89</strong><span>Following</span></div>\\n  </div>\\n</div>",
  "css": ".profile-card {\\n  text-align: center;\\n  padding: 2rem;\\n  border-radius: 1rem;\\n  background: #ffffff;\\n  box-shadow: 0 4px 20px rgba(0,0,0,0.08);\\n  max-width: 300px;\\n}\\n.profile-avatar {\\n  width: 80px;\\n  height: 80px;\\n  border-radius: 50%;\\n  margin-bottom: 1rem;\\n}\\n.profile-name {\\n  font-size: 1.25rem;\\n  font-weight: 600;\\n  margin: 0 0 0.25rem;\\n}\\n.profile-role {\\n  color: #6b7280;\\n  font-size: 0.875rem;\\n  margin: 0 0 1.5rem;\\n}\\n.profile-stats {\\n  display: flex;\\n  justify-content: center;\\n  gap: 2rem;\\n}\\n.stat {\\n  display: flex;\\n  flex-direction: column;\\n}\\n.stat strong {\\n  font-size: 1.125rem;\\n}\\n.stat span {\\n  font-size: 0.75rem;\\n  color: #9ca3af;\\n}"
}`;

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
    });

    const text = response.text?.trim() || "";

    // Parse JSON
    let result;
    try {
      let jsonStr = text;
      if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
      }
      result = JSON.parse(jsonStr);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          result = JSON.parse(match[0]);
        } catch {
          return NextResponse.json(
            { error: "AI returned invalid code. Try again.", raw: text },
            { status: 422 }
          );
        }
      } else {
        return NextResponse.json(
          { error: "AI returned invalid code. Try again.", raw: text },
          { status: 422 }
        );
      }
    }

    return NextResponse.json({
      name: result.name || "",
      html: result.html || "",
      css: result.css || "",
    });
  } catch (error: any) {
    console.error("AI code generation error:", error);

    if (error?.status === 429 || error?.message?.includes("429")) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait and try again." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error?.message || "An unexpected error occurred", details: String(error) },
      { status: 500 }
    );
  }
}
