import { useEffect, useRef, useState } from "react";

interface UseCtrlDragOptions {
  onDragStart?: (componentId: string) => void;
  onDragEnd?: (componentId: string, targetId: string | null, position: "top" | "bottom" | "left" | "right" | "center" | "inside") => void;
  isEnabled?: boolean;
}

export function useCtrlDrag({
  onDragStart,
  onDragEnd,
  isEnabled = true,
}: UseCtrlDragOptions = {}) {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedComponentId, setDraggedComponentId] = useState<string | null>(null);
  const [dropIndicator, setDropIndicator] = useState<{ targetId: string | null; position: "top" | "bottom" | "left" | "right" | "center" | "inside" } | null>(null);
  const [isShiftHeld, setIsShiftHeld] = useState(false);
  const draggedElementRef = useRef<HTMLElement | null>(null);
  const ghostElementRef = useRef<HTMLElement | null>(null);
  const lastTargetRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isEnabled) return;

    const handleMouseDown = (e: MouseEvent) => {
      // Only trigger on Ctrl+Click (or Cmd+Click on Mac)
      if (!e.ctrlKey && !e.metaKey) return;

      // Track if Shift is held for swap mode
      setIsShiftHeld(e.shiftKey);

      // Don't interfere with text selection or input fields
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Find the component wrapper - look for the closest element with data-component-id
      const componentWrapper = target.closest('[data-component-id]') as HTMLElement;
      
      if (!componentWrapper) return;

      const componentId = componentWrapper.getAttribute('data-component-id');
      if (!componentId) return;

      // Prevent default behavior and stop propagation
      e.preventDefault();
      e.stopPropagation();

      console.log('Ctrl+Drag started for component:', componentId, 'Shift held:', e.shiftKey);

      // Start dragging
      setIsDragging(true);
      setDraggedComponentId(componentId);
      draggedElementRef.current = componentWrapper;

      // Create ghost element with mode indicator
      const rect = componentWrapper.getBoundingClientRect();
      const ghost = componentWrapper.cloneNode(true) as HTMLElement;
      ghost.style.position = 'fixed';
      ghost.style.pointerEvents = 'none';
      ghost.style.opacity = '0.6';
      ghost.style.zIndex = '10000';
      ghost.style.width = rect.width + 'px';
      ghost.style.left = e.clientX - rect.width / 2 + 'px';
      ghost.style.top = e.clientY - 30 + 'px';
      ghost.style.transform = 'rotate(2deg)';
      ghost.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
      
      // Add mode indicator badge
      const badge = document.createElement('div');
      badge.style.position = 'absolute';
      badge.style.top = '-30px';
      badge.style.left = '50%';
      badge.style.transform = 'translateX(-50%)';
      badge.style.background = e.shiftKey ? '#22c55e' : '#3b82f6';
      badge.style.color = 'white';
      badge.style.padding = '4px 12px';
      badge.style.borderRadius = '6px';
      badge.style.fontSize = '11px';
      badge.style.fontWeight = '600';
      badge.style.whiteSpace = 'nowrap';
      badge.textContent = e.shiftKey ? '⇄ SWAP MODE' : '📍 INSERT MODE';
      ghost.appendChild(badge);
      
      document.body.appendChild(ghost);
      ghostElementRef.current = ghost;

      // Style the original element
      componentWrapper.style.opacity = '0.3';
      componentWrapper.style.border = '2px dashed ' + (e.shiftKey ? '#22c55e' : '#3b82f6');
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';

      onDragStart?.(componentId);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !ghostElementRef.current || !draggedComponentId) return;

      // Update shift state during drag
      const shiftHeld = e.shiftKey;
      if (shiftHeld !== isShiftHeld) {
        setIsShiftHeld(shiftHeld);
        // Update ghost badge
        const badge = ghostElementRef.current.querySelector('div');
        if (badge) {
          badge.style.background = shiftHeld ? '#22c55e' : '#3b82f6';
          badge.textContent = shiftHeld ? '⇄ SWAP MODE' : '📍 INSERT MODE';
        }
        // Update original element border
        if (draggedElementRef.current) {
          draggedElementRef.current.style.border = '2px dashed ' + (shiftHeld ? '#22c55e' : '#3b82f6');
        }
      }

      // Move ghost element
      const ghost = ghostElementRef.current;
      const rect = ghost.getBoundingClientRect();
      ghost.style.left = e.clientX - rect.width / 2 + 'px';
      ghost.style.top = e.clientY - 30 + 'px';

      // Clear previous target highlight and classes
      if (lastTargetRef.current) {
        lastTargetRef.current.style.outline = '';
        lastTargetRef.current.style.outlineOffset = '';
        lastTargetRef.current.style.backgroundColor = '';
        lastTargetRef.current.style.transform = '';
        lastTargetRef.current.classList.remove(
          'drop-target-top', 
          'drop-target-bottom', 
          'drop-target-left', 
          'drop-target-right', 
          'drop-target-center',
          'drop-target-inside'
        );
      }

      // Find drop target - get all elements at cursor position
      ghost.style.pointerEvents = 'none';
      const elementsAtPoint = document.elementsFromPoint(e.clientX, e.clientY);
      
      let targetComponent: HTMLElement | null = null;

      // Find the first component that's not the dragged one
      for (const el of elementsAtPoint) {
        const comp = (el as HTMLElement).closest('[data-component-id]') as HTMLElement;
        if (comp && comp.getAttribute('data-component-id') !== draggedComponentId) {
          targetComponent = comp;
          break;
        }
      }

      if (targetComponent) {
        const targetId = targetComponent.getAttribute('data-component-id');
        const rect = targetComponent.getBoundingClientRect();
        
        // Calculate relative position
        const relativeX = e.clientX - rect.left;
        const relativeY = e.clientY - rect.top;
        const width = rect.width;
        const height = rect.height;

        // Define edge threshold (15% from each edge)
        const edgeThreshold = 0.15;
        const topEdge = height * edgeThreshold;
        const bottomEdge = height * (1 - edgeThreshold);
        const leftEdge = width * edgeThreshold;
        const rightEdge = width * (1 - edgeThreshold);

        // Determine position based on mode and zones
        let position: "top" | "bottom" | "left" | "right" | "center" | "inside";
        
        // Check edges first (same for both modes)
        if (relativeY < topEdge) {
          position = "top";
          targetComponent.classList.add('drop-target-top');
        } else if (relativeY > bottomEdge) {
          position = "bottom";
          targetComponent.classList.add('drop-target-bottom');
        } else if (relativeX < leftEdge) {
          position = "left";
          targetComponent.classList.add('drop-target-left');
        } else if (relativeX > rightEdge) {
          position = "right";
          targetComponent.classList.add('drop-target-right');
        } else {
          // CENTER ZONE - behavior differs based on Shift key
          if (shiftHeld) {
            // SWAP MODE (Ctrl+Shift): Always swap in center
            position = "center";
            targetComponent.classList.add('drop-target-center');
            console.log('🟢 Shift held - SWAP mode in center');
          } else {
            // INSERT MODE (Ctrl only): Check if target is a container
            const componentType = targetComponent.getAttribute('data-component-type');
            const containerTypes = ['Header', 'Footer', 'Section', 'Container', 'Grid', 'Card'];
            const isContainer = componentType && containerTypes.includes(componentType);
            
            console.log('🎯 Center zone - Type:', componentType, 'Is container:', isContainer);
            
            if (isContainer) {
              position = "inside";
              targetComponent.classList.add('drop-target-inside');
              console.log('💜 Showing INSIDE indicator for container');
            } else {
              // Non-container: swap instead
              position = "center";
              targetComponent.classList.add('drop-target-center');
              console.log('🟢 Showing SWAP indicator for non-container');
            }
          }
        }

        // Add shift animation to siblings for edge positions
        if (position === "top" || position === "bottom" || position === "left" || position === "right") {
          const parent = targetComponent.parentElement;
          if (parent) {
            Array.from(parent.children).forEach((child) => {
              if (child !== targetComponent && child.hasAttribute('data-component-id')) {
                (child as HTMLElement).classList.add('component-shifting');
              }
            });
          }
        }

        setDropIndicator({ targetId, position });
        lastTargetRef.current = targetComponent;
      } else {
        setDropIndicator(null);
        lastTargetRef.current = null;
        // Remove all shifting animations
        document.querySelectorAll('.component-shifting').forEach(el => {
          el.classList.remove('component-shifting');
        });
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!isDragging || !draggedElementRef.current || !draggedComponentId) return;

      console.log('Ctrl+Drag ended. Drop indicator:', dropIndicator);

      // Reset styles
      draggedElementRef.current.style.opacity = '';
      draggedElementRef.current.style.border = '';
      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      // Remove ghost element
      if (ghostElementRef.current && document.body.contains(ghostElementRef.current)) {
        document.body.removeChild(ghostElementRef.current);
        ghostElementRef.current = null;
      }

      // Clear target highlight and classes
      if (lastTargetRef.current) {
        lastTargetRef.current.style.outline = '';
        lastTargetRef.current.style.outlineOffset = '';
        lastTargetRef.current.style.backgroundColor = '';
        lastTargetRef.current.style.transform = '';
        lastTargetRef.current.classList.remove(
          'drop-target-top', 
          'drop-target-bottom', 
          'drop-target-left', 
          'drop-target-right', 
          'drop-target-center',
          'drop-target-inside'
        );
        lastTargetRef.current = null;
      }

      // Remove all shifting animations
      document.querySelectorAll('.component-shifting').forEach(el => {
        el.classList.remove('component-shifting');
      });

      // Call callback with drop target info
      if (dropIndicator && dropIndicator.targetId) {
        console.log('Calling onDragEnd with:', draggedComponentId, dropIndicator.targetId, dropIndicator.position);
        onDragEnd?.(draggedComponentId, dropIndicator.targetId, dropIndicator.position);
      }

      // Reset state
      setIsDragging(false);
      setDraggedComponentId(null);
      setDropIndicator(null);
      draggedElementRef.current = null;
    };

    // Add event listeners with capture phase to intercept before other handlers
    document.addEventListener('mousedown', handleMouseDown, { capture: true });
    document.addEventListener('mousemove', handleMouseMove, { capture: false });
    document.addEventListener('mouseup', handleMouseUp, { capture: false });

    return () => {
      document.removeEventListener('mousedown', handleMouseDown, { capture: true });
      document.removeEventListener('mousemove', handleMouseMove, { capture: false });
      document.removeEventListener('mouseup', handleMouseUp, { capture: false });
      
      // Cleanup ghost element if it exists
      if (ghostElementRef.current && document.body.contains(ghostElementRef.current)) {
        document.body.removeChild(ghostElementRef.current);
      }

      // Cleanup any lingering styles
      if (lastTargetRef.current) {
        lastTargetRef.current.style.outline = '';
        lastTargetRef.current.style.outlineOffset = '';
        lastTargetRef.current.style.backgroundColor = '';
      }
    };
  }, [isEnabled, isDragging, draggedComponentId, dropIndicator, onDragStart, onDragEnd]);

  return {
    isDragging,
    draggedComponentId,
  };
}
