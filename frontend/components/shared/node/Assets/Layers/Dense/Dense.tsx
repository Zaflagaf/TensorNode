import Handle from "@/frontend/organism/Handle";
import Node from "../../../../../../organism/Node";
import NodeHeader from "../../../Layout/Header/NodeHeader";

import illustration from "@/public/svg/dense.svg";
import layers from "@/public/svg/layers.svg";

import { Separator } from "@/frontend/components/ui/separator";
import NodeSlider from "../../../Layout/Slider/NodeSlider";
import NodeStats from "../../../Layout/Stats/NodeStats";
import NodeSwitch from "../../../Layout/Switch/NodeSwitch";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/frontend/components/ui/select";
import { useFlowContext } from "@/frontend/context/FlowContext";
import { motion } from "framer-motion";
import { useState } from "react";

const MAX_DISPLAYED_NEURONS = 7;

export function NeuralNetworkVisualization({ values }: { values: any }) {
  const [hiddenLayerSize, setHiddenLayerSize] = useState(values.input.units);
  const inputLayerSize = 4;
  const outputLayerSize = 3;
  const neuronSpacing = 40;
  const neuronSize = 20;
  const canvasWidth = 400;
  const canvasHeight = 300;

  // Limiter le nombre de neurones affichés
  const displayedHiddenSize = Math.min(hiddenLayerSize, MAX_DISPLAYED_NEURONS);
  const hiddenNeuronsCount =
    hiddenLayerSize > MAX_DISPLAYED_NEURONS
      ? hiddenLayerSize - MAX_DISPLAYED_NEURONS
      : 0;

  const getStartY = (layerSize: number) => {
    const totalHeight = (layerSize - 1) * neuronSpacing;
    return (canvasHeight - totalHeight) / 2 - neuronSize / 2;
  };

  const inputStartY = getStartY(inputLayerSize);
  const hiddenStartY = getStartY(displayedHiddenSize);
  const outputStartY = getStartY(outputLayerSize);

  const generateConnections = () => {
    const connections = [];

    // Connexions input -> hidden (seulement pour les neurones affichés)
    for (let i = 0; i < inputLayerSize; i++) {
      for (let h = 0; h < displayedHiddenSize; h++) {
        connections.push({
          x1: 100,
          y1: inputStartY + i * neuronSpacing + neuronSize / 2,
          x2: 200 - neuronSize / 2,
          y2: hiddenStartY + h * neuronSpacing + neuronSize / 2,
        });
      }
    }

    // Connexions hidden -> output (seulement pour les neurones affichés)
    for (let h = 0; h < displayedHiddenSize; h++) {
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
        id="dense-h5"
        dataId={"units"}
        label="Units"
        color={"#98bae3"}
        onChange={setHiddenLayerSize}
        dvalue={values.input.units}
      />

      <div className="flex flex-col items-center w-full max-w-3xl p-8 mx-auto">
        <div className="relative w-full h-[300px] border border-gray-200 rounded-lg bg-white">
          <svg width={canvasWidth} height={canvasHeight} className="mx-auto">
            {/* Couche d'entrée */}
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

            {/* Couche cachée (limitée) */}
            {Array.from({ length: displayedHiddenSize }).map((_, i) => (
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

            {/* Indicateur visuel pour les neurones cachés */}
            {hiddenNeuronsCount > 0 && (
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <motion.circle
                  cx={200}
                  cy={hiddenStartY + displayedHiddenSize * neuronSpacing + 20}
                  r="3"
                  fill="#98bae3"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                />
                <motion.circle
                  cx={200}
                  cy={hiddenStartY + displayedHiddenSize * neuronSpacing + 30}
                  r="3"
                  fill="#98bae3"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                />
                <motion.circle
                  cx={200}
                  cy={hiddenStartY + displayedHiddenSize * neuronSpacing + 40}
                  r="3"
                  fill="#98bae3"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                />
                <text
                  x={220}
                  y={hiddenStartY + displayedHiddenSize * neuronSpacing + 35}
                  fontSize="12"
                  fill="#6b7280"
                  className="font-medium"
                >
                  +{hiddenNeuronsCount} more
                </text>
              </motion.g>
            )}

            {/* Couche de sortie */}
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

            {/* Connexions */}
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

            {/* Connexions suggérées pour les neurones cachés */}
            {hiddenNeuronsCount > 0 && (
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ delay: 0.7, duration: 0.3 }}
              >
                {/* Quelques lignes en pointillés pour suggérer plus de connexions */}
                <line
                  x1={100}
                  y1={inputStartY + neuronSpacing}
                  x2={200}
                  y2={hiddenStartY + displayedHiddenSize * neuronSpacing + 30}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />
                <line
                  x1={200}
                  y1={hiddenStartY + displayedHiddenSize * neuronSpacing + 30}
                  x2={300}
                  y2={outputStartY + neuronSpacing}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />
              </motion.g>
            )}
          </svg>

          {/* Labels des couches */}
          <div className="absolute left-0 right-0 flex justify-between px-8 text-sm text-gray-600 bottom-4">
            <span>Input ({inputLayerSize})</span>
            <span>
              Hidden ({hiddenLayerSize}
              {hiddenNeuronsCount > 0 && (
                <span className="font-medium text-blue-600">
                  {" "}
                  - {displayedHiddenSize} shown
                </span>
              )}
              )
            </span>
            <span>Output ({outputLayerSize})</span>
          </div>
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
  values,
}: {
  id: string;
  position: { x: number; y: number };
  label: string;
  values: any;
}) {
  const { updateNode } = useFlowContext();

  return (
    <Node id={id} defaultPosition={position}>
      <div className="dense" id={id}>
        <NodeHeader
          label={label}
          id={id}
          logo={layers}
          illustration={illustration}
        />
        <div
          className="dense-body"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "5px",
          }}
        >
          <Handle type="source" id="dense-h1" dataId="layer">
            Layer
          </Handle>
          <div style={{ position: "absolute" }}>
            <Handle type="target" id="dense-h2" dataId="layer">
              Layer
            </Handle>
          </div>
          <Separator className="my-4 bg-gray-300 h-[2px]" />
          <NodeSwitch
            id="dense-h3"
            label="Use Bias"
            color="#98bae3"
            dataId={"useBias"}
          />
          <Handle type="target" id="h4" dataId="activation">
            <div className="flex items-center justify-between w-full h-full">
              <p className="text-sm font-medium text-gray-700">Activation</p>
              <div className="flex justify-end w-full">
                <Select
                  defaultValue={values.input.activation}
                  onValueChange={(val) =>
                    updateNode(id, "values.input.activation", val)
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={"Select an activation"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {activationChoice.map((obj: string, key) => {
                        return (
                          <SelectItem value={obj.toLowerCase()} key={key}>
                            {obj}
                          </SelectItem>
                        );
                      })}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Handle>
          <NeuralNetworkVisualization values={values} />
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
