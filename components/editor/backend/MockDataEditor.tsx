"use client";

import { useState, useEffect, useRef } from "react";
import { PayloadField } from "@/types/backend";
import { Wand2, AlignLeft, AlertCircle } from "lucide-react";

interface MockDataEditorProps {
  value: any;
  onChange: (value: any) => void;
  responseSchema?: PayloadField[];
}

/**
 * Generate sample data from a schema definition.
 * Creates a realistic-looking mock object.
 */
function generateFromSchema(fields: PayloadField[]): any {
  const result: Record<string, any> = {};

  for (const field of fields) {
    switch (field.type) {
      case "string":
        result[field.name] = field.defaultValue || `sample_${field.name}`;
        break;
      case "number":
        result[field.name] = field.defaultValue ?? 0;
        break;
      case "boolean":
        result[field.name] = field.defaultValue ?? false;
        break;
      case "array":
        if (field.children && field.children.length > 0) {
          result[field.name] = [generateFromSchema(field.children)];
        } else {
          result[field.name] = [];
        }
        break;
      case "object":
        if (field.children && field.children.length > 0) {
          result[field.name] = generateFromSchema(field.children);
        } else {
          result[field.name] = {};
        }
        break;
    }
  }

  return result;
}

export function MockDataEditor({
  value,
  onChange,
  responseSchema,
}: MockDataEditorProps) {
  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync external value to internal text
  useEffect(() => {
    try {
      const formatted = JSON.stringify(value ?? null, null, 2);
      setJsonText(formatted === "null" ? "" : formatted);
      setError(null);
    } catch {
      // If value isn't serializable, leave as is
    }
  }, [value]);

  const handleTextChange = (text: string) => {
    setJsonText(text);

    if (!text.trim()) {
      setError(null);
      onChange(null);
      return;
    }

    try {
      const parsed = JSON.parse(text);
      setError(null);
      onChange(parsed);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonText(formatted);
      setError(null);
    } catch {
      // Can't format invalid JSON
    }
  };

  const handleGenerateFromSchema = () => {
    if (!responseSchema || responseSchema.length === 0) return;

    const generated = generateFromSchema(responseSchema);
    const formatted = JSON.stringify(generated, null, 2);
    setJsonText(formatted);
    setError(null);
    onChange(generated);
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.max(200, textarea.scrollHeight)}px`;
  }, [jsonText]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Mock Response Data
        </span>
        <div className="flex items-center gap-1">
          {responseSchema && responseSchema.length > 0 && (
            <button
              onClick={handleGenerateFromSchema}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 rounded transition-colors"
              title="Generate mock data from response schema"
            >
              <Wand2 className="w-3 h-3" />
              Generate
            </button>
          )}
          <button
            onClick={handleFormat}
            disabled={!!error}
            className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium bg-muted/50 hover:bg-muted text-muted-foreground rounded transition-colors disabled:opacity-30"
            title="Format JSON"
          >
            <AlignLeft className="w-3 h-3" />
            Format
          </button>
        </div>
      </div>

      <div className="relative">
        <textarea
          ref={textareaRef}
          value={jsonText}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder='{\n  "key": "value"\n}'
          className={`w-full min-h-[200px] bg-[#0d1117] text-emerald-300 text-xs font-mono p-4 rounded-lg border outline-none resize-none leading-relaxed placeholder:text-muted-foreground/30 ${
            error
              ? "border-red-500/50 focus:ring-1 focus:ring-red-500/30"
              : "border-border focus:ring-1 focus:ring-primary/30 focus:border-primary/50"
          }`}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
        />

        {/* Line numbers gutter effect via gradient */}
        <div className="absolute top-0 left-0 w-8 h-full bg-gradient-to-r from-[#0d1117] to-transparent rounded-l-lg pointer-events-none opacity-50" />
      </div>

      {error && (
        <div className="flex items-start gap-1.5 px-2 py-1.5 bg-red-500/10 border border-red-500/20 rounded text-[10px] text-red-400">
          <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
          <span className="break-all">{error}</span>
        </div>
      )}
    </div>
  );
}
