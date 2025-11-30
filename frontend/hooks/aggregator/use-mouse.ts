import { useMouseStore } from "@/frontend/store/mouse-store/mouse-store";
import { Position } from "@/frontend/types";
import { useEffect, useState } from "react";

export default function useMouse() {
  const [mousePosition, setMousePosition] = useState<Position>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };
    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    useMouseStore.setState({ mousePosition });
  }, [mousePosition]);
}
