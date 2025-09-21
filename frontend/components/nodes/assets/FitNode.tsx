"use client";

// (import) bilbiotheques externes
import io from "socket.io-client";

// (import) ui
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import NodeHeader from "../../layout/Header/NodeHeader";



// (import) icons
import layers from "@/public/svg/layers.svg";
import { Check, Download, Loader2, Play, X } from "lucide-react";

// (import) hooks
import { useEffect, useState } from "react";

// (import) parts
import WorkflowHandle from "@/frontend/organism/Handle";
import WorkflowNode from "@/frontend/organism/Node";
import { NodeType } from "@/frontend/schemas/node";
import { useNodesStore } from "@/frontend/store/nodesStore";
import { addPopUp } from "../../dev/Popup";

import { ButtonStatus } from "@/frontend/schemas/types/general";
 
import { fitModel } from "@/frontend/services/api";

const FitNodeComponent = ({ node }: { node: NodeType }) => {
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [currentEpoch, setCurrentEpoch] = useState<number>(0);
  const [buttonStatus, setButtonStatus] = useState<ButtonStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const setNodeOutput = useNodesStore((state) => state.actions.setNodeOutput);
  const setNodeInput = useNodesStore((state) => state.actions.setNodeInput);

  // Animation states
  const [animateProgress, setAnimateProgress] = useState<boolean>(false);
  const [buttonHover, setButtonHover] = useState<boolean>(false);

  const [progress, setProgress] = useState(0); // Progression de l'entraînement
  const [totalEpochs, setTotalEpochs] = useState(0);

  useEffect(() => {
    setNodeOutput(node.id, "model", node.content.ports.inputs.model);
  }, [node.content.ports.inputs.model]);

  // Training metrics
  const [metrics, setMetrics] = useState({
    loss: 0,
    accuracy: 0,
    val_loss: 0,
    val_accuracy: 0,
  });

  useEffect(() => {
    // Connexion au serveur Flask via Socket.IO
    const socket = io("http://localhost:8000");
    // Écouter l'événement 'progress' envoyé par le serveur
    socket.on("progress", (data) => {
      addPopUp({
        header: "EPOCH",
        body: data.epoch,
        statut: "default",
      });
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

    // Fermer la connexion WebSocket lors du démontage du composant
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    setTotalEpochs(node.content.ports.inputs.epochs);
  }, [progress, node.content.ports.inputs.epochs]);

  const handleFitModel = async () => {
    const modelId = node.content.ports.inputs.model;

    setNodeOutput(node.id, "model", modelId)
    const features = node.content.ports.inputs.features.map((obj: any) =>
      Object.values(obj)
    );
    const labels = node.content.ports.inputs.labels.map((obj: any) =>
      Object.values(obj)
    );

    setIsTraining(true);
    setProgress(0);
    setCurrentEpoch(0);
    setButtonStatus("loading");
    await fitModel(
      modelId,
      features,
      labels,
      node.content.ports.inputs.epochs,
      node.content.ports.inputs.batchSize,
      setButtonStatus,
      setErrorMessage
    );
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
    <WorkflowNode node={node}>
      <div className="rounded-2xl shadow-md bg-white min-w-[400px]">
        <NodeHeader label={node.content.name} logo={layers} />

        <div className="flex flex-col gap-4 text-sm">
          <WorkflowHandle type="target" id="h1" port="model" node={node}>
            Compiled Model
          </WorkflowHandle>
          <WorkflowHandle type="target" id="h2" port="features" node={node}>
            Features
          </WorkflowHandle>
          <WorkflowHandle type="target" id="h3" port="labels" node={node}>
            Labels
          </WorkflowHandle>
          <WorkflowHandle type="source" id="h4" port="model" node={node}>
            Trained Model
          </WorkflowHandle>
          <WorkflowHandle type="source" id="h5" port="history" node={node}>
            Training History
          </WorkflowHandle>
        </div>

        <div className="relative mx-5 my-5 undraggable">
          <span className="absolute text-sm -translate-y-1/2 left-3 top-1/2">
            Epochs:
          </span>
          <Input
            type="number"
            className="text-right"
            onChange={(e) => {
              setNodeInput(node.id, "epochs", Number(e.target.value));
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
              setNodeInput(node.id, "batchSize", Number(e.target.value));
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
                  width: `${
                    (currentEpoch / node.content.ports.inputs.epochs) * 100
                  }%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span className="transition-all duration-300">
                Epoch {currentEpoch}/{node.content.ports.inputs.epochs}
              </span>
              <span className="transition-all duration-300">
                {Math.round(
                  (currentEpoch / node.content.ports.inputs.epochs) * 100
                )}
                %
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
              href={`http://localhost:8000/download?model_id=${encodeURIComponent(
                node.content.ports.inputs.model
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
    </WorkflowNode>
  );
};

export default FitNodeComponent;
