import { useEffect, useState } from "react";
import { IoSettingsSharp } from "react-icons/io5";
import { Check, Loader2, X } from "lucide-react";
import Node from "../../Node";
import Handle from "@/components/handle/Handle";
import NodeHeader from "../../Layout/Header/NodeHeader";
import { Separator } from "@radix-ui/react-separator";
import layers from "@/public/layers.svg";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

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
    console.log("Modèle créé avec succès:", data);
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
    console.log("Architecture du modèle:", modelArchitecture);
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
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Building Model...</span>
          </div>
        );
      case "success":
        return (
          <div className="flex items-center justify-center">
            <Check className="mr-2 h-4 w-4" />
            <span>Model Built</span>
          </div>
        );
      case "error":
        return (
          <div className="flex items-center justify-center">
            <X className="mr-2 h-4 w-4" />
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
          style={{ display: "flex", flexDirection: "column", gap: "5px" }}
        >
          <div className="px-[20px]">
            Settings <IoSettingsSharp width={"24"} height={"24"} />
          </div>
          <Handle type="source" id="h1" dataId="model">
            Model
          </Handle>
          <Handle type="target" id="h2" dataId="layer">
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
        <Separator className="my-4 bg-gray-300 h-[2px]" />
        <div className="px-[20px]">
          <div className="rounded-2xl border border-gray-200 shadow-sm overflow-hidden mt-6 w-[400px]">
            <div className="relative max-h-[300px] overflow-y-auto pr-2">
              <Table className="min-w-full bg-white">
                <TableCaption className="text-muted-foreground p-4 text-sm">
                  Architecture du modèle TensorFlow
                </TableCaption>
                <TableHeader className="bg-gray-100">
                  <TableRow>
                    <TableHead className="text-gray-600 text-left text-sm">
                      Layer
                    </TableHead>
                    <TableHead className="text-gray-600 text-left text-sm">
                      Output Shape
                    </TableHead>
                    <TableHead className="text-gray-600 text-left text-sm">
                      Paramètres
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {architecture &&
                    architecture.map((layer: any, index: any) => (
                      <TableRow
                        key={index}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <TableCell className="font-medium text-sm">
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