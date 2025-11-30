"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from "@/frontend/components/ui/shadcn/sidebar";

import { Check, LoaderCircle, X } from "lucide-react";

import { Label } from "@/frontend/components/ui/shadcn/label";
import { Progress } from "@/frontend/components/ui/shadcn/progress";
import { composeModel } from "@/frontend/lib/fetch/api";
import { cn } from "@/frontend/lib/utils";
import { useEdgesStore } from "@/frontend/store/edgesStore";
import { useNodesStore } from "@/frontend/store/nodesStore";
import { useTrainingStore } from "@/frontend/store/trainingStore";
import { ButtonStatus } from "@/frontend/types";
import { produce } from "immer";
import React, { useState } from "react";
import useTimelineStore from "../../../../../../../store/panels-store/timeline-store";

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
    epochs: 32,
    batchSize: 12,
    learningRate: 0.001,
  });
  const [buttonStatus, setButtonStatus] = useState<ButtonStatus>(
    ButtonStatus.idle
  );

  const epoch = useTrainingStore((state) => state.epoch);

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
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem className="flex flex-col gap-1">
            <div className="grid grid-cols-[1fr_2fr] items-center text-xxs gap-0.5">
              <span className="whitespace-nowrap">Epochs</span>
              <input
                className="w-full text-xxs bg-background/90 px-2 py-1 rounded-xs"
                value={hyperparameters.epochs}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  useTimelineStore.setState({ timelineEnd: value });
                  setHyperparameters(
                    produce((draft) => {
                      draft.epochs = value;
                    })
                  );
                }}
              />

              <span className="whitespace-nowrap">Batch Size</span>
              <input
                className="w-full text-xxs bg-background/90 px-2 py-1 rounded-xs"
                value={hyperparameters.batchSize}
                onChange={(e) =>
                  setHyperparameters(
                    produce((draft) => {
                      draft.batchSize = e.target.value;
                    })
                  )
                }
              />

              <span className="whitespace-nowrap">Learning Rate</span>
              <input
                className="w-full text-xxs bg-background/90 px-2 py-1 rounded-xs"
                value={hyperparameters.learningRate}
                onChange={(e) =>
                  setHyperparameters(
                    produce((draft) => {
                      draft.learningRate = e.target.value;
                    })
                  )
                }
              />
            </div>

            {/*               <WorkflowNumber
                label="epoch"
                number={hyperparameters.epochs}
                setNumber={(number: number) =>
                  setHyperparameters(
                    produce((draft) => {
                      draft.epochs = number;
                    })
                  )
                }
              /> */}

            {/*             <InputGroup>
              <InputGroupAddon className="text-xxs">Epochs:</InputGroupAddon>
              <InputGroupInput
                type="number"
                className="text-end no-spin text-xxs dark:text-xxs"
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
            </InputGroup> */}
            {/*             <InputGroup>
              <InputGroupAddon className="text-xxs">
                Batch size:
              </InputGroupAddon>
              <InputGroupInput
                type="number"
                className="text-end no-spin text-xxs dark:text-xxs"
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
              <InputGroupAddon className="text-xxs">
                Learning rate:
              </InputGroupAddon>
              <InputGroupInput
                type="number"
                className="text-end no-spin text-xxs dark:text-xxs"
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
            </InputGroup> */}
          </SidebarMenuItem>
          <SidebarMenuItem>
            <button
              className="bg-input/30 flex w-full px-1 py-1 gap-1 items-center relative overflow-hidden rounded-xs justify-center cursor-pointer z-0 text-xxs"
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
              <span className="text-xxs">Train</span>
              {buttonStatus === "success" ? (
                <Check className="size-3" />
              ) : buttonStatus === "loading" ? (
                <LoaderCircle className="animate-spin size-3" />
              ) : buttonStatus === "error" ? (
                <X className="size-3" />
              ) : null}
            </button>
            {/* <SidebarMenuButton
              className="bg-input/30 relative overflow-hidden rounded-sm justify-center cursor-pointer z-0 text-xxs"
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
            </SidebarMenuButton> */}
            {epoch !== 0 && (
              <Label className="text-muted-foreground">
                Epochs: {epoch} / {hyperparameters.epochs}
              </Label>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
