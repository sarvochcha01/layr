import { useState, useCallback, useRef } from 'react';

interface UseDragSelectOptions {
  onSelectionComplete?: (selectedIds: string[]) => void;
  onSelectionCancel?: () => void;
}

export function useDragSelect(options: UseDragSelectOptions = {}) {
  const { onSelectionComplete, onSelectionCancel } = options;
  
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<string | null>(null);
  const [hoveredIds, setHoveredIds] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const justCompletedRef = useRef(false);

  // Start selection on mouse down
  const handleMouseDown = useCallback((
    event: React.MouseEvent,
    itemId: string
  ) => {
    // Only start selection on left click without Ctrl/Cmd
    // Allow starting on empty space (itemId can be 'empty-space')
    if (event.button === 0 && !event.ctrlKey && !event.metaKey) {
      setIsSelecting(true);
      setSelectionStart(itemId);
      justCompletedRef.current = false;
      // Don't add 'empty-space' to selection
      if (itemId !== 'empty-space') {
        setHoveredIds(new Set([itemId]));
      } else {
        setHoveredIds(new Set());
      }
    }
  }, []);

  // Add item to selection on mouse enter
  const handleMouseEnter = useCallback((itemId: string) => {
    if (isSelecting) {
      // Only add real component IDs, not 'empty-space'
      if (itemId !== 'empty-space') {
        setHoveredIds(prev => new Set([...prev, itemId]));
      }
    }
  }, [isSelecting]);

  // Complete selection on mouse up
  const handleMouseUp = useCallback(() => {
    if (isSelecting && hoveredIds.size > 0) {
      onSelectionComplete?.(Array.from(hoveredIds));
      justCompletedRef.current = true;
      
      // Reset the flag after a short delay to allow click event to check it
      setTimeout(() => {
        justCompletedRef.current = false;
      }, 100);
    }
    
    // Reset selection state
    setIsSelecting(false);
    setSelectionStart(null);
    setHoveredIds(new Set());
  }, [isSelecting, hoveredIds, onSelectionComplete]);

  // Cancel selection if mouse leaves container
  const handleMouseLeave = useCallback(() => {
    if (isSelecting) {
      setIsSelecting(false);
      setSelectionStart(null);
      setHoveredIds(new Set());
      justCompletedRef.current = false;
      onSelectionCancel?.();
    }
  }, [isSelecting, onSelectionCancel]);

  // Check if an item is currently hovered during selection
  const isHovered = useCallback((itemId: string) => {
    return hoveredIds.has(itemId);
  }, [hoveredIds]);

  // Check if a drag-select just completed (to prevent immediate deselection)
  const wasJustCompleted = useCallback(() => {
    return justCompletedRef.current;
  }, []);

  // Reset selection state
  const reset = useCallback(() => {
    setIsSelecting(false);
    setSelectionStart(null);
    setHoveredIds(new Set());
    justCompletedRef.current = false;
  }, []);

  return {
    isSelecting,
    selectionStart,
    hoveredIds,
    hoveredCount: hoveredIds.size,
    containerRef,
    handleMouseDown,
    handleMouseEnter,
    handleMouseUp,
    handleMouseLeave,
    isHovered,
    wasJustCompleted,
    reset,
  };
}
