"use client";
import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Page } from "@/types/editor";

interface LinkFieldProps {
  value: string;
  onChange: (value: string) => void;
  pages?: Page[];
  id?: string;
  placeholder?: string;
}

/**
 * Link field with Page/URL selector.
 * - "Page" mode: shows a dropdown of internal pages, stores as "page:<pageId>"
 * - "URL" mode: shows a text input for external URLs
 * Commits URL text on blur/Enter to prevent keystroke lag.
 */
export function LinkField({
  value,
  onChange,
  pages = [],
  id,
  placeholder = "https://example.com",
}: LinkFieldProps) {
  const isPageLink = value?.startsWith("page:");
  const mode = isPageLink ? "page" : "url";

  // Local state for URL text input (commit on blur/Enter)
  const urlValue = isPageLink ? "" : (value || "");
  const [localUrl, setLocalUrl] = useState(urlValue);
  const prevUrlRef = useRef(urlValue);

  useEffect(() => {
    const newUrlValue = (value?.startsWith("page:")) ? "" : (value || "");
    if (newUrlValue !== prevUrlRef.current) {
      setLocalUrl(newUrlValue);
      prevUrlRef.current = newUrlValue;
    }
  }, [value]);

  const commitUrl = () => {
    if (localUrl !== urlValue) {
      onChange(localUrl);
      prevUrlRef.current = localUrl;
    }
  };

  const handleModeChange = (newMode: string) => {
    if (newMode === "page" && pages.length > 0) {
      onChange(`page:${pages[0].id}`);
    } else {
      onChange("");
      setLocalUrl("");
      prevUrlRef.current = "";
    }
  };

  return (
    <div className="grid grid-cols-[1fr_2fr] gap-2 items-start">
      {/* Mode selector */}
      <div className="relative border border-border rounded-md focus-within:ring-1 focus-within:ring-primary bg-background">
        <select
          value={mode}
          onChange={(e) => handleModeChange(e.target.value)}
          className="w-full h-8 px-1 text-xs bg-background text-foreground appearance-none focus:outline-none"
        >
          <option className="bg-background text-foreground" value="url">URL</option>
          <option className="bg-background text-foreground" value="page">Page</option>
        </select>
      </div>

      {/* Value input */}
      {mode === "page" ? (
        <div className="relative border border-border rounded-md focus-within:ring-1 focus-within:ring-primary bg-background">
          <select
            id={id}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-8 px-1 text-xs bg-background text-foreground appearance-none focus:outline-none"
          >
            {pages.map((page) => (
              <option className="bg-background text-foreground" key={page.id} value={`page:${page.id}`}>
                {page.name}
              </option>
            ))}
            {pages.length === 0 && (
              <option className="bg-background text-foreground" value="">No pages</option>
            )}
          </select>
        </div>
      ) : (
        <Input
          id={id}
          value={localUrl}
          onChange={(e) => setLocalUrl(e.target.value)}
          onBlur={commitUrl}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              commitUrl();
              (e.target as HTMLInputElement).blur();
            }
          }}
          placeholder={placeholder}
          className="h-8 text-xs bg-background"
        />
      )}
    </div>
  );
}
