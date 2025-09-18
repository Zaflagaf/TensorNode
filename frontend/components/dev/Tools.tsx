"use client";
import React from "react";

import FPSCounter from "./FPSCounter";
import FocusInput from "./FocusId";
import TransformTracker from "./CanvasTransform";

type ToolsProps = {
 tools: {
    fps: boolean,
    focus: boolean,
    transform: boolean
 }
};

const Tools: React.FC<ToolsProps> = ({ tools }) => {
  return (
    <div className="fixed flex gap-2 top-2 left-2">
      {tools.transform && <TransformTracker/>}
      {tools.fps && <FPSCounter />}
      {tools.focus && <FocusInput />}
    </div>
  );
};

export default Tools;
