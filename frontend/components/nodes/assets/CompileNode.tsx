"use client";

import { Button } from "@/frontend/components/ui/button";
import { useGlue } from "@/frontend/hooks/useNodeWatch";
import { Check, Loader2, X } from "lucide-react";
import { useState } from "react";

// (import) parts
import WorkflowHandle from "@/frontend/organism/Handle";
import WorkflowNode from "@/frontend/organism/Node";

import { NodeType } from "@/frontend/schemas/node";
import { useNodesStore } from "@/frontend/store/nodesStore";

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

    const response = await fetch("http://localhost:8000/api/compile_model", {
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
    //////////("Modèle compilé avec succès :", result);
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

const CompileNodeComponent = ({ node }: { node: NodeType }) => {

  const [buttonStatus, setButtonStatus] = useState<ButtonStatus>("idle");

  // Button content based on status
  const renderButtonContent = () => {
    switch (buttonStatus) {
      case "loading":
        return (
          <div className="flex items-center justify-center">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            <span>Compiling...</span>
          </div>
        );
      case "success":
        return (
          <div className="flex items-center justify-center">
            <Check className="w-4 h-4 mr-2 text-green-500" />
            <span>Compiled Successfully</span>
          </div>
        );
      case "error":
        return (
          <div className="flex items-center justify-center">
            <X className="w-4 h-4 mr-2 text-red-500" />
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

  const setNodeOutput = useNodesStore((state) => state.actions.setNodeOutput)
  return (
    <WorkflowNode node={node}>
      <div className="w-[320px]">
        <div className="flex flex-col gap-4 text-sm">
          <WorkflowHandle
            type="source"
            id="compile-h1"
            port="model"
            node={node}
          >
            Compiled Model
          </WorkflowHandle>
          <WorkflowHandle
            type="target"
            id="compile-h2"
            port="model"
            node={node}
          >
            Model
          </WorkflowHandle>
        </div>

        <div className="pt-2 px-[20px] pb-4">
          <Button
            className={`w-full transition-all duration-300 ${getButtonVariant()} hover:scale-[1.02] undraggable`}
            disabled={buttonStatus === "loading"}
            onClick={() => {
              const modelId = node.content.ports.inputs.model;
              setNodeOutput(node.id, "model", node.content.ports.inputs.model)
              
              if (!modelId) return;
              compileModel(
                modelId,
                node.content.ports.inputs.optimizer ?? "adam",
                node.content.ports.inputs.loss ??
                  "sparse_categorical_crossentropy",
                [node.content.ports.inputs.metrics ?? "accuracy"],
                setButtonStatus
              );
            }}
          >
            {renderButtonContent()}
          </Button>
        </div>

        {/* Footer */}
        <div className="h-[1px] bg-gray-100" />
      </div>
    </WorkflowNode>
  );
};

export default CompileNodeComponent;
