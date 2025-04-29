"use client";
import { useEffect } from "react";
import Canvas from "../canvas/Canvas";
import { useFlowContext } from "@/context/FlowContext";

export default function Editor() {
  const { edges, nodes } = useFlowContext();

  const editorStyles = {
    backgroundColor: "#f0f0f0",
    display: "flex",
    width: "100%",
    height: "100%",
    overflow: "hidden",
    outline: "solid 1px #ccc",
  };

  return (
    <div id="editor" style={{ position: "relative", ...editorStyles }}>
      <Canvas />
    </div>
  );
}
