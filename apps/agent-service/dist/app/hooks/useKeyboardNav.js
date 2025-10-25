import { useEffect } from "react";
export function useKeyboardNav(onEscape, onEnter) {
    useEffect(() => {
        const handleKeyDown = (e) => {
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
//# sourceMappingURL=useKeyboardNav.js.map