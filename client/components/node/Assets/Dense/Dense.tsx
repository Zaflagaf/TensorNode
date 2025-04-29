import Node from "../../Node";
import Handle from "@/components/handle/Handle";
import Header from "../../Layout/Header/NodeHeader";

import layers from "@/public/layers.svg";
import illustration from "@/public/illustration/dense.svg";

import NodeSlider from "../../Layout/Slider/NodeSlider";
import NodeSwitch from "../../Layout/Switch/NodeSwitch";
import NodeStats from "../../Layout/Stats/NodeStats";
import { Separator } from "@/components/ui/separator";
import { NodeSelect } from "../../Layout/Select/Select";

import { motion } from "framer-motion";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { useFlowContext } from "@/context/FlowContext";
import { DefinedName } from "xlsx";
export function NeuralNetworkVisualization({ id }: { id: string }) {
  const [hiddenLayerSize, setHiddenLayerSize] = useState(2);
  const { nodes } = useFlowContext();

  const inputLayerSize = 4;
  const outputLayerSize = 3;
  const neuronSpacing = 40;
  const neuronSize = 20;
  const canvasWidth = 400;
  const canvasHeight = 300;

  const getStartY = (layerSize: number) => {
    const totalHeight = (layerSize - 1) * neuronSpacing;
    return (canvasHeight - totalHeight) / 2 - neuronSize / 2;
  };

  const inputStartY = getStartY(inputLayerSize);
  const hiddenStartY = getStartY(hiddenLayerSize);
  const outputStartY = getStartY(outputLayerSize);

  const generateConnections = () => {
    const connections = [];

    for (let i = 0; i < inputLayerSize; i++) {
      for (let h = 0; h < hiddenLayerSize; h++) {
        connections.push({
          x1: 100,
          y1: inputStartY + i * neuronSpacing + neuronSize / 2,
          x2: 200 - neuronSize / 2,
          y2: hiddenStartY + h * neuronSpacing + neuronSize / 2,
        });
      }
    }

    for (let h = 0; h < hiddenLayerSize; h++) {
      for (let o = 0; o < outputLayerSize; o++) {
        connections.push({
          x1: 200 + neuronSize / 2,
          y1: hiddenStartY + h * neuronSpacing + neuronSize / 2,
          x2: 300,
          y2: outputStartY + o * neuronSpacing + neuronSize / 2,
        });
      }
    }

    return connections;
  };

  const totalAnimationDuration = 0.5;

  return (
    <div className="w-full">
      <NodeSlider
        id="h5"
        dataId={"units"}
        label="Units"
        color={"#98bae3"}
        onChange={setHiddenLayerSize}
        dvalue={
          nodes && nodes[id] ? nodes[id].data?.values?.input?.units : undefined
        }
      />
      <div className="flex flex-col items-center p-8 max-w-3xl mx-auto w-full">
        <div className="relative w-full h-[300px] border border-gray-200 rounded-lg bg-white">
          <svg width={canvasWidth} height={canvasHeight} className="mx-auto">
            {Array.from({ length: inputLayerSize }).map((_, i) => (
              <motion.rect
                key={`input-${i}`}
                x="80"
                y={inputStartY + i * neuronSpacing}
                width={neuronSize}
                height={neuronSize}
                rx="10"
                fill="rgba(152, 186, 227, 0.2)"
                stroke="#98bae3"
                strokeWidth="2"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: i * 0.05,
                  duration: totalAnimationDuration,
                }}
              />
            ))}

            {Array.from({ length: hiddenLayerSize }).map((_, i) => (
              <motion.rect
                key={`hidden-${i}`}
                x={200 - neuronSize / 2}
                y={hiddenStartY + i * neuronSpacing}
                width={neuronSize}
                height={neuronSize}
                rx="10"
                fill="rgba(152, 186, 227, 0.2)"
                stroke="#98bae3"
                strokeWidth="2"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: i * 0.05,
                  duration: totalAnimationDuration,
                }}
              />
            ))}

            {Array.from({ length: outputLayerSize }).map((_, i) => (
              <motion.rect
                key={`output-${i}`}
                x="300"
                y={outputStartY + i * neuronSpacing}
                width={neuronSize}
                height={neuronSize}
                rx="10"
                fill="rgba(152, 186, 227, 0.2)"
                stroke="#98bae3"
                strokeWidth="2"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: i * 0.05,
                  duration: totalAnimationDuration,
                }}
              />
            ))}

            {/* Connexions après que tous les neurones aient été animés */}
            {generateConnections().map((conn, i) => (
              <motion.line
                key={`conn-${i}`}
                x1={conn.x1}
                y1={conn.y1}
                x2={conn.x2}
                y2={conn.y2}
                stroke="#e2e8f0"
                strokeWidth="1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  delay: i * 0.01,
                  duration: totalAnimationDuration,
                }}
              />
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}

const activationChoice = ["Sigmoid", "Tanh", "ReLU"];

export function DenseNodeComponent({
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
      <div className="dense" id={id}>
        <Header
          label={label}
          id={id}
          logo={layers}
          illustration={illustration}
        />
        <div
          className="dense-body"
          style={{ display: "flex", flexDirection: "column", gap: "5px" }}
        >
          <Handle type="source" id="h1" dataId={"layer"}>
            Layer
          </Handle>
          <div style={{ position: "absolute" }}>
            <Handle type="target" id="h2" dataId={"layer"}>
              Layer
            </Handle>
          </div>
          <Separator className="my-4 bg-gray-300 h-[2px]" />
          <NodeSwitch
            id="h3"
            label="Use Bias"
            color="#98bae3"
            dataId={"useBias"}
          />
          <NodeSelect
            id="h4"
            data-id={"activation"}
            label="Activation"
            choice={activationChoice}
            placeholder={"select an Activation"}
          />
          <NeuralNetworkVisualization id={id} />
        </div>
        <Separator className="my-4 bg-gray-300 h-[2px]" />
        <NodeStats />
        <div
          className="dense-footer"
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

export default DenseNodeComponent;
