import { useState, useCallback } from "react";

type MouseState = {
  isDown: boolean;
  isDragging: boolean;
  isHover: boolean;
  position: { x: number; y: number };
  delta: { dx: number; dy: number };
};

type MouseHandlers = Partial<{
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: (e: React.MouseEvent) => void;
  onMouseEnter: (e: React.MouseEvent) => void;
  onMouseLeave: (e: React.MouseEvent) => void;
}>;

type UseMouseEventOptions = {
  down?: boolean;
  move?: boolean;
  up?: boolean;
  enter?: boolean;
  leave?: boolean;
};

export function useMouseEvent(options: UseMouseEventOptions = {}) {
  const [state, setState] = useState<MouseState>({
    isDown: false,
    isDragging: false,
    isHover: false,
    position: { x: 0, y: 0 },
    delta: { dx: 0, dy: 0 },
  });

  const handlers: MouseHandlers = {};

  if (options.down) {
    handlers.onMouseDown = useCallback((e: React.MouseEvent) => {
      setState((prev) => ({
        ...prev,
        isDown: true,
        isDragging: false,
        position: { x: e.clientX, y: e.clientY },
        delta: { dx: 0, dy: 0 },
      }));
    }, []);
  }

  if (options.move) {
    handlers.onMouseMove = useCallback((e: React.MouseEvent) => {
      setState((prev) => {
        if (!prev.isDown) {
          return {
            ...prev,
            position: { x: e.clientX, y: e.clientY },
          };
        }
        return {
          ...prev,
          isDragging: true,
          delta: {
            dx: e.clientX - prev.position.x,
            dy: e.clientY - prev.position.y,
          },
        };
      });
    }, []);
  }

  if (options.up) {
    handlers.onMouseUp = useCallback(() => {
      setState((prev) => ({
        ...prev,
        isDown: false,
        isDragging: false,
        delta: { dx: 0, dy: 0 },
      }));
    }, []);
  }

  if (options.enter) {
    handlers.onMouseEnter = useCallback(() => {
      setState((prev) => ({
        ...prev,
        isHover: true,
      }));
    }, []);
  }

  if (options.leave) {
    handlers.onMouseLeave = useCallback(() => {
      setState((prev) => ({
        ...prev,
        isHover: false,
        isDown: false,
        isDragging: false,
      }));
    }, []);
  }

  return { state, handlers };
}

export default useMouseEvent;