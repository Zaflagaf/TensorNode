"use client";
import { useWorkflowStore } from "@/frontend/store/workflowStore";
import { useZoomStore } from "@/frontend/store/zoomStore";
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
      style={{
        fontFamily: "monospace",

      }}
    >
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Focus an ID"
        style={{
          backgroundColor: "transparent",
          border: "none",
          outline: "none",
          color: "white",
          fontFamily: "monospace",
          width: "100px",
        }}
      />
    </div>
  );
};

const FocusInput = React.memo(FocusInputComponent);
export default FocusInput;
