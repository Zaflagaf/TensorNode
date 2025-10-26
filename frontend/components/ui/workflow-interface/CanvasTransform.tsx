"use client";
import { useWorkflowStore } from "@/frontend/organism/canvas/store/workflowStore";
import { useZoomStore } from "@/frontend/organism/canvas/store/zoomStore";
import React, { useState } from "react";

const CanvasTransformationTracker = () => {
  const [inputValue, setInputValue] = useState("");

  const focusId = useZoomStore((state) => state.actions.focusId);
  const transform = useZoomStore((state) => state.transform);
  const workflow = useWorkflowStore((state) => state.workflow);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      focusId(inputValue.trim(), workflow.current);
    }
  };

  return (
    <div
      className="px-[10px] py-[5px] bg-[rgba(0,0,0,0.5)] text-white rounded-[4px] flex h-fit"
      style={{
        fontFamily: "monospace",
      }}
    >
      <ol>
        <li>x: {Math.round(transform.x)}</li>
        <li>y: {Math.round(transform.y)}</li>
        <li>k: {transform.k.toFixed(2)}</li>
      </ol>
    </div>
  );
};

const TransformTracker = React.memo(CanvasTransformationTracker);
export default TransformTracker;
