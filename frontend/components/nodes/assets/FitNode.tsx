"use client";

// (import) bilbiotheques externes
import io from "socket.io-client";

// (import) ui

// (import) icons

// (import) hooks
import { useEffect, useState } from "react";

// (import) parts
import WorkflowHandle from "@/frontend/organism/handle/Handle";
import WorkflowNode from "@/frontend/organism/node/Node";
import { useNodesStore } from "@/frontend/organism/node/store/nodesStore";

import { Node, ButtonStatus } from "@/frontend/types";

import { fitModel } from "@/frontend/services/api";
import WorkflowBody from "../layouts/Body";
import WorkflowButton from "../layouts/Button";
import WorkflowDefault from "../layouts/Default";
import WorkflowFooter from "../layouts/Footer";
import WorkflowHead from "../layouts/Header";
import WorkflowNumber from "../layouts/Number";

const FitNodeComponent = ({ node }: { node: Node }) => {
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [currentEpoch, setCurrentEpoch] = useState<number>(0);
  const [buttonStatus, setButtonStatus] = useState<ButtonStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const setNodeOutput = useNodesStore((state) => state.actions.setNodeOutput);
  const setNodeInput = useNodesStore((state) => state.actions.setNodeInput);

  // Animation states
  const [animateProgress, setAnimateProgress] = useState<boolean>(false);

  const [progress, setProgress] = useState(0); // Progression de l'entraînement
  const [totalEpochs, setTotalEpochs] = useState(0);

  // Training metrics
  const [metrics, setMetrics] = useState({
    loss: 0,
    accuracy: 0,
    val_loss: 0,
    val_accuracy: 0,
  });

  useEffect(() => {
    // Connexion au serveur Flask via Socket.IO
    const socket = io("http://127.0.0.1:8000");
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
    setTotalEpochs(node.content.ports.inputs["in-epochs"].value);
  }, [progress, node.content.ports.inputs["in-epochs"]]);

  const handleFitModel = async () => {
    const modelId = node.content.ports.inputs.model;
    const features = node.content.ports.inputs.features;
    const labels = node.content.ports.inputs.labels;

    setNodeOutput(node.id, "model", modelId);
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

  // Progress percentage calculation
  const progressPercentage = isTraining
    ? Math.round((currentEpoch / totalEpochs) * 100)
    : buttonStatus === "success"
    ? 100
    : 0;

  return (
    <WorkflowNode node={node}>
      <div className="w-[250px]">
        <WorkflowHead label={"Fit"} className={"bg-20"} />
        <WorkflowBody>
          <WorkflowHandle type="source" handleId="h4" port="model" node={node}>
            <WorkflowDefault label="Trained Model" />
          </WorkflowHandle>
          <WorkflowHandle
            type="source"
            handleId="h5"
            port="history"
            node={node}
          >
            <WorkflowDefault label="Training History" />
          </WorkflowHandle>
          <WorkflowHandle type="target" handleId="h1" port="model" node={node}>
            <WorkflowDefault label="Compiled Model" />
          </WorkflowHandle>
          <WorkflowHandle
            type="target"
            handleId="h2"
            port="features"
            node={node}
          >
            <WorkflowDefault label="Features" />
          </WorkflowHandle>
          <WorkflowHandle type="target" handleId="h3" port="labels" node={node}>
            <WorkflowDefault label="Labels" />
          </WorkflowHandle>

          <WorkflowNumber
            label="Epochs"
            number={node.content.ports.inputs.epochs}
            setNumber={(value: number) =>
              setNodeInput(node.id, "epochs", value)
            }
          />
          <WorkflowNumber
            label="Batch Size"
            number={node.content.ports.inputs.batchSize}
            setNumber={(value: number) =>
              setNodeInput(node.id, "batchSize", value)
            }
          />
          <WorkflowButton
            label="Fit"
            status={buttonStatus}
            onClick={handleFitModel}
          />
        </WorkflowBody>
        <WorkflowFooter />
      </div>
    </WorkflowNode>
  );
};

export default FitNodeComponent;
