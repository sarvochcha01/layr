"use client";
import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ResizableWrapperProps {
  componentId: string;
  isSelected: boolean;
  isPreviewMode: boolean;
  currentWidth?: string;
  currentHeight?: string;
  onResize: (id: string, updates: { width?: string; height?: string }) => void;
  children: React.ReactNode;
  className?: string;
}

type ResizeHandle = 
  | "top" 
  | "right" 
  | "bottom" 
  | "left" 
  | "top-left" 
  | "top-right" 
  | "bottom-left" 
  | "bottom-right";

const getCursorForHandle = (handle: ResizeHandle | null): string => {
  if (!handle) return "";
  const cursorMap: Record<ResizeHandle, string> = {
    "top": "n-resize",
    "right": "e-resize",
    "bottom": "s-resize",
    "left": "w-resize",
    "top-left": "nw-resize",
    "top-right": "ne-resize",
    "bottom-left": "sw-resize",
    "bottom-right": "se-resize",
  };
  return cursorMap[handle];
};

export function ResizableWrapper({
  componentId,
  isSelected,
  isPreviewMode,
  currentWidth,
  currentHeight,
  onResize,
  children,
  className,
}: ResizableWrapperProps) {
  const [isResizing, setIsResizing] = useState(false);
  const [activeHandle, setActiveHandle] = useState<ResizeHandle | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  const startSizeRef = useRef({ width: 0, height: 0 });
  const lastUpdateRef = useRef<{ width?: string; height?: string }>({});

  // Keep onResize in a ref so it never causes the effect to re-register
  const onResizeRef = useRef(onResize);
  useEffect(() => { onResizeRef.current = onResize; }, [onResize]);

  const handleMouseDown = (e: React.MouseEvent, handle: ResizeHandle) => {
    if (isPreviewMode) return;
    e.preventDefault();
    e.stopPropagation();

    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const rect = wrapper.getBoundingClientRect();
    setIsResizing(true);
    setActiveHandle(handle);
    startPosRef.current = { x: e.clientX, y: e.clientY };
    startSizeRef.current = { width: rect.width, height: rect.height };
  };

  // Only depends on isResizing, activeHandle, componentId — never onResize
  useEffect(() => {
    if (!isResizing || !activeHandle) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();

      const deltaX = e.clientX - startPosRef.current.x;
      const deltaY = e.clientY - startPosRef.current.y;

      let newWidth = startSizeRef.current.width;
      let newHeight = startSizeRef.current.height;

      if (activeHandle.includes("right")) newWidth = Math.max(100, newWidth + deltaX);
      else if (activeHandle.includes("left")) newWidth = Math.max(100, newWidth - deltaX);

      if (activeHandle.includes("bottom")) newHeight = Math.max(50, newHeight + deltaY);
      else if (activeHandle.includes("top")) newHeight = Math.max(50, newHeight - deltaY);

      const updates: { width?: string; height?: string } = {};
      if (activeHandle.includes("left") || activeHandle.includes("right"))
        updates.width = `${Math.round(newWidth)}px`;
      if (activeHandle.includes("top") || activeHandle.includes("bottom"))
        updates.height = `${Math.round(newHeight)}px`;

      // Store for commit on mouseup
      lastUpdateRef.current = updates;

      // Direct DOM mutation only — zero React re-renders during drag
      if (wrapperRef.current) {
        if (updates.width) wrapperRef.current.style.width = updates.width;
        if (updates.height) wrapperRef.current.style.height = updates.height;
      }
    };

    const handleMouseUp = () => {
      // Single React state commit on release
      if (Object.keys(lastUpdateRef.current).length > 0) {
        onResizeRef.current(componentId, lastUpdateRef.current);
        lastUpdateRef.current = {};
      }
      setIsResizing(false);
      setActiveHandle(null);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    document.body.style.userSelect = "none";
    document.body.style.cursor = getCursorForHandle(activeHandle);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [isResizing, activeHandle, componentId]); // onResize intentionally omitted

  const showHandles = isSelected && !isPreviewMode;

  return (
    <div
      ref={wrapperRef}
      className={cn("relative", className)}
      style={{
        width: currentWidth || "auto",
        height: currentHeight || "auto",
        minWidth: "100px",
        minHeight: "50px",
        maxWidth: "100%", // prevents growing past canvas edge
        pointerEvents: isResizing ? "none" : "auto",
      }}
    >
      {/* Inner wrapper clips content without clipping handles */}
      <div className="w-full h-full overflow-hidden">
        {children}
      </div>

      {/* Handles render outside overflow so they're never clipped */}
      {showHandles && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ overflow: "visible" }}
        >
          {/* Corner Handles */}
          <div
            className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-nw-resize z-50 hover:scale-125 transition-transform shadow-lg pointer-events-auto"
            onMouseDown={(e) => handleMouseDown(e, "top-left")}
          />
          <div
            className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-ne-resize z-50 hover:scale-125 transition-transform shadow-lg pointer-events-auto"
            onMouseDown={(e) => handleMouseDown(e, "top-right")}
          />
          <div
            className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-sw-resize z-50 hover:scale-125 transition-transform shadow-lg pointer-events-auto"
            onMouseDown={(e) => handleMouseDown(e, "bottom-left")}
          />
          <div
            className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-se-resize z-50 hover:scale-125 transition-transform shadow-lg pointer-events-auto"
            onMouseDown={(e) => handleMouseDown(e, "bottom-right")}
          />

          {/* Edge Handles */}
          <div
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-3 bg-blue-500 border-2 border-white rounded-full cursor-n-resize z-50 hover:scale-110 transition-transform shadow-lg pointer-events-auto"
            onMouseDown={(e) => handleMouseDown(e, "top")}
          />
          <div
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-3 bg-blue-500 border-2 border-white rounded-full cursor-s-resize z-50 hover:scale-110 transition-transform shadow-lg pointer-events-auto"
            onMouseDown={(e) => handleMouseDown(e, "bottom")}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 -left-2 w-3 h-8 bg-blue-500 border-2 border-white rounded-full cursor-w-resize z-50 hover:scale-110 transition-transform shadow-lg pointer-events-auto"
            onMouseDown={(e) => handleMouseDown(e, "left")}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 -right-2 w-3 h-8 bg-blue-500 border-2 border-white rounded-full cursor-e-resize z-50 hover:scale-110 transition-transform shadow-lg pointer-events-auto"
            onMouseDown={(e) => handleMouseDown(e, "right")}
          />
        </div>
      )}
    </div>
  );
}