import { useEffect } from "react";

export function useKeyboardNav(onEscape?: () => void, onEnter?: () => void) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onEscape) {
        onEscape();
      }
      if (e.key === "Enter" && onEnter) {
        onEnter();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onEscape, onEnter]);
}
