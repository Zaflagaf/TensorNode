// hooks/useTrainingProgress.ts
import { ButtonStatus } from "@/frontend/types";
import { useCallback, useEffect, useRef } from "react";
import { useSocketStore } from "../store/socketStore";
import { useTrainingStore } from "../store/trainingStore";

// --- Types --- //
interface TrainProgressEvent {
  status: ButtonStatus;
  epoch?: number;
  total_epochs?: number;
  losses?: Record<string, number>;
  history?: Record<string, number[]>;
  final_losses?: Record<string, number>;
}

interface ProblemNodesEvent {
  problem_nodes: string[];
}

// --- Hook principal --- //
export function useTrainingProgress() {
  const socket = useSocketStore((state) => state.socket);

  const onEpochEndRef = useRef<
    ((epoch: number, history: Record<string, number[]>) => void) | null
  >(null);

  const setOnEpochEnd = useCallback(
    (callback: (epoch: number, history: Record<string, number[]>) => void) => {
      onEpochEndRef.current = callback;
    },
    []
  );

  useEffect(() => {
    if (!socket) return;
    const onConnect = () => console.log("Socket connecté !");
    const onDisconnect = (reason: string) =>
      console.log("Socket déconnecté :", reason);
    const onTrainProgress = (data: TrainProgressEvent) => {
      console.log(data.history);

      useTrainingStore.setState({
        status: ButtonStatus.loading,
        epoch: data.epoch,
        totalEpochs: data.total_epochs,
        history: data.history,
      });

      if (onEpochEndRef.current && data.epoch !== undefined) {
        onEpochEndRef.current(data.epoch, data.history ?? {});
      }
    };

    const onTrainComplete = (data: TrainProgressEvent) => {
      useTrainingStore.setState({
        status: ButtonStatus.success,
        history: data.history,
      });

      setTimeout(() => {
        useTrainingStore.setState({ status: ButtonStatus.idle, epoch: 0 });
      }, 3000);
    };

    // --- Add listeners ---
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    socket.on("train_progress", onTrainProgress);
    socket.on("train_complete", onTrainComplete);

    // --- Cleanup ---
    return () => {
      socket.off("train_progress", onTrainProgress);
      socket.off("train_complete", onTrainComplete);
    };
  }, [socket]);

  return {
    setOnEpochEnd,
    trainingState: useTrainingStore((state) => state), // renvoie le state global
  };
}
