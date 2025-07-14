"use client";

import Handle from "@/components/shared/handle/Handle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFlowContext } from "@/context/FlowContext";
import layers from "@/public/layers.svg";
import { Check, Download, Loader2, Play, X } from "lucide-react";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import NodeHeader from "../../Layout/Header/NodeHeader";
import Node from "../../Node";

type ButtonStatus = "idle" | "loading" | "success" | "error";

const fitModel = async (
  modelId: string,
  features: any,
  labels: any,
  epochs: number,
  batch_size: number,
  setStatus: (status: ButtonStatus) => void,
  setErrorMessage: (msg: string) => void
) => {
  try {
    setStatus("loading");
    setErrorMessage("");

    const response = await fetch("http://localhost:5000/api/train_model", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: modelId,
        features,
        labels,
        epochs,
        batch_size,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || "Erreur inconnue pendant l'entraînement"
      );
    }

    const result = await response.json();
    //////////("✅ Entraînement terminé avec succès :", result);
    setStatus("success");

    setTimeout(() => {
      setStatus("idle");
    }, 3000);
  } catch (error: any) {
    const message = error.message || "Une erreur inattendue est survenue.";
    console.error("❌ Échec de l'entraînement du modèle :", message);
    setStatus("error");
    setErrorMessage(message);

    setTimeout(() => {
      setStatus("idle");
    }, 3000);
  }
};

export function FitNodeComponent({
  id,
  position,
  label,
  values,
}: {
  id: string;
  position: { x: number; y: number };
  label: string;
  values: any;
}) {
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [currentEpoch, setCurrentEpoch] = useState<number>(0);
  const [buttonStatus, setButtonStatus] = useState<ButtonStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Animation states
  const [animateProgress, setAnimateProgress] = useState<boolean>(false);
  const [buttonHover, setButtonHover] = useState<boolean>(false);

  const { nodes, updateNode } = useFlowContext();

  const [progress, setProgress] = useState(0); // Progression de l'entraînement
  const [totalEpochs, setTotalEpochs] = useState(values.input.epochs); // Nombre total d'epochs

  useEffect(() => {
    const interval = setInterval(() => {
      const currentModel = nodes[id]?.data?.values?.input?.model;
      const outputModel = nodes[id]?.data?.values?.output?.model;

      if (currentModel !== outputModel) {
        updateNode(id, "values.output.model", currentModel);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nodes[id]?.data?.values?.input?.model, id, updateNode]);

  // Training metrics
  const [metrics, setMetrics] = useState({
    loss: 0,
    accuracy: 0,
    val_loss: 0,
    val_accuracy: 0,
  });

  useEffect(() => {
    // Connexion au serveur Flask via Socket.IO
    const socket = io("http://localhost:5000");

    // Écouter l'événement 'progress' envoyé par le serveur
    socket.on("progress", (data) => {
      setProgress(data.epoch); // Mettre à jour la progression de l'entraînement
      setCurrentEpoch(data.epoch);
      setIsTraining(true);

      // Update metrics if available
      if (data.metrics) {
        setMetrics({
          loss: data.metrics.loss || 0,
          accuracy: data.metrics.accuracy || 0,
          val_loss: data.metrics.val_loss || 0,
          val_accuracy: data.metrics.val_accuracy || 0,
        });
      }
    });

    /*
    socket.on("training_complete", () => {
      setIsTraining(false);
      setButtonStatus("success");

      setTimeout(() => {
        setButtonStatus("idle");
      }, 3000);
    });

    socket.on("training_error", (data) => {
      setIsTraining(false);
      setButtonStatus("error");
      setErrorMessage(data.error || "Training failed");

      setTimeout(() => {
        setButtonStatus("idle");
      }, 3000);
    });
    */
    // Fermer la connexion WebSocket lors du démontage du composant
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    setTotalEpochs(values.input.epochs);
  }, [progress, values.input.epochs]);

  const handleFitModel = async () => {
    if (nodes[id]["data"]["values"]["input"]) {
      const modelId = nodes[id]["data"]["values"]["input"]["model"];

      const features = nodes[id]["data"]["values"]["input"]["features"].map(
        (obj: any) => Object.values(obj)
      );
      const labels = nodes[id]["data"]["values"]["input"]["labels"].map(
        (obj: any) => Object.values(obj)
      );
      //////////("LABels: : ", labels);

      setIsTraining(true);
      setProgress(0);
      setCurrentEpoch(0);
      setButtonStatus("loading");

      await fitModel(
        modelId,
        features,
        labels,
        values.input.epochs,
        values.input.batchSize,
        setButtonStatus,
        setErrorMessage
      );

      // The status updates are handled inside the fitModel function
    }
  };

  // Add a pulsing animation when training is active
  useEffect(() => {
    if (isTraining) {
      const pulseInterval = setInterval(() => {
        setAnimateProgress((prev) => !prev);
      }, 1500);

      return () => clearInterval(pulseInterval);
    }
  }, [isTraining]);

  // Button content based on status
  const renderButtonContent = () => {
    switch (buttonStatus) {
      case "loading":
        return (
          <div className="flex items-center justify-center">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            <span>Training...</span>
          </div>
        );
      case "success":
        return (
          <div className="flex items-center justify-center">
            <Check className="w-4 h-4 mr-2 text-green-500" />
            <span>Training Complete</span>
          </div>
        );
      case "error":
        return (
          <div className="flex items-center justify-center">
            <X className="w-4 h-4 mr-2 text-red-500" />
            <span>Training Failed</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center">
            <Play className="w-4 h-4 mr-2" />
            <span>Fit Model</span>
          </div>
        );
    }
  };

  // Button color based on status
  const getButtonVariant = () => {
    switch (buttonStatus) {
      case "success":
        return "bg-green-500 hover:bg-green-600 text-white";
      case "error":
        return "bg-red-500 hover:bg-red-600 text-white";
      case "loading":
        return "bg-blue-500 hover:bg-blue-600 text-white";
      default:
        return "";
    }
  };

  // Progress percentage calculation
  const progressPercentage = isTraining
    ? Math.round((currentEpoch / totalEpochs) * 100)
    : buttonStatus === "success"
    ? 100
    : 0;

  return (
    <Node id={id} defaultPosition={position}>
      <div className="rounded-2xl shadow-md bg-white min-w-[400px]" id={id}>
        <NodeHeader label={label} id={id} logo={layers} />

        <div className="flex flex-col gap-4 text-sm">
          <Handle type="target" id="fit-h1" dataId="model">
            Compiled Model
          </Handle>
          <Handle type="target" id="fit-h2" dataId="features">
            Features
          </Handle>
          <Handle type="target" id="fit-h3" dataId="labels">
            Labels
          </Handle>
          <Handle type="source" id="fit-h4" dataId="model">
            Trained Model
          </Handle>
          <Handle type="source" id="fit-h5" dataId="history">
            Training History
          </Handle>
        </div>

        <div className="relative mx-5 my-5 undraggable">
          <span className="absolute text-sm -translate-y-1/2 left-3 top-1/2">
            Epochs:
          </span>
          <Input
            type="number"
            className="text-right"
            onChange={(e) => {
              const value = Number(e.target.value);
              updateNode(id, "values.input.epochs", value);
            }}
          />
        </div>

        <div className="relative mx-5 my-5 undraggable">
          <span className="absolute text-sm -translate-y-1/2 left-3 top-1/2">
            Batch Size:
          </span>
          <Input
            type="number"
            className="text-right"
            onChange={(e) => {
              const value = Number(e.target.value);
              updateNode(id, "values.input.batchSize", value);
            }}
          />
        </div>

        {isTraining && (
          <div className="px-[20px] pb-2">
            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1 overflow-hidden">
              <div
                className={`bg-blue-500 h-1.5 rounded-full ${
                  animateProgress
                    ? "transition-all duration-500 ease-in-out"
                    : ""
                }`}
                style={{
                  width: `${(currentEpoch / values.input.epochs) * 100}%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span className="transition-all duration-300">
                Epoch {currentEpoch}/{values.input.epochs}
              </span>
              <span className="transition-all duration-300">
                {Math.round((currentEpoch / values.input.epochs) * 100)}%
              </span>
            </div>
          </div>
        )}

        <div className="flex px-[20px] pt-2 pb-4 gap-2">
          <div className="flex w-full gap-2">
            <Button
              className={`w-full transition-all duration-300 ${getButtonVariant()} hover:scale-[1.02]`}
              disabled={buttonStatus === "loading"}
              onMouseEnter={() => setButtonHover(true)}
              onMouseLeave={() => setButtonHover(false)}
              onClick={handleFitModel}
            >
              {renderButtonContent()}
            </Button>
          </div>

          <div className="flex gap-2 w-fit">
            <a
              href={`http://localhost:5000/download?model_id=${encodeURIComponent(
                values.input.model
              )}`}
              download
            >
              <Button className="w-10 hover:cursor-pointer" variant="outline">
                <Download />
              </Button>
            </a>
          </div>
          {/* Footer */}
          <div className="h-[1px] bg-gray-100" />
        </div>
      </div>
    </Node>
  );
}

export default FitNodeComponent;
