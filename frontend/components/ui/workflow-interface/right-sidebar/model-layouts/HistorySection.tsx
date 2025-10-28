import { useTrainingProgress } from "@/frontend/hooks/socketio/useTrainingProgress";
import { ModelLayer } from "@/frontend/types";
import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { AccordionContent } from "../../../shadcn/accordion";
import { ChartContainer, ChartTooltip } from "../../../shadcn/chart";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "../../../shadcn/sidebar";

export default function HistorySection({ layer }: { layer: ModelLayer }) {
  const [graphs, setGraphs] =
    useState<
      Record<
        string,
        Record<string, { epochs: number; [metric: string]: number }[]>
      >
    >();

  // history est un objet et non un tableau
  const history: Record<
    string,
    Record<string, number[]>
  > = useTrainingProgress().history || {};

  useEffect(() => {
    // graphs contiendra un objet de la forme :
    // { [modelId]: { [metricName]: Array<{ epochs: number; [metricName]: number }> } }
    const graphs: Record<
      string,
      Record<string, { epochs: number; [metric: string]: number }[]>
    > = {};

    // Vérification pour s'assurer que history est un objet non vide
    if (!history || Object.keys(history).length === 0) return;

    // Parcours chaque modèle dans history
    Object.entries(history).forEach(([modelId, metrics]) => {
      graphs[modelId] = {};

      // Parcours chaque métrique du modèle
      Object.entries(metrics).forEach(([metricName, metricArray]) => {
        const content = metricArray.map((value, index) => ({
          epochs: index,
          [metricName]: value,
        }));

        graphs[modelId][metricName] = content;
      });
    });

    // Met à jour le state
    setGraphs(graphs);
  }, [history]);

  return (
    <AccordionContent>
      {layer.model && graphs && graphs[layer.model] ? (
        <SidebarGroup>
          <SidebarGroupLabel>
            {layer.model.charAt(0).toUpperCase() + layer.model.slice(1)}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {Object.entries(graphs[layer.model]).map(([metricName, data]) => (
              <MetricChart
                key={metricName}
                data={data}
                label={metricName.charAt(0).toUpperCase() + metricName.slice(1)}
                dataKey={metricName}
              />
            ))}
          </SidebarGroupContent>
        </SidebarGroup>
      ) : (
        <span className="text-xs">
          No metrics to display, you must <b>train</b> your model first
        </span>
      )}
    </AccordionContent>
  );
}

function MetricChart({
  data,
  label,
  dataKey,
}: {
  data: any;
  label: string;
  dataKey: string;
}) {
  return (
    <ChartContainer
      style={{ width: "100%", height: 200, minHeight: 200 }}
      config={{ [dataKey]: { label: label } }}
    >
      <AreaChart
        accessibilityLayer
        data={data}
        margin={{
          left: -30,
          right: 0,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="epochs"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          /*                 tickFormatter={(value) => value.slice(0, 5)} */
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={4}
          tickCount={100}
        />
        <ChartTooltip
          cursor={false}
          content={({ active, payload }) => {
            if (!active || !payload || !payload.length) return null;
            const point = payload[0]; // contient dataKey et value
            const epoch = point?.payload?.epochs; // récupérer "epochs" depuis les données

            return (
              <div className="bg-background border rounded-md p-2 text-sm shadow-md">
                <div>
                  Epoch: <strong>{epoch}</strong>
                </div>
                <div>
                  {label}:{" "}
                  <strong>
                    {typeof point.value === "number"
                      ? point.value.toFixed(3)
                      : point.value}
                  </strong>
                </div>
              </div>
            );
          }}
        />
        <Area
          dataKey={dataKey}
          type="monotone"
          fill="var(--color-primary)"
          fillOpacity={0.1}
          stroke="var(--color-primary)"
          stackId="a"
        />
      </AreaChart>
    </ChartContainer>
  );
}
