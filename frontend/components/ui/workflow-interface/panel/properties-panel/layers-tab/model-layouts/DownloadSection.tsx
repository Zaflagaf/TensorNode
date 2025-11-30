import { CollapsibleContent } from "@/frontend/components/ui/shadcn/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from "@/frontend/components/ui/shadcn/sidebar";
import { downloadModel } from "@/frontend/lib/fetch/api";
import { ModelLayer } from "@/frontend/types";
import ButtonProperties from "../../layouts/Button";

export default function DownloadSection({ layer }: { layer: ModelLayer }) {
  // layer.model = model id

  const handleDownload = async (modelId: string, type: string) => {
    downloadModel(modelId, layer.name, type);
  };

  return (
    <CollapsibleContent className="flex flex-col gap-1">
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <ButtonProperties
                label="Blank model"
                onClick={() =>
                  handleDownload(layer.model ?? "", "download-blank-model")
                }
              />
            </SidebarMenuItem>
            <SidebarMenuItem>
              <ButtonProperties
                label="Trained model"
                onClick={() =>
                  handleDownload(layer.model ?? "", "download-trained-model")
                }
              />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>{" "}
      </SidebarGroup>
    </CollapsibleContent>
  );
}
