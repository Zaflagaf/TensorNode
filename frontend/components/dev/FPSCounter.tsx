"use client";
import React, { useEffect, useRef, useState } from "react";


const FPSCounterComponent = () => {
  const [fps, setFps] = useState(0);
  const frames = useRef(0);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    let animationFrame: number;

    const tick = () => {
      frames.current += 1;
      const now = performance.now();
      const delta = now - lastTime.current;

      if (delta >= 1000) {
        setFps(Math.round((frames.current * 1000) / delta));
        frames.current = 0;
        lastTime.current = now;
      }

      animationFrame = requestAnimationFrame(tick);
    };

    animationFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <div
    className="px-[10px] py-[5px] bg-[rgba(0,0,0,0.5)] text-white rounded-[4px] flex h-fit"
      style={{
        fontFamily: "monospace",

      }}
    >
      FPS: {fps}
    </div>
  );
}
const FPSCounter = React.memo(FPSCounterComponent);
export default FPSCounter;