import Node from "../../Node";
import Handle from "@/components/handle/Handle";
import Header from "../../Layout/Header/NodeHeader";

import layers from "@/public/layers.svg";
import illustration from "@/public/illustration/conv2d.svg";

import NodeStats from "../../Layout/Stats/NodeStats";
import { Separator } from "@/components/ui/separator";

import React, { useState, useMemo } from "react";

function ChatNodeComponent({
  id,
  position,
  label,
}: {
  id: string;
  position: { x: number; y: number };
  label: string;
}) {
  return (
    <Node id={id} defaultPosition={position}>
      <div className="conv2d" id={id}>
        <Header
          label={label}
          id={id}
          logo={layers}
          illustration={illustration}
        />
        <div
          className="conv2d-body"
          style={{ display: "flex", flexDirection: "column", gap: "5px" }}
        >
          <Handle type="source" id="h1" dataId="layer">
            Chat
          </Handle>
        </div>
        <Separator className="my-4 bg-gray-300 h-[2px]" />
        <NodeStats />
        <div
          className="conv2d-footer"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 20px",
          }}
        />
      </div>
    </Node>
  );
}

export default ChatNodeComponent;
