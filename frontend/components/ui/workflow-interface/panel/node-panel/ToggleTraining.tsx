"use client";
import { cn } from "@/frontend/lib/utils";
import { findLayer, useLayersStore } from "@/frontend/store/layersStore";
import { useSocketStore } from "@/frontend/store/socketStore";
import { useTrainingStore } from "@/frontend/store/trainingStore";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Progress } from "../../../shadcn/progress";

export default function ToggleTraining() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const currentLayer = useLayersStore((state) => state.currentLayer);
  const layers = useLayersStore((state) => state.layers);
  const socket = useSocketStore((state) => state.socket);

  const epoch = useTrainingStore((state) => state.epoch);
  const totalEpochs = useTrainingStore((state) => state.totalEpochs);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (epoch === totalEpochs || epoch === 0) setIsRunning(false);
    else setIsRunning(true);
  }, [epoch]);

  const handlePause = () => setIsPaused(true);
  const handlePlay = () => setIsPaused(false);
  const handleStop = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setSeconds(0);
    }
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        if (!isPaused) setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, isPaused]);

  const mm = Math.floor(seconds / 60);
  const ss = seconds % 60;
  const formattedTime = `${mm.toString().padStart(2, "0")}:${ss
    .toString()
    .padStart(2, "0")}`;

  // Ne jamais retirer le parent du DOM pour que les animations fonctionnent
  return (
    <div
      className={cn(
        "absolute bottom-0 left-0 z-1 w-full m-2 pointer-events-none",
        !currentLayer ||
          (findLayer(layers, currentLayer)?.type !== "compositor" && "hidden")
      )}
    >
      <motion.div
        className="rounded-md py-2 relative flex m-auto justify-center gap-2 overflow-hidden bg-muted/20 backdrop-blur-xs border pointer-events-auto"
        animate={{
          width: isRunning ? 115 : 0,
          opacity: isRunning ? 1 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 250,
          damping: 25,
        }}
      >
        {isRunning && (
          <>
            <Square
              className="fill-muted-foreground cursor-pointer stroke-none hover:fill-foreground transition-colors"
              onClick={handleStop}
            />
            {isPaused ? (
              <Play
                className="fill-muted-foreground cursor-pointer stroke-none hover:fill-foreground transition-colors"
                onClick={handlePlay}
              />
            ) : (
              <Pause
                className="fill-muted-foreground cursor-pointer stroke-none hover:fill-foreground transition-colors"
                onClick={handlePause}
              />
            )}
            <AnimatePresence>
              <motion.p
                key="timer"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.2 }}
                className="font-mono text-sm"
              >
                {formattedTime}
              </motion.p>
            </AnimatePresence>
            <Progress
              value={(epoch / totalEpochs) * 100}
              className="bg-transparent w-full h-full rounded-none absolute top-0 left-0 -z-1"
              classNameSecondary="bg-hue-250"
            />
          </>
        )}
      </motion.div>
    </div>
  );
}
