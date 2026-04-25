import { useState, useRef, useEffect } from "react";

type ResizeHandle =
  | "top"
  | "right"
  | "bottom"
  | "left"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

interface UseCanvasComponentResizeOptions {
  componentId: string;
  isEnabled: boolean;
  currentWidth?: string;
  currentHeight?: string;
  currentTransform?: { x: number; y: number }; // Track position for left/top resize
  onResize: (id: string, updates: { width?: string; height?: string; transform?: { x: number; y: number } }) => void;
  minWidth?: number;
  minHeight?: number;
}

export function useCanvasComponentResize({
  componentId,
  isEnabled,
  currentWidth,
  currentHeight,
  currentTransform = { x: 0, y: 0 },
  onResize,
  minWidth = 100,
  minHeight = 50,
}: UseCanvasComponentResizeOptions) {
  const [isResizing, setIsResizing] = useState(false);
  const [activeHandle, setActiveHandle] = useState<ResizeHandle | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  const startSizeRef = useRef({ width: 0, height: 0 });
  const startTransformRef = useRef({ x: currentTransform.x, y: currentTransform.y });
  const containerBoundsRef = useRef({ width: 0, height: 0 });

  const handleMouseDown = (e: React.MouseEvent, handle: ResizeHandle) => {
    if (!isEnabled) return;
    e.preventDefault();
    e.stopPropagation();

    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    // Get container bounds (parent element)
    const container = wrapper.parentElement;
    if (container) {
      containerBoundsRef.current = {
        width: container.offsetWidth,
        height: container.offsetHeight,
      };
    }

    // Use the element's actual size, not bounding rect (excludes positioned handles)
    const width = wrapper.offsetWidth;
    const height = wrapper.offsetHeight;

    setIsResizing(true);
    setActiveHandle(handle);
    startPosRef.current = { x: e.clientX, y: e.clientY };
    startSizeRef.current = { width, height };
    startTransformRef.current = { x: currentTransform.x, y: currentTransform.y };
  };

  useEffect(() => {
    if (!isResizing || !activeHandle) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();

      const deltaX = e.clientX - startPosRef.current.x;
      const deltaY = e.clientY - startPosRef.current.y;

      let newWidth = startSizeRef.current.width;
      let newHeight = startSizeRef.current.height;
      let offsetX = startTransformRef.current.x;
      let offsetY = startTransformRef.current.y;

      const containerWidth = containerBoundsRef.current.width;
      const containerHeight = containerBoundsRef.current.height;

      // RIGHT: increase width
      if (activeHandle.includes("right")) {
        newWidth = Math.max(minWidth, startSizeRef.current.width + deltaX);
        // Prevent overflow on right side
        const maxWidth = containerWidth - startTransformRef.current.x;
        newWidth = Math.min(newWidth, maxWidth);
      }
      // LEFT: decrease width AND move element right
      else if (activeHandle.includes("left")) {
        const proposedWidth = Math.max(minWidth, startSizeRef.current.width - deltaX);
        const proposedOffsetX = startTransformRef.current.x + deltaX;
        
        // Prevent underflow on left side (can't go negative)
        if (proposedOffsetX >= 0) {
          newWidth = proposedWidth;
          offsetX = proposedOffsetX;
        } else {
          // Clamp to left edge
          offsetX = 0;
          newWidth = startSizeRef.current.width + startTransformRef.current.x;
        }
        
        // Ensure minimum width
        if (newWidth < minWidth) {
          newWidth = minWidth;
          offsetX = startTransformRef.current.x + startSizeRef.current.width - minWidth;
        }
      }

      // BOTTOM: increase height
      if (activeHandle.includes("bottom")) {
        newHeight = Math.max(minHeight, startSizeRef.current.height + deltaY);
        // Prevent overflow on bottom side
        const maxHeight = containerHeight - startTransformRef.current.y;
        newHeight = Math.min(newHeight, maxHeight);
      }
      // TOP: decrease height AND move element down
      else if (activeHandle.includes("top")) {
        const proposedHeight = Math.max(minHeight, startSizeRef.current.height - deltaY);
        const proposedOffsetY = startTransformRef.current.y + deltaY;
        
        // Prevent underflow on top side (can't go negative)
        if (proposedOffsetY >= 0) {
          newHeight = proposedHeight;
          offsetY = proposedOffsetY;
        } else {
          // Clamp to top edge
          offsetY = 0;
          newHeight = startSizeRef.current.height + startTransformRef.current.y;
        }
        
        // Ensure minimum height
        if (newHeight < minHeight) {
          newHeight = minHeight;
          offsetY = startTransformRef.current.y + startSizeRef.current.height - minHeight;
        }
      }

      // Apply changes to DOM
      if (wrapperRef.current) {
        if (activeHandle.includes("left") || activeHandle.includes("right")) {
          wrapperRef.current.style.width = `${Math.round(newWidth)}px`;
        }
        if (activeHandle.includes("top") || activeHandle.includes("bottom")) {
          wrapperRef.current.style.height = `${Math.round(newHeight)}px`;
        }

        // Apply transform for left/top resizing
        if (activeHandle.includes("left") || activeHandle.includes("top")) {
          wrapperRef.current.style.transform = `translate(${Math.round(offsetX)}px, ${Math.round(offsetY)}px)`;
        }
      }
    };

    const handleMouseUp = () => {
      if (wrapperRef.current) {
        const updates: { width?: string; height?: string; transform?: { x: number; y: number } } = {};

        // Get the final computed size
        const finalWidth = wrapperRef.current.style.width;
        const finalHeight = wrapperRef.current.style.height;

        if (finalWidth && (activeHandle.includes("left") || activeHandle.includes("right"))) {
          updates.width = finalWidth;
        }
        if (finalHeight && (activeHandle.includes("top") || activeHandle.includes("bottom"))) {
          updates.height = finalHeight;
        }

        // Store transform offset for left/top resizing
        if (activeHandle.includes("left") || activeHandle.includes("top")) {
          const transformMatch = wrapperRef.current.style.transform.match(/translate\((-?\d+)px, (-?\d+)px\)/);
          if (transformMatch) {
            updates.transform = {
              x: parseInt(transformMatch[1]),
              y: parseInt(transformMatch[2]),
            };
          }
        }

        // Commit to state
        if (Object.keys(updates).length > 0) {
          onResize(componentId, updates);
        }
      }

      setIsResizing(false);
      setActiveHandle(null);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };

    const getCursorForHandle = (handle: ResizeHandle): string => {
      const cursorMap: Record<ResizeHandle, string> = {
        top: "n-resize",
        right: "e-resize",
        bottom: "s-resize",
        left: "w-resize",
        "top-left": "nw-resize",
        "top-right": "ne-resize",
        "bottom-left": "sw-resize",
        "bottom-right": "se-resize",
      };
      return cursorMap[handle];
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
  }, [isResizing, activeHandle, componentId, onResize, minWidth, minHeight, currentTransform]);

  return {
    wrapperRef,
    isResizing,
    handleMouseDown,
  };
}