"use client";

// (import) bibliotheques externes
import useLayout from "@/frontend/hooks/useLayout";
import { motion } from "framer-motion";
import React, { useState } from "react";
import * as Charts from "recharts";

// (import) types
import { NodeType } from "@/frontend/schemas/node";

// (import) useStores

// (import) parts
import WorkflowHandle from "@/frontend/organism/Handle";
import WorkflowNode from "@/frontend/organism/Node";

// (import) layouts
import WorkflowBody from "../layouts/Body";
import WorkflowBoolean from "../layouts/Boolean";
import WorkflowChart from "../layouts/Chart";
import WorkflowDefault from "../layouts/Default";
import WorkflowFooter from "../layouts/Footer";
import WorkflowHeader from "../layouts/Header";
import WorkflowNumber from "../layouts/Number";
import WorkflowSelection from "../layouts/Selection";

const MAX_DISPLAYED_NEURONS = 7;
const activationChoice = [
  "relu", // Très courant, rapide, excellent pour la plupart des couches cachées
  "tanh", // Souvent utilisé pour les réseaux récurrents ou normalisation [-1,1]
  "swish", // Alternative moderne à ReLU, parfois plus performante
  "sigmoid", // Utile pour les sorties binaires (classification 0/1)
  "softmax", // Utilisé pour les sorties multi-classes (probabilités)
  "gelu", // Activation récente, performante sur certains modèles profonds
  "softplus", // Lisse, similaire à ReLU, moins couramment utilisé
  "selu", // Self-normalizing, parfois utilisé dans des architectures spécifiques
  "elu", // Variante de ReLU avec valeurs négatives, stabilise l’apprentissage
  "mish", // Activation moderne, lisse, efficace mais un peu plus lourde
  "softsign", // Rarement utilisé, similaire à tanh mais plus lent
  "linear", // Identité, utile pour les sorties régressives
  "exponential", // Rare, transforme la sortie en exponentielle, pour cas très spécifiques
];

export function NeuralNetworkVisualization({ node }: { node: NodeType }) {
  const [hiddenLayerSize, setHiddenLayerSize] = useState(
    node.content.ports.inputs.units
  );
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

// Fonction sigmoïde
const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

// Générer les données
const data = Array.from({ length: 100 }, (_, i) => {
  const x = (i - 50) / 10; // échelle de -5 à 5
  return { x, y: sigmoid(x) };
});

const SigmoidChart = () => {
  return (
    <div className="flex items-center justify-center w-full h-[200px] px-4">
      <Charts.ResponsiveContainer width="100%" height="100%">
        <Charts.LineChart data={data}>
          <Charts.CartesianGrid strokeDasharray="3 3" />
          <Charts.Tooltip
            content={({ payload }) => {
              if (!payload || !payload.length) return null;
              const point = payload[0].payload;
              return (
                <div
                  style={{
                    background: "#fff",
                    padding: 5,
                    border: "1px solid #ccc",
                  }}
                >
                  {`sigm(${point.x.toFixed(2)}) = ${point.y.toFixed(2)}`}
                </div>
              );
            }}
          />

          <Charts.Tooltip />
          <Charts.Line
            type="monotone"
            dataKey="y"
            stroke="#8884d8"
            dot={false}
          />
        </Charts.LineChart>
      </Charts.ResponsiveContainer>
    </div>
  );
};

const DenseNodeComponent = React.memo(({ node }: { node: NodeType }) => {
  const [bias, setBias] = useState<boolean>(node.content.ports.inputs.useBias);
  const [units, setUnits] = useState<number>(node.content.ports.inputs.units);
  const [activation, setActivation] = useState<string>(
    node.content.ports.inputs.activation
  );

  useLayout(node, {
    units: units,
    useBias: bias,
    activation: activation,
  });

  return (
    <WorkflowNode node={node}>
      <div className="w-[250px]">
        <WorkflowHeader
          label="Couche Dense"
          className={"from-node-head-layer-from-gradient to-node-head-layer-to-gradient"}
        />

        <WorkflowBody>
          <WorkflowHandle type="source" id="h1" port="layer" node={node}>
            <WorkflowDefault label="Layer" />
          </WorkflowHandle>
          <WorkflowHandle type="target" id="h2" port="layer" node={node}>
            <WorkflowDefault label="Layer" />
          </WorkflowHandle>
          <WorkflowNumber number={units} setNumber={setUnits} label="Units" />
          <WorkflowBoolean boolean={bias} setBoolean={setBias} label="Bias" />
          {/*           <WorkflowVector vector={{"Vec1": 2, "Vec2": 15, "Vec3": 1001}}/> */}
          <WorkflowSelection
            selection={activation}
            setSelection={setActivation}
            label="Activation"
            choices={activationChoice}
          />
          <WorkflowChart functionType={activation} />
        </WorkflowBody>
        <WorkflowFooter />
      </div>
    </WorkflowNode>
  );
});

export default DenseNodeComponent;
