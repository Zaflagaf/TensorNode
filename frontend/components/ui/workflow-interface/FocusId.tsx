"use client";
import { useWorkflowStore } from "@/frontend/organism/canvas/store/workflowStore";
import { useZoomStore } from "@/frontend/organism/canvas/store/zoomStore";
import React, { useState } from "react";

const FocusInputComponent = () => {
  const [inputValue, setInputValue] = useState("");
  const focusId = useZoomStore((state) => state.actions.focusId);
  const workflow = useWorkflowStore((state) => state.workflow);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      focusId(inputValue.trim(), workflow.current);
    }
  };

  return (
    <div
      className="px-[10px] py-[5px] bg-[rgba(0,0,0,0.5)] text-white rounded-[4px] flex h-fit"
      style={{ fontFamily: "monospace" }}
    >
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Focus an ID"
        className="text-white bg-transparent border-0 undraggable outline-0 w-[100px]"
        style={{ fontFamily: "monospace" }}
      />
    </div>
  );
};

const FocusInput = React.memo(FocusInputComponent);
export default FocusInput;
