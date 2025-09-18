import { Button } from "@/frontend/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/frontend/components/ui/table";
import Handle from "@/frontend/organism/Handle";
import layers from "@/public/svg/layers.svg";
import { Check, Loader2, X } from "lucide-react";
import { useState } from "react";
import { IoSettingsSharp } from "react-icons/io5";
import Node from "../../../../../organism/Node";
import NodeHeader from "../../Layout/Header/NodeHeader";

// Status types for button state
type ButtonStatus = "idle" | "loading" | "success" | "error";

const createModel = async (
  id: string,
  setStatus: (status: ButtonStatus) => void
) => {
  try {
    const response = await fetch("http://localhost:5000/api/build_model", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: id }),
    });

    if (!response.ok) {
      throw new Error("Failed to create model");
    }

    const data = await response.json();
    //////////("Modèle créé avec succès:", data);
    return true;
  } catch (error) {
    console.error("Erreur lors de la création du modèle:", error);
    setStatus("error");
    return false;
  }
};

const getModelArchitecture = async (
  modelId: string,
  setStatus: (status: ButtonStatus) => void
) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/get_model_architecture/${modelId}`
    );
    if (!response.ok) {
      throw new Error("Modèle introuvable");
    }
    const modelArchitecture = await response.json();
    //////////("Architecture du modèle:", modelArchitecture);
    setStatus("success");

    // Reset status after 3 seconds
    setTimeout(() => {
      setStatus("idle");
    }, 3000);

    return modelArchitecture;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'architecture:", error);
    setStatus("error");

    // Reset status after 3 seconds
    setTimeout(() => {
      setStatus("idle");
    }, 3000);

    return [];
  }
};

export function ModelNodeComponent({
  id,
  position,
  label,
}: {
  id: string;
  position: { x: number; y: number };
  label: string;
}) {
  const [architecture, setArchitecture] = useState<any>(null);
  const [buttonStatus, setButtonStatus] = useState<ButtonStatus>("idle");

  const handleClick = async () => {
    setButtonStatus("loading");

    try {
      await createModel(id, setButtonStatus);
      const modelArch = await getModelArchitecture(id, setButtonStatus);
      setArchitecture(modelArch);
    } catch (error) {
      console.error("Error in handleClick:", error);
      setButtonStatus("error");

      // Reset status after 3 seconds
      setTimeout(() => {
        setButtonStatus("idle");
      }, 3000);
    }
  };

  // Button content based on status
  const renderButtonContent = () => {
    switch (buttonStatus) {
      case "loading":
        return (
          <div className="flex items-center justify-center">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            <span>Building Model...</span>
          </div>
        );
      case "success":
        return (
          <div className="flex items-center justify-center">
            <Check className="w-4 h-4 mr-2" />
            <span>Model Built</span>
          </div>
        );
      case "error":
        return (
          <div className="flex items-center justify-center">
            <X className="w-4 h-4 mr-2" />
            <span>Build Failed</span>
          </div>
        );
      default:
        return "Build Model";
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
      <div className="dense" id={id}>
        <NodeHeader label={label} id={id} logo={layers} />
        <div
          className="dense-body"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "5px",
          }}
        >
          <div className="px-[20px]">
            Settings <IoSettingsSharp width={"24"} height={"24"} />
          </div>
          <Handle type="source" id="model-h1" dataId="model">
            Model
          </Handle>
          <Handle type="target" id="model-h2" dataId="layer">
            Layer
          </Handle>
          <div className="px-[20px] py-[10px] w-full flex">
            <Button
              className={`w-full transition-colors duration-300 ${getButtonVariant()}`}
              disabled={buttonStatus === "loading"}
              onClick={handleClick}
            >
              {renderButtonContent()}
            </Button>
          </div>
        </div>
        <div className="px-[20px]">
          <div className="rounded-2xl border border-gray-200 shadow-sm overflow-hidden mt-6 w-[400px]">
            <div className="relative max-h-[300px] overflow-y-auto pr-2">
              <Table className="min-w-full bg-white">
                <TableCaption className="p-4 text-sm text-muted-foreground">
                  Architecture du modèle TensorFlow
                </TableCaption>
                <TableHeader className="bg-gray-100">
                  <TableRow>
                    <TableHead className="text-sm text-left text-gray-600">
                      Layer
                    </TableHead>
                    <TableHead className="text-sm text-left text-gray-600">
                      Output Shape
                    </TableHead>
                    <TableHead className="text-sm text-left text-gray-600">
                      Paramètres
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {architecture &&
                    architecture.map((layer: any, index: any) => (
                      <TableRow
                        key={index}
                        className="transition-colors duration-150 hover:bg-gray-50"
                      >
                        <TableCell className="text-sm font-medium">
                          {layer.layer}
                        </TableCell>
                        <TableCell className="text-sm text-gray-700">
                          {layer.output}
                        </TableCell>
                        <TableCell className="text-sm text-gray-700">
                          {layer.params.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
        <div
          className="dense-footer"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 20px",
          }}
        />
      </div>
    </Node>
  );
}

export default ModelNodeComponent;
