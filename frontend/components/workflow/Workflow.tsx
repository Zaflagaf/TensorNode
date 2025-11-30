"use client";

import WorkflowContextMenu from "@/frontend/components/ui/workflow-interface/general/ContextMenu";

import { getWorkflowTransformedPoint } from "@/frontend/lib/getWorkflowTransformedPoint";
import { createDefaultNode } from "@/frontend/lib/node&edge-logic/defaultNodes";
import { useLayersStore } from "@/frontend/store/layersStore";
import { useNodesStore } from "@/frontend/store/nodesStore";
import { useWorkflowStore } from "@/frontend/store/workflowStore";
import { useZoomStore } from "@/frontend/store/zoomStore";

import {
  panels,
  WorkflowPanelManager,
} from "@/frontend/components/ui/workflow-interface/panel/_panel-manager/panel-manager";
import { createId } from "@/frontend/utils/create/createId";

export default function Workflow() {


  return (
    <main className="h-full w-full bg-black relative">

        <div className="w-full h-full bg-background">
          <WorkflowPanelManager panels={panels} />
        </div>

    </main>
  );
}
