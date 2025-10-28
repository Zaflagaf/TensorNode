"use client";

import { cn } from "@/frontend/lib/utils";
import { ButtonStatus } from "@/frontend/types";
import { Check, CircleX, LoaderCircle } from "lucide-react";
import React from "react";

const WorkflowButton = React.memo(
  ({
    label,
    onClick,
    status,
  }: {
    label: string;
    onClick: () => void;
    status: ButtonStatus;
  }) => {
    const renderButtonContent = () => {
      switch (status) {
        case "error":
          return (
            <div className="flex gap-[5px]">
              <CircleX className="w-4 h-4 stroke-2 text-node-text" />
              <p>{label}</p>
            </div>
          );
        case "idle":
          return (
            <div className="flex gap-[5px]">
              {/* <Play className="w-4 h-4 stroke-2 text-node-text" /> */}
              <p>{label}</p>
            </div>
          );
        case "loading":
          return (
            <div className="flex gap-[5px]">
              <LoaderCircle className="w-4 h-4 stroke-2 text-node-text animate-spin" />
              <p>{label}</p>
            </div>
          );
        case "success":
          return (
            <div className="flex gap-[5px]">
              <Check className="w-4 h-4 stroke-2 text-node-text" />
              <p>{label}</p>
            </div>
          );
      }
    };

    const getButtonVariant = () => {
      switch (status) {
        case "success":
          return "bg-node-status-positiv";
        case "error":
          return "bg-node-status-negativ";
        default:
          return "bg-node-status-default";
      }
    };

    return (
      <div
        className={cn(
          "border border-node-outline rounded-[4px] py-[4px] px-[8px] my-[4px] flex justify-center text-node-text text-xs gap-[5px] cursor-pointer transition duration-500",
          getButtonVariant()
        )}
        onClick={(e) => onClick()}
      >
        {renderButtonContent()}
      </div>
    );
  }
);
export default WorkflowButton;
