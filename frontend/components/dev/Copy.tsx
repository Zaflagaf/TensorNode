"use client";

import { useNodesStore } from "@/frontend/store/nodesStore";
import { Copy, CopyCheck } from "lucide-react";
import React, { useState } from "react";

interface CopyButtonProps {
  textToCopy: string;
}

const CopyButtonComponent = () => {
  const [copied, setCopied] = useState(false);
  const nodes = useNodesStore((state) => state.nodes);
  const nodesPosition = useNodesStore((state) => state.nodesPosition);

  const handleCopy = () => {
    const nodesWithPosition = Object.fromEntries(
      Object.entries(nodes).map(([nodeId, node]) => [
        nodeId,
        {
          ...node,
          position: nodesPosition[nodeId] || { x: 0, y: 0 }, // fallback si pas de position
        },
      ])
    );

    navigator.clipboard
      .writeText(JSON.stringify(nodesWithPosition, null, 2))
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1000);
      });
  };

  return (
    <div className="flex text-[#cacaca] text-sm items-center w-fit h-fit">
      <button
        onClick={handleCopy}
        className="bg-[rgba(0,0,0,0.5)] text-white rounded-[4px] flex items-center space-x-2 h-fit w-fit px-[10px] py-[6px]"
        style={{ fontFamily: "monospace" }}
      >
        {copied ? (
          <CopyCheck size="icon" className="w-4 h-4" />
        ) : (
          <Copy size="icon" className="w-4 h-4" />
        )}
      </button>
      <span>{copied ? "Workflow Copied" : ""}</span>
    </div>
  );
};

const CopyButton = React.memo(CopyButtonComponent);
export default CopyButton;
