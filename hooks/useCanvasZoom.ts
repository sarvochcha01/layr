import { useEffect, useRef, useState } from "react";

interface UseCanvasZoomOptions {
  minZoom?: number;
  maxZoom?: number;
  zoomSpeed?: number;
  isEnabled?: boolean;
}

export function useCanvasZoom({
  minZoom = 0.25,
  maxZoom = 2,
  zoomSpeed = 0.1,
  isEnabled = true,
}: UseCanvasZoomOptions = {}) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const panOffsetRef = useRef({ x: 0, y: 0 });

  // Expose reset function via window for external control
  useEffect(() => {
    if (!isEnabled) return;
    
    (window as any).__resetCanvasZoom = () => {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    };

    return () => {
      delete (window as any).__resetCanvasZoom;
    };
  }, [isEnabled]);

  useEffect(() => {
    if (!isEnabled) return;

    // Ctrl + Scroll Wheel = Zoom
    const handleWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;

      e.preventDefault();
      e.stopPropagation();

      const delta = e.deltaY > 0 ? -zoomSpeed : zoomSpeed;
      setZoom((prevZoom) => {
        const newZoom = prevZoom + delta;
        return Math.max(minZoom, Math.min(maxZoom, newZoom));
      });
    };

    // Track Space key press
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        setIsSpacePressed(true);
        // Prevent default space behavior (scrolling)
        if (document.activeElement?.tagName !== 'INPUT' && 
            document.activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
        if (isPanning) {
          setIsPanning(false);
          document.body.style.cursor = '';
          document.body.style.userSelect = '';
        }
      }
    };

    // Middle Mouse Button (without Ctrl) OR Space + Left Mouse Button = Pan
    const handleMouseDown = (e: MouseEvent) => {
      // Middle mouse button (button 1) without Ctrl
      const isMiddleMousePan = e.button === 1;
      // Left mouse button (button 0) with Space key
      const isSpacePan = e.button === 0 && isSpacePressed;

      if (!isMiddleMousePan && !isSpacePan) return;

      e.preventDefault();
      e.stopPropagation();

      setIsPanning(true);
      panStartRef.current = { x: e.clientX, y: e.clientY };
      panOffsetRef.current = { ...pan };
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isPanning) {
        // Update cursor when space is held but not panning yet
        if (isSpacePressed) {
          document.body.style.cursor = 'grab';
        }
        return;
      }

      e.preventDefault();

      const deltaX = e.clientX - panStartRef.current.x;
      const deltaY = e.clientY - panStartRef.current.y;

      setPan({
        x: panOffsetRef.current.x + deltaX,
        y: panOffsetRef.current.y + deltaY,
      });
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!isPanning) return;

      setIsPanning(false);
      // Restore cursor based on space key state
      document.body.style.cursor = isSpacePressed ? 'grab' : '';
      document.body.style.userSelect = '';
    };

    // Add event listeners
    document.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isEnabled, isPanning, isSpacePressed, pan, minZoom, maxZoom, zoomSpeed]);

  return {
    zoom,
    pan,
    isPanning,
  };
}
