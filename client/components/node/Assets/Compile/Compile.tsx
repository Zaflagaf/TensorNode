"use client";

import { useState, useEffect } from "react";
import { Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useFlowContext } from "@/context/FlowContext";
import Node from "../../Node";
import Handle from "@/components/handle/Handle";
import NodeHeader from "../../Layout/Header/NodeHeader";
import layers from "@/public/layers.svg";
import "./compile.scss";

// Status types for button state
type ButtonStatus = "idle" | "loading" | "success" | "error";

// Fonction de compilation du modèle
const compileModel = async (
  modelId: string,
  optimizer: string,
  loss: string,
  metrics: string[],
  setStatus: (status: ButtonStatus) => void
) => {
  try {
    setStatus("loading");

    const response = await fetch("http://localhost:5000/api/compile_model", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: modelId,
        optimizer,
        loss,
        metrics,
      }),
    });

    if (!response.ok) {
      throw new Error("Modèle introuvable ou erreur lors de la compilation");
    }

    const result = await response.json();
    console.log("Modèle compilé avec succès :", result);
    setStatus("success");

    // Reset status after 3 seconds
    setTimeout(() => {
      setStatus("idle");
    }, 3000);
  } catch (error) {
    console.error("Erreur lors de la compilation du modèle", error);
    setStatus("error");

    // Reset status after 3 seconds
    setTimeout(() => {
      setStatus("idle");
    }, 3000);
  }
};

export function CompileNodeComponent({
  id,
  position,
  label,
}: {
  id: string;
  position: { x: number; y: number };
  label: string;
}) {
  const { nodes, updateNode, setNodes } = useFlowContext();
  const [optimizer, setOptimizer] = useState("adam"); // Valeur par défaut
  const [loss, setLoss] = useState("mse"); // Valeur par défaut
  const [metrics, setMetrics] = useState<string[]>(["accuracy"]); // Valeur par défaut
  const [buttonStatus, setButtonStatus] = useState<ButtonStatus>("idle");
  const [tabChangeAnimation, setTabChangeAnimation] = useState<boolean>(false);
  const [learningRate, setLearningRate] = useState<string>("0.001");
  const [useCustomLR, setUseCustomLR] = useState<boolean>(false);

  // Animation states
  const [buttonHover, setButtonHover] = useState<boolean>(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentModel = nodes[id]?.data?.values?.input?.model;
      const outputModel = nodes[id]?.data?.values?.output?.model;

      if (currentModel !== outputModel) {
        updateNode(id, "values.output.model", currentModel);
      }
    }, 1000); // 1000 ms = 1 secondes

    return () => clearInterval(interval);
  }, [nodes[id]?.data?.values?.input?.model, id, updateNode]);

  // Handle tab change animation
  const handleTabChange = (value: string) => {
    setTabChangeAnimation(true);
    setTimeout(() => setTabChangeAnimation(false), 300);
    return value;
  };

  // Toggle metrics selection
  const toggleMetric = (metric: string) => {
    setMetrics((prev) => {
      if (prev.includes(metric)) {
        return prev.filter((m) => m !== metric);
      } else {
        return [...prev, metric];
      }
    });
  };

  // Button content based on status
  const renderButtonContent = () => {
    switch (buttonStatus) {
      case "loading":
        return (
          <div className="flex items-center justify-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Compiling...</span>
          </div>
        );
      case "success":
        return (
          <div className="flex items-center justify-center">
            <Check className="mr-2 h-4 w-4 text-green-500" />
            <span>Compiled Successfully</span>
          </div>
        );
      case "error":
        return (
          <div className="flex items-center justify-center">
            <X className="mr-2 h-4 w-4 text-red-500" />
            <span>Compilation Failed</span>
          </div>
        );
      default:
        return "Compile Model";
    }
  };

  // Button color based on status
  const getButtonVariant = () => {
    switch (buttonStatus) {
      case "success":
        return "bg-green-500 hover:bg-green-600 text-white";
      case "error":
        return "bg-red-500 hover:bg-red-600 text-white";
      default:
        return "";
    }
  };

  return (
    <Node id={id} defaultPosition={position}>
      <div className="rounded-2xl shadow-md bg-white w-[320px]" id={id}>
        <NodeHeader label={label} id={id} logo={layers} />

        {/* Handles */}
        <div className="flex flex-col gap-4 text-sm">
          <Handle type="source" id="h1" dataId="model">
            Compiled Model
          </Handle>
          <Handle type="target" id="h2" dataId="model">
            Model
          </Handle>
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
                {/* Optimizer */}
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">Optimizer</span>
                  <Select value={optimizer} onValueChange={setOptimizer}>
                    <SelectTrigger className="w-[180px] h-8 text-sm">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Optimizer</SelectLabel>
                        {["adam", "sgd", "rmsprop", "adagrad", "adamax"].map(
                          (opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          )
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {/* Loss */}
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">Loss</span>
                  <Select value={loss} onValueChange={setLoss}>
                    <SelectTrigger className="w-[180px] h-8 text-sm">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Loss</SelectLabel>
                        {[
                          "mse",
                          "categorical_crossentropy",
                          "binary_crossentropy",
                          "mae",
                          "sparse_categorical_crossentropy",
                        ].map((lossType) => (
                          <SelectItem key={lossType} value={lossType}>
                            {lossType}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {/* Metrics */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Metrics</Label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="accuracy"
                        checked={metrics.includes("accuracy")}
                        onCheckedChange={() => toggleMetric("accuracy")}
                      />
                      <Label htmlFor="accuracy">Accuracy</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="mae"
                        checked={metrics.includes("mae")}
                        onCheckedChange={() => toggleMetric("mae")}
                      />
                      <Label htmlFor="mae">MAE</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="mse"
                        checked={metrics.includes("mse")}
                        onCheckedChange={() => toggleMetric("mse")}
                      />
                      <Label htmlFor="mse">MSE</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="precision"
                        checked={metrics.includes("precision")}
                        onCheckedChange={() => toggleMetric("precision")}
                      />
                      <Label htmlFor="precision">Precision</Label>
                    </div>
                  </div>
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
                {/* Custom Learning Rate */}
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">
                    Custom Learning Rate
                  </span>
                  <Switch
                    id="customLR"
                    checked={useCustomLR}
                    onCheckedChange={setUseCustomLR}
                  />
                </div>

                {useCustomLR && (
                  <div className="flex items-center justify-between space-x-2 animate-in slide-in-from-top duration-300">
                    <Label htmlFor="learningRate" className="text-sm">
                      Learning Rate
                    </Label>
                    <Select
                      value={learningRate}
                      onValueChange={setLearningRate}
                    >
                      <SelectTrigger className="w-[120px] h-8 text-sm">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="0.1">0.1</SelectItem>
                          <SelectItem value="0.01">0.01</SelectItem>
                          <SelectItem value="0.001">0.001</SelectItem>
                          <SelectItem value="0.0001">0.0001</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Additional Advanced Options */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Advanced Options
                  </Label>
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="clipNorm">Gradient Clipping</Label>
                      <Switch id="clipNorm" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="ema">Exponential Moving Average</Label>
                      <Switch id="ema" />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Selected Metrics Summary */}
        <div className="px-[20px] pb-2">
          <div className="flex flex-wrap gap-1 text-xs">
            <span className="font-medium">Selected metrics:</span>
            {metrics.map((metric) => (
              <span
                key={metric}
                className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded transition-all duration-300"
              >
                {metric}
              </span>
            ))}
          </div>
        </div>

        {/* Compile Button */}
        <div className="pt-2 px-[20px] pb-4">
          <Button
            className={`w-full transition-all duration-300 ${getButtonVariant()} hover:scale-[1.02]`}
            disabled={buttonStatus === "loading"}
            onMouseEnter={() => setButtonHover(true)}
            onMouseLeave={() => setButtonHover(false)}
            onClick={() => {
              if (!nodes[id]?.["data"]?.["values"]?.["input"]) return;
              const modelId = nodes[id]["data"]["values"]["input"]["model"];
              if (!modelId) return;
              compileModel(modelId, optimizer, loss, metrics, setButtonStatus);
            }}
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

export default CompileNodeComponent;
