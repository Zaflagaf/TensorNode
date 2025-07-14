import Handle from "@/components/shared/handle/Handle";
import { Button } from "@/components/ui/button";
import { useFlowContext } from "@/context/FlowContext";
import layers from "@/public/layers.svg";
import { useEffect, useState } from "react";
import NodeHeader from "../../Layout/Header/NodeHeader";
import Node from "../../Node";

const predict = async (id: string, input: number[]) => {
  try {
    const response = await fetch("http://localhost:5000/api/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: id, input: input }),
    });

    if (!response.ok) {
      throw new Error("Failed to predict");
    }

    const prediction = await response.json();
    //////////("Prediction faite avec succès:", prediction);
    return prediction;
  } catch (error) {
    console.error("Erreur lors de la création du modèle:", error);
    return null;
  }
};

export function PredictNodeComponent({
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
  const [prediction, setPrediction] = useState<any>(null);

  useEffect(() => {
    updateNode(id, "values.output.labels", prediction);
  }, [prediction, id]);

  return (
    <Node id={id} defaultPosition={position}>
      <div className="predict w-52" id={id}>
        <NodeHeader label={label} id={id} logo={layers} />
        <Handle type="source" id="predict-h1" dataId="labels">
          <div>Prediction</div>
        </Handle>
        <Handle type="target" id="predict-h2" dataId="model">
          <div>Model</div>
        </Handle>
        <Handle type="target" id="predict-h3" dataId="data">
          <div>Data</div>
        </Handle>
        <div className="flex w-full px-2 py-2">
          <Button
            onClick={async () => {
              const result = await predict(
                values.input.model,
                values.input.data
              );
              setPrediction(result);
            }}
            className="flex w-full"
          >
            Predict
          </Button>
        </div>
        {/*<TerminalOutput lines={[JSON.stringify(prediction, null, 2)]} />*/}
      </div>
    </Node>
  );
}

export default PredictNodeComponent;
