"use client"
import { Position } from "@/frontend/types";

let mousePosition = { x: 0, y: 0 };

document.addEventListener("mousemove", (e) => {
  mousePosition.x = e.clientX;
  mousePosition.y = e.clientY;
});

/**
 * Récupère la dernière position connue de la souris
 * @returns {Position}
 */
export default function getMousePosition() {
  return { ...mousePosition };
}
