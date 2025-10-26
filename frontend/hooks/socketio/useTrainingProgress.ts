// hooks/useTrainingProgress.ts
import { ButtonStatus } from "@/frontend/types";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

// --- Types --- //
interface TrainProgressEvent {
  status: ButtonStatus;
  epoch?: number;
  total_epochs?: number;
  losses?: Record<string, number>;
  metrics?: Record<string, Record<string, number[]>>;
  history?: Record<string, Record<string, number[]>>;
  final_losses?: Record<string, number>;
}

interface ProblemNodesEvent {
  problem_nodes: string[];
}

interface TrainingState {
  connected: boolean;
  status: ButtonStatus;
  problemNodes: string[];
  epoch: number;
  totalEpochs: number;
  history: Record<string, Record<string, number[]>>;
}

// --- Hook principal --- //
export function useTrainingProgress() {
  const [state, setState] = useState<TrainingState>({
    connected: false,
    status: "idle",
    problemNodes: [],
    epoch: 0,
    totalEpochs: 0,
    history: {},
  });

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io("http://127.0.0.1:8000");
    socketRef.current = socket;

    socket.on("connect", () => {
      setState((prev) => ({ ...prev, connected: true }));
    });

    socket.on("connect_error", (err) => {
      setState((prev) => ({ ...prev, connected: false }));
    });

    socket.on("train_progress", (data: TrainProgressEvent) => {
      setState((prev) => ({
        ...prev,
        status: "loading",
        epoch: data.epoch ?? prev.epoch,
        totalEpochs: data.total_epochs ?? prev.totalEpochs,
        history: data.history ?? prev.history,
      }));
    });

    socket.on("training_problem_nodes", (data: ProblemNodesEvent) => {
      setState((prev) => ({
        ...prev,
        problemNodes: data.problem_nodes
      }))
    })

    socket.on("train_complete", (data: TrainProgressEvent) => {
      setState((prev) => ({
        ...prev,
        status: "success",
        history: data.history ?? prev.history,
      }));

      setTimeout(() => {
        console.log("RESET");
        setState((prev) => ({
          ...prev,
          status: "idle",
          epoch: 0,
        }));
      }, 3000);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return {
    ...state,
    setTrainingProgressAttribute: setState,
    socket: socketRef.current,
  };
}
