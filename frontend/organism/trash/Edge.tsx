const WorkflowEdgeBefore = ({ edge }: { edge: EdgeType} ) => {
    const zoom = useZoomStore((state) => state.zoom)
    const typeColors = workflowConfig.typeColors



    const edgePathRef = useRef<SVGPathElement | null>(null);
    const edgeHitboxRef = useRef<SVGPathElement | null>(null);
    const sourceNodeRef = useRef<HTMLElement | null>(null);
    const targetNodeRef = useRef<HTMLElement | null>(null);

    const startRef = useRef<{ x: number; y: number } | null>(null);
    const endRef = useRef<{ x: number; y: number } | null>(null);

    const [inputType, setInputType] = useState<string | null>(null);
    const [outputType, setOutputType] = useState<string | null>(null);

    useEffect(() => {
      const getClosestHandleDataId = (handleId: string): string | null => {
        if (!sourceNodeRef.current) return null;

        // Essaye de trouver le handle exact
        const exactHandle = sourceNodeRef.current.querySelector(
          `#${handleId}`
        ) as HTMLElement | null;
        if (exactHandle) {
          return exactHandle.getAttribute("data-id");
        }

        // Si le handle exact est introuvable, trouve le handle le plus proche
        const allHandles = Array.from(
          sourceNodeRef.current.querySelectorAll("[data-id]")
        ) as HTMLElement[];
        if (allHandles.length === 0) return null;

        // Exemple de "proximité" simple : on retourne le premier (tu peux adapter avec d'autres critères)
        return allHandles[0].getAttribute("data-id");
      };

      setInputType(getClosestHandleDataId(sourceHandle));
      setOutputType(getClosestHandleDataId(targetHandle));
    }, [sourceHandle, targetHandle, sourceNodeRef]);

    const getColor = useCallback(
      (type: string | null): string => {
        const key = type as keyof typeof TYPE_COLORS;
        return TYPE_COLORS[key] || TYPE_COLORS.default;
      },
      [sourceHandle, targetHandle, sourceNodeRef]
    );

    const fromColor = getColor(inputType);
    const toColor = getColor(outputType);

    useEffect(() => {
      console.log({ fromColor, toColor, inputType, outputType });
    }, [fromColor, toColor, inputType, outputType]);

    useImperativeHandle(ref, () => ({
      updatePath,
    }));

    const generatePath = (
      type: string,
      startX: number,
      startY: number,
      endX: number,
      endY: number
    ) => {
      const tension = [0.1];

      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;
      const tensionValue = tension[0];
      const distance = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);

      switch (type) {
        case "bezier-smooth":
          const cp1X = startX + distance * tensionValue * 0.6;
          const cp2X = endX - distance * tensionValue * 0.6;
          return `M ${startX} ${startY} C ${cp1X} ${startY} ${cp2X} ${endY} ${endX} ${endY}`;

        case "bezier-sharp":
          const cp1XSharp = startX + distance * tensionValue * 0.3;
          const cp2XSharp = endX - distance * tensionValue * 0.3;
          const offsetY = (endY - startY) * tensionValue * 0.5;
          return `M ${startX} ${startY} C ${cp1XSharp} ${
            startY + offsetY
          } ${cp2XSharp} ${endY - offsetY} ${endX} ${endY}`;

        case "arc-elegant":
          const radius = distance * tensionValue * 0.5;
          const sweep = startY < endY ? 1 : 0;
          return `M ${startX} ${startY} A ${radius} ${radius} 0 0 ${sweep} ${endX} ${endY}`;

        case "wave-flow":
          const waveHeight = 30 * tensionValue;
          const cp1Wave = `${startX + distance * 0.25} ${startY - waveHeight}`;
          const cp2Wave = `${startX + distance * 0.75} ${endY + waveHeight}`;
          return `M ${startX} ${startY} C ${cp1Wave} ${cp2Wave} ${endX} ${endY}`;

        case "electric":
          const segments = 5;
          let path = `M ${startX} ${startY}`;
          for (let i = 1; i <= segments; i++) {
            const x = startX + (endX - startX) * (i / segments);
            const y =
              startY +
              (endY - startY) * (i / segments) +
              Math.sin(i * Math.PI) * 20 * tensionValue;
            path += ` L ${x} ${y}`;
          }
          return path;

        case "organic":
          const cp1Org = `${startX + distance * 0.3} ${
            startY + Math.sin(tensionValue * Math.PI) * 40
          }`;
          const cp2Org = `${endX - distance * 0.3} ${
            endY - Math.sin(tensionValue * Math.PI) * 40
          }`;
          return `M ${startX} ${startY} C ${cp1Org} ${cp2Org} ${endX} ${endY}`;

        default:
          return `M ${startX} ${startY} L ${endX} ${endY}`;
      }
    };

    const updatePath = useCallback(() => {
      if (
        !canvasRef.current ||
        !sourceNodeRef.current ||
        !targetNodeRef.current
      )
        return;

      const sourceHandleEl = sourceNodeRef.current.querySelector(
        `#${sourceHandle}`
      ) as HTMLElement;
      const targetHandleEl = targetNodeRef.current.querySelector(
        `#${targetHandle}`
      ) as HTMLElement;

      if (!sourceHandleEl || !targetHandleEl) return;

      const canvasRect = canvasRef.current.getBoundingClientRect();
      const sourceRect = sourceHandleEl.getBoundingClientRect();
      const targetRect = targetHandleEl.getBoundingClientRect();

      const nextStartX =
        (sourceRect.x - canvasRect.x + sourceRect.width / 2) / zoom;
      const nextStartY =
        (sourceRect.y - canvasRect.y + sourceRect.height / 2) / zoom;
      const nextEndX =
        (targetRect.x - canvasRect.x + sourceRect.width / 2) / zoom;
      const nextEndY =
        (targetRect.y - canvasRect.y + sourceRect.height / 2) / zoom;

      const prevStart = startRef.current;
      const prevEnd = endRef.current;

      const hasStartChanged =
        !prevStart || prevStart.x !== nextStartX || prevStart.y !== nextStartY;
      const hasEndChanged =
        !prevEnd || prevEnd.x !== nextEndX || prevEnd.y !== nextEndY;

      if (!hasStartChanged && !hasEndChanged) return;

      startRef.current = { x: nextStartX, y: nextStartY };
      endRef.current = { x: nextEndX, y: nextEndY };

      const path = generatePath(
        "organic",
        nextStartX,
        nextStartY,
        nextEndX,
        nextEndY
      );
      edgePathRef.current?.setAttribute("d", path);
      edgeHitboxRef.current?.setAttribute("d", path);
    }, [zoom]);

    useLayoutEffect(() => {
      sourceNodeRef.current = document.getElementById(source);
      targetNodeRef.current = document.getElementById(target);
    }, [source, target]);

    const handleKeydown = useCallback(
      (e: KeyboardEvent) => {
        if (
          e.key === "Delete" ||
          (e.key === "Backspace" && activeEdge === id)
        ) {
          e.preventDefault();
          removeEdge(id);
        }
      },
      [removeEdge, id, activeEdge]
    );

    useEffect(() => {
      document.addEventListener("keydown", handleKeydown);
      return () => document.removeEventListener("keydown", handleKeydown);
    }, [handleKeydown]);

    return (
      <svg
        id={id}
        className="edge"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          overflow: "visible",
          pointerEvents: "none",
        }}
      >
        <defs>
          {/* Dégradé doux adapté au thème clair */}
          <linearGradient
            id={`${id}-gradient`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor={`${fromColor}`} />
            <stop offset="100%" stopColor={`${toColor}`} />
          </linearGradient>

          {/* Glow clair */}
          <filter
            id={`${id}-glow`}
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Hitbox pour clics/survols */}
        <path
          ref={edgeHitboxRef}
          className="path-hitbox"
          style={{
            fill: "none",
            stroke: "transparent",
            strokeWidth: 10,
            pointerEvents: "stroke",
          }}
        />

        {/* Lien visuel */}
        <path
          ref={edgePathRef}
          className="edge-path"
          mask={`url(#${id}-mask)`}
          style={{
            fill: "none",
            stroke: activeEdge === id ? "#000" : `url(#${id}-gradient)`,
            strokeWidth: activeEdge === id ? 3 : 2,
            filter: activeEdge === id ? `url(#${id}-glow)` : "none",
            transition: "stroke 0.3s, stroke-width 0.3s, filter 0.3s",
            strokeLinecap: "round",
          }}
        />
      </svg>
    );
  }
);