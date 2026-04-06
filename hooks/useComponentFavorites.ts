import { useState, useEffect } from 'react';

const FAVORITES_KEY = 'component-favorites';
const RECENT_KEY = 'component-recent';
const MAX_RECENT = 10;

export function useComponentFavorites() {
    const [favorites, setFavorites] = useState<string[]>([]);
    const [recent, setRecent] = useState<string[]>([]);

    // Load from localStorage on mount
    useEffect(() => {
        const savedFavorites = localStorage.getItem(FAVORITES_KEY);
        const savedRecent = localStorage.getItem(RECENT_KEY);

        if (savedFavorites) {
            setFavorites(JSON.parse(savedFavorites));
        }
        if (savedRecent) {
            setRecent(JSON.parse(savedRecent));
        }
    }, []);

    const toggleFavorite = (componentType: string) => {
        setFavorites((prev) => {
            const newFavorites = prev.includes(componentType)
                ? prev.filter((type) => type !== componentType)
                : [...prev, componentType];

            localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
            return newFavorites;
        });
    };

    const addToRecent = (componentType: string) => {
        setRecent((prev) => {
            // Remove if already exists
            const filtered = prev.filter((type) => type !== componentType);
            // Add to beginning
            const newRecent = [componentType, ...filtered].slice(0, MAX_RECENT);

            localStorage.setItem(RECENT_KEY, JSON.stringify(newRecent));
            return newRecent;
        });
    };

    const isFavorite = (componentType: string) => {
        return favorites.includes(componentType);
    };

    return {
        favorites,
        recent,
        toggleFavorite,
        addToRecent,
        isFavorite,
    };
}
