"use client";

import { Button } from "@/frontend/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/frontend/components/ui/tooltip";
import useLayout from "@/frontend/hooks/useLayout";
import WorkflowHandle from "@/frontend/organism/Handle";
import WorkflowNode from "@/frontend/organism/Node";
import { NodeType } from "@/frontend/schemas/node";
import { useNodesStore } from "@/frontend/store/nodesStore";
import { Info, PlusCircle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import ShapeVisualizer from "../../layout/ShapeVZ/ShapeVZ";
import WorkflowBody from "../layouts/Body";
import WorkflowDefault from "../layouts/Default";
import WorkflowFooter from "../layouts/Footer";
import WorkflowHead from "../layouts/Header";
import WorkflowNumber from "../layouts/Number";
import WorkflowVector from "../layouts/Vector";
import SubGrid from "../layouts/sublayouts/Grid";

const InputNodeComponent = ({ node }: { node: NodeType }) => {
  const [vector, setVector] = useState<number[]>(
    node.content.ports.inputs.shape
  );

  useLayout(node, { shape: vector });

  return (
    <WorkflowNode node={node}>
      <div>
        <WorkflowHead
          label="Couche D'entrée"
          className={"from-node-head-layer-from-gradient to-node-head-layer-to-gradient"}
        />
        <WorkflowBody>
          <WorkflowHandle type="source" id="h1" port="layer" node={node}>
            <WorkflowDefault label="Shape" />
          </WorkflowHandle>
          <div className="flex flex-col gap-3">
            <div className="flex w-[300px] items-center justify-center">
              <SubGrid>
                <ShapeVisualizer
                  dimensions={node.content.ports.inputs.shape}
                />
              </SubGrid>
            </div>
          </div>
          <WorkflowVector vector={vector} setVector={setVector} />
          {/*--------- */}

{/*           <div className="flex items-center justify-between py-2 text-xs input-footer text-muted-foreground text-node-text">
            <span>
              Total:{" "}
              {node.content.ports.outputs.layer
                ?.reduce((a: number, b: number) => a * b, 1)
                .toLocaleString()}
            </span>
          </div> */}
        </WorkflowBody>
        <WorkflowFooter />
      </div>
    </WorkflowNode>
  );
};

export default InputNodeComponent;
