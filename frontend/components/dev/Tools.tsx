"use client";
import React from "react";

import TransformTracker from "./CanvasTransform";
import FPSCounter from "./FPSCounter";
import FocusInput from "./FocusId";
import CopyButton from "./Copy";

type ToolsProps = {
  tools: {
    fps: boolean;
    focus: boolean;
    transform: boolean;
    copy: boolean
  };
};

const Tools: React.FC<ToolsProps> = ({ tools }) => {
  return (
    <div className="fixed flex gap-2 top-2 left-2">
      {tools.transform && <TransformTracker />}
      {tools.fps && <FPSCounter />}
      {tools.focus && <FocusInput />}
      {tools.copy && <CopyButton />}
    </div>
  );
};

export default Tools;
