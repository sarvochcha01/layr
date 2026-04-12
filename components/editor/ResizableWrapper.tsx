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
  const elementRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  const startSizeRef = useRef({ width: 0, height: 0 });

  // Parse dimension string to pixels
  const parseDimension = (value: string | undefined, fallback: number): number => {
    if (!value || value === "auto") return fallback;
    
    // Remove unit and parse number
    const numMatch = value.match(/^(\d+\.?\d*)/);
    if (!numMatch) return fallback;
    
    const num = parseFloat(numMatch[1]);
    
    // Handle different units
    if (value.includes("%")) {
      // For percentage, use the fallback as reference
      return (num / 100) * fallback;
    } else if (value.includes("rem")) {
      return num * 16; // Assume 1rem = 16px
    } else if (value.includes("em")) {
      return num * 16;
    } else if (value.includes("vw")) {
      return (num / 100) * window.innerWidth;
    } else if (value.includes("vh")) {
      return (num / 100) * window.innerHeight;
    }
    
    // Default to pixels
    return num;
  };

  const handleMouseDown = (e: React.MouseEvent, handle: ResizeHandle) => {
    if (isPreviewMode) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = elementRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    setIsResizing(true);
    setActiveHandle(handle);
    
    startPosRef.current = { x: e.clientX, y: e.clientY };
    startSizeRef.current = { 
      width: parseDimension(currentWidth, rect.width),
      height: parseDimension(currentHeight, rect.height)
    };
  };

  useEffect(() => {
    if (!isResizing || !activeHandle) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      const deltaX = e.clientX - startPosRef.current.x;
      const deltaY = e.clientY - startPosRef.current.y;
      
      let newWidth = startSizeRef.current.width;
      let newHeight = startSizeRef.current.height;

      // Calculate new dimensions based on handle
      if (activeHandle.includes("right")) {
        newWidth = Math.max(50, startSizeRef.current.width + deltaX);
      } else if (activeHandle.includes("left")) {
        newWidth = Math.max(50, startSizeRef.current.width - deltaX);
      }

      if (activeHandle.includes("bottom")) {
        newHeight = Math.max(50, startSizeRef.current.height + deltaY);
      } else if (activeHandle.includes("top")) {
        newHeight = Math.max(50, startSizeRef.current.height - deltaY);
      }

      // Update the component
      const updates: { width?: string; height?: string } = {};
      
      if (activeHandle.includes("left") || activeHandle.includes("right")) {
        updates.width = `${Math.round(newWidth)}px`;
      }
      
      if (activeHandle.includes("top") || activeHandle.includes("bottom")) {
        updates.height = `${Math.round(newHeight)}px`;
      }

      onResize(componentId, updates);
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(false);
      setActiveHandle(null);
    };

    // Add listeners to document to capture all mouse events
    document.addEventListener("mousemove", handleMouseMove, true);
    document.addEventListener("mouseup", handleMouseUp, true);

    // Prevent text selection while resizing
    document.body.style.userSelect = "none";
    document.body.style.cursor = getCursorForHandle(activeHandle);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove, true);
      document.removeEventListener("mouseup", handleMouseUp, true);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [isResizing, activeHandle, componentId, onResize]);

  const showHandles = isSelected && !isPreviewMode;

  return (
    <div
      ref={elementRef}
      className={cn("relative", className)}
      style={{
        width: currentWidth || "auto",
        height: currentHeight || "auto",
      }}
    >
      {children}

      {/* Resize Handles - Only show when selected and not resizing */}
      {showHandles && (
        <>
          {/* Corner Handles */}
          <div
            className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-nw-resize z-20 hover:scale-125 transition-transform shadow-md"
            onMouseDown={(e) => handleMouseDown(e, "top-left")}
            title="Resize from top-left"
          />
          <div
            className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-ne-resize z-20 hover:scale-125 transition-transform shadow-md"
            onMouseDown={(e) => handleMouseDown(e, "top-right")}
            title="Resize from top-right"
          />
          <div
            className="absolute -bottom-1.5 -left-1.5 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-sw-resize z-20 hover:scale-125 transition-transform shadow-md"
            onMouseDown={(e) => handleMouseDown(e, "bottom-left")}
            title="Resize from bottom-left"
          />
          <div
            className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-se-resize z-20 hover:scale-125 transition-transform shadow-md"
            onMouseDown={(e) => handleMouseDown(e, "bottom-right")}
            title="Resize from bottom-right"
          />

          {/* Edge Handles */}
          <div
            className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-3 bg-blue-500 border-2 border-white rounded-full cursor-n-resize z-20 hover:scale-110 transition-transform shadow-md"
            onMouseDown={(e) => handleMouseDown(e, "top")}
            title="Resize from top"
          />
          <div
            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-3 bg-blue-500 border-2 border-white rounded-full cursor-s-resize z-20 hover:scale-110 transition-transform shadow-md"
            onMouseDown={(e) => handleMouseDown(e, "bottom")}
            title="Resize from bottom"
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-8 bg-blue-500 border-2 border-white rounded-full cursor-w-resize z-20 hover:scale-110 transition-transform shadow-md"
            onMouseDown={(e) => handleMouseDown(e, "left")}
            title="Resize from left"
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-8 bg-blue-500 border-2 border-white rounded-full cursor-e-resize z-20 hover:scale-110 transition-transform shadow-md"
            onMouseDown={(e) => handleMouseDown(e, "right")}
            title="Resize from right"
          />
        </>
      )}
    </div>
  );
}
