import { useEffect, useRef } from "react";

interface UseShortcutsOptions {
  isPreviewMode: boolean;
  onTogglePreview: () => void;
  isEnabled?: boolean;
}

export function useShortcuts({
  isPreviewMode,
  onTogglePreview,
  isEnabled = true,
}: UseShortcutsOptions) {
  const isHoveringCanvas = useRef(false);
  const isSpacePressed = useRef(false);
  const isPanning = useRef(false);

  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        // Don't trigger if user is typing in input fields
        if (document.activeElement?.tagName === 'INPUT' || 
            document.activeElement?.tagName === 'TEXTAREA') {
          return;
        }

        // Check if we're hovering over canvas area and not panning
        if (isHoveringCanvas.current && !isPanning.current) {
          // Get the element currently under the mouse cursor
          const mouseEvent = (window as any).lastMouseEvent;
          let target: Element | null = null;
          
          if (mouseEvent) {
            target = document.elementFromPoint(mouseEvent.clientX, mouseEvent.clientY);
          }
          
          // Check if we're not hovering over side panels
          const isOverSidePanel = target?.closest('[data-panel="properties"]') ||
                                  target?.closest('[data-panel="hierarchy"]') || 
                                  target?.closest('[data-panel="asset"]') ||
                                  target?.closest('[data-panel="left-sidebar"]');
          
          if (!isOverSidePanel) {
            e.preventDefault();
            onTogglePreview();
            return;
          }
        }

        isSpacePressed.current = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        isSpacePressed.current = false;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      // Detect if panning is starting (space + left click or middle mouse)
      if ((e.button === 0 && isSpacePressed.current) || e.button === 1) {
        isPanning.current = true;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      isPanning.current = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Store the last mouse event for accurate cursor position tracking
      (window as any).lastMouseEvent = e;
      
      // Update canvas hover state based on current mouse position
      const target = document.elementFromPoint(e.clientX, e.clientY);
      const isOverCanvas = target?.closest('[data-panel="canvas"]');
      isHoveringCanvas.current = !!isOverCanvas;
    };

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isEnabled, onTogglePreview]);

  return {};
}