import { useState, useRef, useEffect, useCallback } from "react";

export interface SortMenuState {
  showSortMenu: boolean;
  setShowSortMenu: (v: boolean) => void;
  sortMenuRef: React.RefObject<HTMLDivElement | null>;
  toggleSortMenu: () => void;
}

/**
 * Handles sort menu toggle + click-outside-to-close.
 */
export function useSortMenu(): SortMenuState {
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  const toggleSortMenu = useCallback(() => {
    setShowSortMenu((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!showSortMenu) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target as Node)) {
        setShowSortMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSortMenu]);

  return { showSortMenu, setShowSortMenu, sortMenuRef, toggleSortMenu };
}
