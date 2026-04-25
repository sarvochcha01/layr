"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { useCanvasComponentResize } from "@/hooks/useCanvasComponentResize";

interface ResizableWrapperProps {
  componentId: string;
  isSelected: boolean;
  isPreviewMode: boolean;
  currentWidth?: string;
  currentHeight?: string;
  currentTransform?: { x: number; y: number };
  onResize: (id: string, updates: { width?: string; height?: string; transform?: { x: number; y: number } }) => void;
  children: React.ReactNode;
  className?: string;
  componentType?: string; // To determine if height should be min-height
}

export function ResizableWrapper({
  componentId,
  isSelected,
  isPreviewMode,
  currentWidth,
  currentHeight,
  currentTransform = { x: 0, y: 0 },
  onResize,
  children,
  className,
  componentType,
}: ResizableWrapperProps) {
  const { wrapperRef, isResizing, handleMouseDown } = useCanvasComponentResize({
    componentId,
    isEnabled: !isPreviewMode,
    currentWidth,
    currentHeight,
    currentTransform,
    onResize,
    minWidth: 100,
    minHeight: 50,
  });

  const showHandles = isSelected && !isPreviewMode;

  // Components that should use min-height instead of fixed height (to allow content wrapping)
  const flexibleHeightComponents = ["Grid", "Container", "Section"];
  const useMinHeight = componentType && flexibleHeightComponents.includes(componentType);

  // Build wrapper style - use explicit dimensions when provided
  const wrapperStyle: React.CSSProperties = {
    width: currentWidth || undefined,
    // For Grid/Container, use min-height to allow wrapping; for others use fixed height
    ...(useMinHeight && currentHeight
      ? { minHeight: currentHeight }
      : { height: currentHeight || undefined }),
    minWidth: currentWidth ? undefined : "100px",
    minHeight: currentHeight && !useMinHeight ? undefined : "50px",
    boxSizing: "border-box",
    position: "relative",
    transform: `translate(${currentTransform.x}px, ${currentTransform.y}px)`,
    transformOrigin: "0 0",
  };

  return (
    <div
      ref={wrapperRef}
      className={cn("relative", className)}
      style={wrapperStyle}
    >
      {/* Content wrapper - ensures children fill the container */}
      <div 
        className={useMinHeight ? "w-full min-h-full" : "w-full h-full"} 
        style={{ boxSizing: "border-box" }}
      >
        {children}
      </div>

      {/* Resize handles - positioned outside the component */}
      {showHandles && (
        <>
          {/* Corner Handles */}
          <div
            className="absolute w-4 h-4 bg-primary border-2 border-white rounded-full z-[100] hover:scale-125 transition-transform shadow-lg pointer-events-auto"
            style={{
              top: "-8px",
              left: "-8px",
              cursor: "nw-resize",
            }}
            onMouseDown={(e) => handleMouseDown(e, "top-left")}
          />
          <div
            className="absolute w-4 h-4 bg-primary border-2 border-white rounded-full z-[100] hover:scale-125 transition-transform shadow-lg pointer-events-auto"
            style={{
              top: "-8px",
              right: "-8px",
              cursor: "ne-resize",
            }}
            onMouseDown={(e) => handleMouseDown(e, "top-right")}
          />
          <div
            className="absolute w-4 h-4 bg-primary border-2 border-white rounded-full z-[100] hover:scale-125 transition-transform shadow-lg pointer-events-auto"
            style={{
              bottom: "-8px",
              left: "-8px",
              cursor: "sw-resize",
            }}
            onMouseDown={(e) => handleMouseDown(e, "bottom-left")}
          />
          <div
            className="absolute w-4 h-4 bg-primary border-2 border-white rounded-full z-[100] hover:scale-125 transition-transform shadow-lg pointer-events-auto"
            style={{
              bottom: "-8px",
              right: "-8px",
              cursor: "se-resize",
            }}
            onMouseDown={(e) => handleMouseDown(e, "bottom-right")}
          />

          {/* Edge Handles */}
          <div
            className="absolute w-8 h-3 bg-primary border-2 border-white rounded-full z-[100] hover:scale-110 transition-transform shadow-lg pointer-events-auto"
            style={{
              top: "-6px",
              left: "50%",
              transform: "translateX(-50%)",
              cursor: "n-resize",
            }}
            onMouseDown={(e) => handleMouseDown(e, "top")}
          />
          <div
            className="absolute w-8 h-3 bg-primary border-2 border-white rounded-full z-[100] hover:scale-110 transition-transform shadow-lg pointer-events-auto"
            style={{
              bottom: "-6px",
              left: "50%",
              transform: "translateX(-50%)",
              cursor: "s-resize",
            }}
            onMouseDown={(e) => handleMouseDown(e, "bottom")}
          />
          <div
            className="absolute w-3 h-8 bg-primary border-2 border-white rounded-full z-[100] hover:scale-110 transition-transform shadow-lg pointer-events-auto"
            style={{
              top: "50%",
              left: "-6px",
              transform: "translateY(-50%)",
              cursor: "w-resize",
            }}
            onMouseDown={(e) => handleMouseDown(e, "left")}
          />
          <div
            className="absolute w-3 h-8 bg-primary border-2 border-white rounded-full z-[100] hover:scale-110 transition-transform shadow-lg pointer-events-auto"
            style={{
              top: "50%",
              right: "-6px",
              transform: "translateY(-50%)",
              cursor: "e-resize",
            }}
            onMouseDown={(e) => handleMouseDown(e, "right")}
          />
        </>
      )}
    </div>
  );
}
