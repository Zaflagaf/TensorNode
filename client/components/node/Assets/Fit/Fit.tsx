"use client";

import { useState, useEffect } from "react";
import Node from "../../Node";
import Handle from "@/components/handle/Handle";
import NodeHeader from "../../Layout/Header/NodeHeader";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Play, Check, Loader2, X, BarChart3 } from "lucide-react";
import layers from "@/public/layers.svg";
import { useFlowContext } from "@/context/FlowContext";
import io from "socket.io-client";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";

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
    console.log("✅ Entraînement terminé avec succès :", result);
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
  console.log("epochs: ", values.input.epochs);
  console.log("batchSize: ", values.input.batchSize);
  const [validationSplit, setValidationSplit] = useState<number>(0.2);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [currentEpoch, setCurrentEpoch] = useState<number>(0);
  const [shuffle, setShuffle] = useState<boolean>(true);
  const [buttonStatus, setButtonStatus] = useState<ButtonStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showMetrics, setShowMetrics] = useState<boolean>(false);

  // Animation states
  const [animateProgress, setAnimateProgress] = useState<boolean>(false);
  const [tabChangeAnimation, setTabChangeAnimation] = useState<boolean>(false);
  const [buttonHover, setButtonHover] = useState<boolean>(false);

  const { nodes, updateNode } = useFlowContext();

  const [progress, setProgress] = useState(0); // Progression de l'entraînement
  const [totalEpochs, setTotalEpochs] = useState(10); // Nombre total d'epochs

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
    console.log("progress: ", progress);
    setTotalEpochs(values.input.epochs);
  }, [progress, values.input.epochs]);

  // Handle tab change animation
  const handleTabChange = (value: string) => {
    setTabChangeAnimation(true);
    setTimeout(() => setTabChangeAnimation(false), 300);
    return value;
  };

  const handleFitModel = async () => {
    if (nodes[id]["data"]["values"]["input"]) {
      const modelId = nodes[id]["data"]["values"]["input"]["model"];

      const features = nodes[id]["data"]["values"]["input"]["features"].map(
        (obj: any) => Object.values(obj)
      );
      const labels = nodes[id]["data"]["values"]["input"]["labels"].map(
        (obj: any) => Object.values(obj)
      );

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
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Training...</span>
          </div>
        );
      case "success":
        return (
          <div className="flex items-center justify-center">
            <Check className="mr-2 h-4 w-4 text-green-500" />
            <span>Training Complete</span>
          </div>
        );
      case "error":
        return (
          <div className="flex items-center justify-center">
            <X className="mr-2 h-4 w-4 text-red-500" />
            <span>Training Failed</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center">
            <Play className="mr-2 h-4 w-4" />
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
          <Handle type="target" id="h1" dataId="model">
            Compiled Model
          </Handle>
          <Handle type="target" id="h2" dataId="features">
            Features
          </Handle>
          <Handle type="target" id="h3" dataId="labels">
            Labels
          </Handle>
          <Handle type="source" id="h4" dataId="trained_model">
            Trained Model
          </Handle>
          <Handle type="source" id="h5" dataId="history">
            Training History
          </Handle>
        </div>

        {/* Progress Visualization - Always visible */}
        <div className="px-[20px] py-3 border-b border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm font-medium flex items-center">
              <BarChart3 className="w-4 h-4 mr-1.5 text-gray-500" />
              Training Progress
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setShowMetrics(!showMetrics)}
            >
              {showMetrics ? "Hide Metrics" : "Show Metrics"}
            </Button>
          </div>

          <Progress
            value={progressPercentage}
            className={`h-2 ${isTraining ? "bg-gray-200" : "bg-gray-100"} ${
              animateProgress && isTraining
                ? "transition-all duration-700 ease-in-out"
                : ""
            }`}
          />

          <div className="flex justify-between text-xs text-gray-500 mt-1.5">
            <span
              className={`transition-all duration-300 ${
                isTraining || buttonStatus === "success"
                  ? "opacity-100"
                  : "opacity-50"
              }`}
            >
              {isTraining
                ? `Epoch ${currentEpoch}/${totalEpochs}`
                : buttonStatus === "success"
                ? "Training Complete"
                : buttonStatus === "error"
                ? "Training Failed"
                : "Not Started"}
            </span>
            <span
              className={`font-medium ${
                progressPercentage > 0 ? "opacity-100" : "opacity-50"
              } ${
                progressPercentage === 100 && buttonStatus === "success"
                  ? "text-green-500"
                  : ""
              }`}
            >
              {progressPercentage}%
            </span>
          </div>

          {/* Metrics Display */}
          {showMetrics && (
            <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
              <Card className="p-2 bg-gray-50">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Loss:</span>
                  <span className="font-medium">{metrics.loss.toFixed(4)}</span>
                </div>
              </Card>
              <Card className="p-2 bg-gray-50">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Accuracy:</span>
                  <span className="font-medium">
                    {(metrics.accuracy * 100).toFixed(2)}%
                  </span>
                </div>
              </Card>
              <Card className="p-2 bg-gray-50">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Val Loss:</span>
                  <span className="font-medium">
                    {metrics.val_loss.toFixed(4)}
                  </span>
                </div>
              </Card>
              <Card className="p-2 bg-gray-50">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Val Acc:</span>
                  <span className="font-medium">
                    {(metrics.val_accuracy * 100).toFixed(2)}%
                  </span>
                </div>
              </Card>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && buttonStatus === "error" && (
            <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded text-xs text-red-600">
              {errorMessage}
            </div>
          )}
        </div>

        <div className="px-[20px] py-3">
          <Tabs
            defaultValue="basic"
            className="w-full"
            onValueChange={handleTabChange}
          >
            <TabsList className="grid w-full grid-cols-2 mb-2">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent
              value="basic"
              className={`space-y-4 transition-all duration-300 ${
                tabChangeAnimation
                  ? "opacity-70 scale-95"
                  : "opacity-100 scale-100"
              }`}
            >
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="epochs" className="text-xs font-medium">
                      Epochs
                    </Label>
                    <Input
                      id="epochs"
                      type="number"
                      value={values.input.epochs}
                      onChange={(e) =>
                        updateNode(id, "values.input.epochs", Number.parseInt(e.target.value) || 1)
                      }
                      min={1}
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="batchSize" className="text-xs font-medium">
                      Batch Size
                    </Label>
                    <Input
                      id="batchSize"
                      type="number"
                      value={values.input.batchSize}
                      onChange={(e) =>
                        updateNode(id, "values.input.batchSize", Number.parseInt(e.target.value) || 1)
                      }
                      min={1}
                      className="h-8"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Label
                      htmlFor="validationSplit"
                      className="text-xs font-medium"
                    >
                      Validation Split: {(validationSplit * 100).toFixed(0)}%
                    </Label>
                  </div>
                  <Slider
                    id="validationSplit"
                    value={[validationSplit * 100]}
                    onValueChange={(value) =>
                      setValidationSplit(value[0] / 100)
                    }
                    max={50}
                    step={5}
                    className="py-1"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="shuffle" className="text-xs font-medium">
                    Shuffle Data
                  </Label>
                  <Switch
                    id="shuffle"
                    checked={shuffle}
                    onCheckedChange={setShuffle}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="advanced"
              className={`space-y-3 transition-all duration-300 ${
                tabChangeAnimation
                  ? "opacity-70 scale-95"
                  : "opacity-100 scale-100"
              }`}
            >
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="callbacks" className="text-xs font-medium">
                    Callbacks
                  </Label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center space-x-1">
                      <Switch id="earlyStopping" />
                      <Label htmlFor="earlyStopping">Early Stopping</Label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Switch id="modelCheckpoint" />
                      <Label htmlFor="modelCheckpoint">Checkpoint</Label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Switch id="reduceLR" />
                      <Label htmlFor="reduceLR">Reduce LR</Label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Switch id="tensorboard" />
                      <Label htmlFor="tensorboard">TensorBoard</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="verbosity" className="text-xs font-medium">
                    Verbosity
                  </Label>
                  <Select defaultValue="1">
                    <SelectTrigger id="verbosity" className="h-8">
                      <SelectValue placeholder="Select verbosity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="0">0 (Silent)</SelectItem>
                        <SelectItem value="1">1 (Progress Bar)</SelectItem>
                        <SelectItem value="2">
                          2 (One Line Per Epoch)
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="useMultiprocessing"
                    className="text-xs font-medium"
                  >
                    Use Multiprocessing
                  </Label>
                  <Switch id="useMultiprocessing" />
                </div>
              </div>
            </TabsContent>
          </Tabs>
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
                style={{ width: `${(currentEpoch / values.input.epochs) * 100}%` }}
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

        <div className="pt-2 px-[20px] pb-4 flex gap-2 w-full">
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

        {/* Footer */}
        <div className="h-[1px] bg-gray-100" />
      </div>
    </Node>
  );
}

export default FitNodeComponent;
