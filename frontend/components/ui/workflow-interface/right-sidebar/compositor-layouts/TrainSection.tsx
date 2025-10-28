"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/frontend/components/ui/shadcn/sidebar";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../../../shadcn/input-group";

import { BrainCircuit, Check, LoaderCircle, X } from "lucide-react";

import { useTrainingProgress } from "@/frontend/hooks/socketio/useTrainingProgress";
import { cn } from "@/frontend/lib/utils";
import { useEdgesStore } from "@/frontend/organism/edge/store/edgesStore";
import { useNodesStore } from "@/frontend/organism/node/store/nodesStore";
import { ButtonStatus } from "@/frontend/types";
import { composeModel } from "@/frontend/services/api";
import { produce } from "immer";
import React, { useState } from "react";
import { AccordionContent } from "../../../shadcn/accordion";
import { Label } from "../../../shadcn/label";
import { Progress } from "../../../shadcn/progress";

export default function TrainSection({
  selectedMetrics,
}: {
  selectedMetrics: string[];
}) {
  const [hyperparameters, setHyperparameters] = React.useState<{
    epochs: any;
    batchSize: any;
    learningRate: any;
  }>({
    epochs: 0,
    batchSize: 0,
    learningRate: 0,
  });
  const [buttonStatus, setButtonStatus] = useState<ButtonStatus>("idle");

  const { epoch, status } = useTrainingProgress();

  const handleTrain = async () => {
    const nodes = useNodesStore.getState().nodes;
    const edges = useEdgesStore.getState().edges;

    await composeModel(
      nodes,
      edges,
      hyperparameters,
      selectedMetrics,
      setButtonStatus
    );

    /*     toast("Fail", {
      description: "Model failed to train",
    });
    setTrainingProgressAttribute((prev) => {
      return {
        ...prev,
        status: "error",
      };
    }); */
  };

  return (
    <AccordionContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem className="flex flex-col gap-1">
              <InputGroup>
                <InputGroupAddon className="text-xs">Epochs:</InputGroupAddon>
                <InputGroupInput
                  type="number"
                  className="text-end no-spin text-xs dark:text-xs"
                  value={hyperparameters.epochs}
                  onChange={(e) =>
                    setHyperparameters(
                      produce((draft) => {
                        draft.epochs = e.target.value;
                      })
                    )
                  }
                  onFocus={(e) => e.target.select()}
                />
              </InputGroup>
              <InputGroup>
                <InputGroupAddon className="text-xs">
                  Batch size:
                </InputGroupAddon>
                <InputGroupInput
                  type="number"
                  className="text-end no-spin text-xs dark:text-xs"
                  value={hyperparameters.batchSize}
                  onChange={(e) =>
                    setHyperparameters(
                      produce((draft) => {
                        draft.batchSize = e.target.value;
                      })
                    )
                  }
                  onFocus={(e) => e.target.select()}
                />
              </InputGroup>
              <InputGroup>
                <InputGroupAddon className="text-xs">
                  Learning rate:
                </InputGroupAddon>
                <InputGroupInput
                  type="number"
                  className="text-end no-spin text-xs dark:text-xs"
                  value={hyperparameters.learningRate}
                  step={0.001}
                  onChange={(e) =>
                    setHyperparameters(
                      produce((draft) => {
                        draft.learningRate = e.target.value;
                      })
                    )
                  }
                  onFocus={(e) => e.target.select()}
                />
              </InputGroup>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                className="bg-input/30 relative overflow-hidden rounded-sm justify-center cursor-pointer z-0 text-xs"
                onClick={handleTrain}
              >
                <Progress
                  value={(epoch / hyperparameters.epochs) * 100}
                  className="absolute w-full h-full rounded-sm bg-transparent -z-1"
                  classNameSecondary={cn(
                    buttonStatus === "success"
                      ? "bg-hue-150"
                      : buttonStatus === "loading"
                      ? "bg-hue-260"
                      : buttonStatus === "error"
                      ? "bg-hue-30"
                      : null
                  )}
                />
                <BrainCircuit />
                <span>Train</span>
                {buttonStatus === "success" ? (
                  <Check />
                ) : buttonStatus === "loading" ? (
                  <LoaderCircle className="animate-spin" />
                ) : buttonStatus === "error" ? (
                  <X />
                ) : null}
              </SidebarMenuButton>
              {epoch !== 0 && (
                <Label className="text-muted-foreground">
                  Epochs: {epoch} / {hyperparameters.epochs}
                </Label>
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </AccordionContent>
  );
}
