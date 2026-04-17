import { useState, useCallback } from 'react';

interface UseMultiSelectOptions {
  onSelectionChange?: (selectedIds: string[]) => void;
  allowEmpty?: boolean;
}

export function useMultiSelect(options: UseMultiSelectOptions = {}) {
  const { onSelectionChange, allowEmpty = false } = options;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Handle single selection (replaces current selection)
  const selectSingle = useCallback((id: string | null) => {
    const newSelection = id ? [id] : [];
    setSelectedIds(newSelection);
    onSelectionChange?.(newSelection);
  }, [onSelectionChange]);

  // Handle multi-selection (sets multiple items)
  const selectMultiple = useCallback((ids: string[]) => {
    setSelectedIds(ids);
    onSelectionChange?.(ids);
  }, [onSelectionChange]);

  // Toggle a single item in the selection (Ctrl+Click behavior)
  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const isCurrentlySelected = prev.includes(id);
      
      if (isCurrentlySelected) {
        // Remove from selection
        const newSelection = prev.filter(itemId => itemId !== id);
        // Keep at least one selected if allowEmpty is false
        if (!allowEmpty && newSelection.length === 0) {
          onSelectionChange?.([id]);
          return [id];
        }
        onSelectionChange?.(newSelection);
        return newSelection;
      } else {
        // Add to selection
        const newSelection = [...prev, id];
        onSelectionChange?.(newSelection);
        return newSelection;
      }
    });
  }, [onSelectionChange, allowEmpty]);

  // Add item to selection
  const addToSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev;
      const newSelection = [...prev, id];
      onSelectionChange?.(newSelection);
      return newSelection;
    });
  }, [onSelectionChange]);

  // Remove item from selection
  const removeFromSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSelection = prev.filter(itemId => itemId !== id);
      // Keep at least one selected if allowEmpty is false
      if (!allowEmpty && newSelection.length === 0) {
        return prev;
      }
      onSelectionChange?.(newSelection);
      return newSelection;
    });
  }, [onSelectionChange, allowEmpty]);

  // Clear all selections
  const clearSelection = useCallback(() => {
    if (!allowEmpty && selectedIds.length > 0) return;
    setSelectedIds([]);
    onSelectionChange?.([]);
  }, [onSelectionChange, allowEmpty, selectedIds.length]);

  // Select all items
  const selectAll = useCallback((allIds: string[]) => {
    setSelectedIds(allIds);
    onSelectionChange?.(allIds);
  }, [onSelectionChange]);

  // Check if an item is selected
  const isSelected = useCallback((id: string) => {
    return selectedIds.includes(id);
  }, [selectedIds]);

  // Handle click with modifier keys
  const handleClick = useCallback((
    id: string,
    event: { ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean }
  ) => {
    if (event.ctrlKey || event.metaKey) {
      // Ctrl/Cmd+Click: toggle selection
      toggleSelection(id);
    } else {
      // Normal click: select only this item
      selectSingle(id);
    }
  }, [toggleSelection, selectSingle]);

  // Handle click on empty space (deselect all if allowEmpty is true)
  const handleEmptySpaceClick = useCallback((
    event: { ctrlKey?: boolean; metaKey?: boolean }
  ) => {
    // Only clear selection if not holding Ctrl/Cmd and allowEmpty is true
    if (!event.ctrlKey && !event.metaKey && allowEmpty) {
      clearSelection();
    }
  }, [allowEmpty, clearSelection]);

  return {
    selectedIds,
    selectSingle,
    selectMultiple,
    toggleSelection,
    addToSelection,
    removeFromSelection,
    clearSelection,
    selectAll,
    isSelected,
    handleClick,
    handleEmptySpaceClick,
  };
}
