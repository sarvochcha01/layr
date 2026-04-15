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

    // Ctrl + Middle Mouse Button = Pan
    const handleMouseDown = (e: MouseEvent) => {
      // Middle mouse button (button 1) + Ctrl
      if (e.button !== 1 || (!e.ctrlKey && !e.metaKey)) return;

      e.preventDefault();
      e.stopPropagation();

      setIsPanning(true);
      panStartRef.current = { x: e.clientX, y: e.clientY };
      panOffsetRef.current = { ...pan };
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isPanning) return;

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
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    // Add event listeners
    document.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isEnabled, isPanning, pan, minZoom, maxZoom, zoomSpeed]);

  return {
    zoom,
    pan,
    isPanning,
  };
}
