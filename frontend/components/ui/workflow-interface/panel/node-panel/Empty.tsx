import { useEdgesStore } from "@/frontend/store/edgesStore";
import { useLayersStore } from "@/frontend/store/layersStore";
import { useNodesStore } from "@/frontend/store/nodesStore";
import { Download, Github } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Button } from "../../../shadcn/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../../../shadcn/empty";

export default function WorkflowEmpty() {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      file.text().then((content) => {
        try {
          const data = JSON.parse(content);

          if (!data.workflow) console.error("not compatible");
          useNodesStore.getState().actions.setNodes(data.workflow.nodes);
          useEdgesStore.getState().actions.setEdges(data.workflow.edges);
          useLayersStore.getState().actions.setLayers(data.workflow.layers);
          useLayersStore
            .getState()
            .actions.setCurrentLayer(data.workflow.currentLayer);
        } catch (err) {
          console.error("Erreur");
        }
      });
    }
  };

  return (
    <div className="w-full h-full overflow-hidden items-center justify-center flex">
      <Empty className="w-full flex items-center justify-center">
        <EmptyHeader>
          <EmptyMedia variant="icon" className="bg-transparent w-fit h-fit ">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 44.52 30.35"
              style={{ width: "300px", height: "300px" }}
            >
              <path
                className="stroke-2 stroke-muted fill-background"
                d="M29.35,15.17h7.09c3.91,0,7.09-3.17,7.09-7.09h0c0-3.91-3.17-7.09-7.09-7.09h-7.09s0,0,0,0c-7.83,0-14.17,6.35-14.17,14.17h0s-7.09,0-7.09,0c-3.91,0-7.09,3.17-7.09,7.09h0c0,3.91,3.17,7.09,7.09,7.09h7.09s0,0,0,0c7.83,0,14.17-6.35,14.17-14.17h0Z"
              />
              <path
                className="stroke-2 stroke-muted fill-background"
                d="M29.35,15.17h7.09c3.91,0,7.09,3.17,7.09,7.09h0c0,3.91-3.17,7.09-7.09,7.09h-7.09s0,0,0,0c-7.83,0-14.17-6.35-14.17-14.17h0s-7.09,0-7.09,0c-3.91,0-7.09-3.17-7.09-7.09h0c0-3.91,3.17-7.09,7.09-7.09h7.09s0,0,0,0c7.83,0,14.17,6.35,14.17,14.17h0Z"
              />
            </svg>
          </EmptyMedia>
          <EmptyTitle>No Layers selected</EmptyTitle>
          <EmptyDescription>
            Select a layer from the outliner panel to get started.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex gap-2">
            <input
              type="file"
              accept=".json"
              id="fileInput"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button asChild className="cursor-pointer">
              <label htmlFor="fileInput" className="flex items-center gap-2">
                <Download />
                <span>Import project</span>
              </label>
            </Button>
            <Link href={"https://github.com/Zaflagaf/TensorNode"} target="_blank">
              <Button variant="outline" className="cursor-pointer">
                <Github />
                <span>Github</span>
              </Button>
            </Link>
          </div>
        </EmptyContent>
        {/*         <Button
          variant="link"
          asChild
          className="text-muted-foreground"
          size="sm"
        >
          <a href="#">
            Learn More <ArrowUpRightIcon />
          </a>
        </Button> */}
      </Empty>
    </div>
  );
}
