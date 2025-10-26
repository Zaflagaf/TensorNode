"use client";
import { motion, useAnimation } from "framer-motion";
import React, { useEffect, useMemo, useState } from "react";
import "./loading.scss";

export default function Loading({ children }: { children: React.ReactNode }) {
  const [showLoader, setShowLoader] = useState(true);
  const svgControls = useAnimation();
  const divControls = useAnimation();

  const memoizedChildren = useMemo(() => children, [children]);

  useEffect(() => {
    // Démarrer la rotation infinie
    svgControls.start({
      rotate: [0, 180, 360],
      transition: { repeat: Infinity, duration: 1.25, ease: "easeInOut" },
    });

    // Après 3s : explosion et fade out
    const timeout = setTimeout(() => {
      svgControls.start({
        scale: 100,
        transition: { duration: 0.5, ease: "easeInOut" },
      });

      divControls.start({
        opacity: 0,
        transition: { duration: 0.15 },
      });

      // Supprimer le loader après l'explosion
      setTimeout(() => setShowLoader(false), 300);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  if (!showLoader) return <>{memoizedChildren}</>;

  return (
    <motion.div
      className="absolute z-50 flex items-center justify-center w-full h-screen bg-black"
      animate={divControls}
      initial={{ opacity: 1 }}
    >
      <motion.svg
        animate={svgControls}
        initial={{ rotate: 0, scale: 1 }}
        className="w-20"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 44.52 30.35"
      >
        <path
          className="cls-1"
          d="M29.35,15.17h7.09c3.91,0,7.09-3.17,7.09-7.09h0c0-3.91-3.17-7.09-7.09-7.09h-7.09s0,0,0,0c-7.83,0-14.17,6.35-14.17,14.17h0s-7.09,0-7.09,0c-3.91,0-7.09,3.17-7.09,7.09h0c0,3.91,3.17,7.09,7.09,7.09h7.09s0,0,0,0c7.83,0,14.17-6.35,14.17-14.17h0Z"
        />
        <path
          className="cls-2"
          d="M29.35,15.17h7.09c3.91,0,7.09,3.17,7.09,7.09h0c0,3.91-3.17,7.09-7.09,7.09h-7.09s0,0,0,0c-7.83,0-14.17-6.35-14.17-14.17h0s-7.09,0-7.09,0c-3.91,0-7.09-3.17-7.09-7.09h0c0-3.91,3.17-7.09,7.09-7.09h7.09s0,0,0,0c7.83,0,14.17,6.35,14.17,14.17h0Z"
        />
      </motion.svg>
    </motion.div>
  );
}