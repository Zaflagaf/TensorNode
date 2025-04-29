"use client";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import { useFlowContext } from "./FlowContext";

interface ZoomContextProps {
  zoom: number;
  setZoom: (zoom: number) => void;
  projectPosition: (position: {
    x: number;
    y: number;
  }) => { x: number; y: number } | undefined;
  defaultZoom: number;
}

const ZoomContext = createContext<ZoomContextProps | undefined>(undefined);

const defaultZoom = 0.3;
export const ZoomProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [zoom, setZoom] = useState<number>(defaultZoom);
  const canvasRef = useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    canvasRef.current = document.getElementById("canvas");
  }, []);

  const projectPosition = useCallback(
    (position: { x: number; y: number }) => {
      if (!canvasRef?.current) return undefined;

      const canvasRect = canvasRef.current.getBoundingClientRect();

      return {
        x: (position.x - canvasRect.x - canvasRect.width / 2) / zoom,
        y: (position.y - canvasRect.y - canvasRect.height / 2) / zoom,
      };
    },
    [zoom, canvasRef]
  );

  return (
    <ZoomContext.Provider
      value={{ zoom, setZoom, projectPosition, defaultZoom }}
    >
      {children}
    </ZoomContext.Provider>
  );
};

export const useZoom = (): ZoomContextProps => {
  const context = useContext(ZoomContext);
  if (!context) {
    throw new Error("useZoom must be used within a ZoomProvider");
  }
  return context;
};
