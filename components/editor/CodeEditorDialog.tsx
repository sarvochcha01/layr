"use client";

import { useState, useRef } from "react";
import { X, Code2, Sparkles, Loader2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeEditorDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, html: string, css: string) => void;
}

export function CodeEditorDialog({ open, onClose, onSave }: CodeEditorDialogProps) {
  const [name, setName] = useState("");
  const [html, setHtml] = useState('<div class="my-component">\n  <h2>Hello World</h2>\n  <p>This is a custom component</p>\n</div>');
  const [css, setCss] = useState('.my-component {\n  padding: 2rem;\n  text-align: center;\n}\n\n.my-component h2 {\n  font-size: 1.5rem;\n  font-weight: bold;\n  margin-bottom: 0.5rem;\n}\n\n.my-component p {\n  color: #6b7280;\n}');
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [activeTab, setActiveTab] = useState<"html" | "css">("html");

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim() || isGenerating) return;
    setIsGenerating(true);

    try {
      const response = await fetch("/api/ai/generate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errMsg = data.error || "Failed to generate code";
        const details = data.details ? `\n\nDetails: ${data.details}` : "";
        alert(errMsg + details);
        return;
      }

      if (data.html) setHtml(data.html);
      if (data.css) setCss(data.css);
      if (data.name && !name) setName(data.name);
    } catch {
      alert("Failed to connect to AI service");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert("Please provide a component name");
      return;
    }
    if (!html.trim()) {
      alert("Please provide HTML code");
      return;
    }
    onSave(name.trim(), html, css);
    // Reset
    setName("");
    setHtml('<div class="my-component">\n  <h2>Hello World</h2>\n  <p>This is a custom component</p>\n</div>');
    setCss('.my-component {\n  padding: 2rem;\n  text-align: center;\n}\n\n.my-component h2 {\n  font-size: 1.5rem;\n  font-weight: bold;\n  margin-bottom: 0.5rem;\n}\n\n.my-component p {\n  color: #6b7280;\n}');
    setAiPrompt("");
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-[900px] max-w-[95vw] max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-semibold text-foreground">Create Custom Component</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-5 space-y-4">
          {/* Name Input */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Component Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Pricing Table, Hero Banner..."
              className="w-full text-sm px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          {/* AI Prompt */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-purple-400" />
              AI Code Generator
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAIGenerate();
                }}
                placeholder="Describe the component you want to create..."
                className="flex-1 text-sm px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                disabled={isGenerating}
              />
              <button
                onClick={handleAIGenerate}
                disabled={!aiPrompt.trim() || isGenerating}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5",
                  aiPrompt.trim() && !isGenerating
                    ? "bg-purple-500 text-white hover:bg-purple-600"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                {isGenerating ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles className="w-3.5 h-3.5" /> Generate</>
                )}
              </button>
            </div>
          </div>

          {/* Code Editor + Preview */}
          <div className="flex gap-4 min-h-[350px]">
            {/* Code Editor */}
            <div className="flex-1 flex flex-col border border-border rounded-lg overflow-hidden">
              {/* Tabs */}
              <div className="flex bg-muted border-b border-border">
                <button
                  onClick={() => setActiveTab("html")}
                  className={cn(
                    "px-4 py-2 text-xs font-medium transition-colors",
                    activeTab === "html"
                      ? "bg-background text-foreground border-b-2 border-purple-500"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  HTML
                </button>
                <button
                  onClick={() => setActiveTab("css")}
                  className={cn(
                    "px-4 py-2 text-xs font-medium transition-colors",
                    activeTab === "css"
                      ? "bg-background text-foreground border-b-2 border-purple-500"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  CSS
                </button>
                <div className="flex-1" />
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="px-3 py-2 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                >
                  {showPreview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {showPreview ? "Hide" : "Show"} Preview
                </button>
              </div>

              {/* Editor */}
              <textarea
                value={activeTab === "html" ? html : css}
                onChange={(e) => activeTab === "html" ? setHtml(e.target.value) : setCss(e.target.value)}
                className="flex-1 p-4 bg-[#0d1117] text-[#c9d1d9] font-mono text-xs leading-relaxed resize-none focus:outline-none"
                spellCheck={false}
                placeholder={activeTab === "html" ? "Write your HTML here..." : "Write your CSS here..."}
              />
            </div>

            {/* Preview */}
            {showPreview && (
              <div className="w-[300px] flex-shrink-0 border border-border rounded-lg overflow-hidden flex flex-col">
                <div className="px-3 py-2 bg-muted border-b border-border text-xs font-medium text-muted-foreground">
                  Preview
                </div>
                <div className="flex-1 bg-white p-4 overflow-auto light">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: (css ? `<style>${css}</style>` : "") + html,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || !html.trim()}
            className={cn(
              "px-5 py-2 text-sm font-medium rounded-lg transition-colors",
              name.trim() && html.trim()
                ? "bg-purple-500 text-white hover:bg-purple-600"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            Save Component
          </button>
        </div>
      </div>
    </div>
  );
}
