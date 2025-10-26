import { DownloadModel } from "@/frontend/services/api";
import { ModelLayer } from "@/frontend/types";
import { Download } from "lucide-react";
import { AccordionContent } from "../../../shadcn/accordion";
import { Button } from "../../../shadcn/button";

export default function DownloadSection({ layer }: { layer: ModelLayer }) {
  // layer.model = model id

  const handleDownload = async (modelId: string | null, type: string) => {
    if (!modelId) {
      console.error("No model ID specified");
      return;
    }

    DownloadModel(modelId, layer.name, type);
  };

  return (
    <AccordionContent className="flex flex-col gap-1">
      <Button
        className="bg-input/30 hover:bg-input/50 text-foreground cursor-pointer text-xs"
        onClick={() => handleDownload(layer.model, "download-blank-model")}
      >
        <Download />
        <span>Blank model</span>
      </Button>
      <Button
        className="bg-input/30 hover:bg-input/50 text-foreground cursor-pointer text-xs"
        onClick={() => handleDownload(layer.model, "download-trained-model")}
      >
        <Download />
        <span>Trained model</span>
      </Button>
    </AccordionContent>
  );
}
