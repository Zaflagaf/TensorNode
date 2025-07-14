"use client";
import { useFlowContext } from "@/context/FlowContext";
import { motion } from "framer-motion";
import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Handle un edge ou plusieur
 * @param children Layout appartenant au handle
 * @param type type soit target ou source
 * @param id id du handle genre h1, h2, h3...
 * @param dataId la clé qui contient la valeur du handle
 */
export default function Handle({
  children,
  type,
  id,
  dataId,
}: {
  children: React.ReactNode;
  type: string;
  id: string;
  dataId: string;
}) {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<HTMLDivElement | null>(null);
  const [nodeId, setNodeId] = useState<string>("");
  const { setDragEdge, TYPE_COLORS } = useFlowContext();
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const randomColor = useMemo(() => {
    let index = dataId;
    if (!(index in TYPE_COLORS)) index = "default";
    1;
    const hexa = TYPE_COLORS[index];
    return `${hexa}`;
  }, [dataId]);

  const randomBGColor = useMemo(() => {
    let index = dataId;
    if (!(index in TYPE_COLORS)) index = "default";
    1;
    const hexa = TYPE_COLORS[index];
    const lightened = lightenColor(hexa, 0.75); // 60% vers le blanc
    return lightened;
  }, [dataId]);

  // Fonction helper
  function lightenColor(hexa: string, amount: number): string {
    // Supprimer le # si présent
    if (hexa.startsWith("#")) {
      hexa = hexa.slice(1);
    }

    // Convertir le code hex en composantes RGB
    const r = parseInt(hexa.slice(0, 2), 16);
    const g = parseInt(hexa.slice(2, 4), 16);
    const b = parseInt(hexa.slice(4, 6), 16);

    // Appliquer l’éclaircissement
    const lighten = (c: number) =>
      Math.min(255, Math.round(c + (255 - c) * amount));
    const [lr, lg, lb] = [lighten(r), lighten(g), lighten(b)];

    // Reconstruire le code hex
    const toHex = (c: number) => c.toString(16).padStart(2, "0").toUpperCase();
    return `#${toHex(lr)}${toHex(lg)}${toHex(lb)}`;
  }

  const handleSize = 15;

  useEffect(() => {
    if (!handleRef.current) return;

    nodeRef.current = handleRef.current.closest(".node") as HTMLDivElement;

    const dataIdAttribute = nodeRef.current?.id;

    if (dataIdAttribute) {
      setNodeId(dataIdAttribute);
    }
  }, []);

  // Gère la souris enfoncée
  const handleMouseDown = () => {
    if (handleRef.current) {
      setDragEdge(handleRef.current);
      setIsActive(true);
    }
  };

  // Écoute le relâchement global de la souris
  useEffect(() => {
    const handleMouseUp = () => {
      setIsActive(false);
    };
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  // L’animation est active si la souris est hover ou enfoncée
  const isAnimating = isHovered || isActive;

  return (
    <div className="relative flex w-full">
      <div
        className="absolute"
        style={{
          left:
            type === "target"
              ? `calc(0% - ${handleSize / 2}px)`
              : `calc(100% - ${handleSize / 2}px)`,
          top: `calc(50% - ${handleSize / 2}px)`,
        }}
      >
        <div
          data-node-id={nodeId}
          data-type={type}
          id={id}
          data-id={dataId}
          ref={handleRef}
          className="relative z-10 flex items-center justify-center handle undraggable"
          onMouseDown={handleMouseDown}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            width: handleSize,
            height: handleSize,
            borderRadius: 25,
            outline: `solid 3px ${randomColor}`,
            backgroundColor: `${randomBGColor}`,
          }}
        >
          <motion.div
            className="absolute w-10 h-10 rounded-full pointer-events-none -z-1"
            style={{ outline: `solid 4px ${randomColor}` }}
            animate={{ scale: isAnimating ? 1 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          />
        </div>
      </div>
      <div
        className={`w-full flex items-center px-[20px] py-[15px] ${
          type === "source" ? "justify-end" : "justify-start"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
