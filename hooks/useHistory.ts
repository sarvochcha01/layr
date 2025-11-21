import { useState, useCallback, useRef } from 'react';

interface HistoryState<T> {
    past: T[];
    present: T;
    future: T[];
}

interface UseHistoryReturn<T> {
    state: T;
    setState: (newState: T | ((prev: T) => T), recordHistory?: boolean) => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    clearHistory: () => void;
}

const MAX_HISTORY_SIZE = 50;

export function useHistory<T>(initialState: T): UseHistoryReturn<T> {
    const [history, setHistory] = useState<HistoryState<T>>({
        past: [],
        present: initialState,
        future: [],
    });

    const isUndoRedoAction = useRef(false);

    const setState = useCallback((
        newState: T | ((prev: T) => T),
        recordHistory: boolean = true
    ) => {
        setHistory((currentHistory) => {
            const resolvedState = typeof newState === 'function'
                ? (newState as (prev: T) => T)(currentHistory.present)
                : newState;

            // Don't record history if explicitly disabled or if it's an undo/redo action
            if (!recordHistory || isUndoRedoAction.current) {
                return {
                    ...currentHistory,
                    present: resolvedState,
                };
            }

            // Check if state actually changed
            if (JSON.stringify(resolvedState) === JSON.stringify(currentHistory.present)) {
                return currentHistory;
            }

            // Add current state to past and limit history size
            const newPast = [...currentHistory.past, currentHistory.present];
            if (newPast.length > MAX_HISTORY_SIZE) {
                newPast.shift(); // Remove oldest entry
            }

            return {
                past: newPast,
                present: resolvedState,
                future: [], // Clear future when new action is performed
            };
        });
    }, []);

    const undo = useCallback(() => {
        setHistory((currentHistory) => {
            if (currentHistory.past.length === 0) {
                return currentHistory;
            }

            const previous = currentHistory.past[currentHistory.past.length - 1];
            const newPast = currentHistory.past.slice(0, -1);

            isUndoRedoAction.current = true;

            return {
                past: newPast,
                present: previous,
                future: [currentHistory.present, ...currentHistory.future],
            };
        });

        // Reset flag after state update
        setTimeout(() => {
            isUndoRedoAction.current = false;
        }, 0);
    }, []);

    const redo = useCallback(() => {
        setHistory((currentHistory) => {
            if (currentHistory.future.length === 0) {
                return currentHistory;
            }

            const next = currentHistory.future[0];
            const newFuture = currentHistory.future.slice(1);

            isUndoRedoAction.current = true;

            return {
                past: [...currentHistory.past, currentHistory.present],
                present: next,
                future: newFuture,
            };
        });

        // Reset flag after state update
        setTimeout(() => {
            isUndoRedoAction.current = false;
        }, 0);
    }, []);

    const clearHistory = useCallback(() => {
        setHistory((currentHistory) => ({
            past: [],
            present: currentHistory.present,
            future: [],
        }));
    }, []);

    return {
        state: history.present,
        setState,
        undo,
        redo,
        canUndo: history.past.length > 0,
        canRedo: history.future.length > 0,
        clearHistory,
    };
}
