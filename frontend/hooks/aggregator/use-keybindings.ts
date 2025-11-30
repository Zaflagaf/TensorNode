import { useEffect, useRef } from "react";
import checkShortcuts from "../../lib/checkShortcuts";

export default function useKeybindings() {
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // si ref vide -> récupérer canvas
      if (!containerRef.current) {
        containerRef.current = document.getElementById("canvas");
      }

      checkShortcuts(containerRef.current, e);
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return containerRef;
}
