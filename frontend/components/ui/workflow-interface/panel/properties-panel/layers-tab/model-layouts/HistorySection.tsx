import {
  ChartContainer,
  ChartTooltip,
} from "@/frontend/components/ui/shadcn/chart";
import { CollapsibleContent } from "@/frontend/components/ui/shadcn/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/frontend/components/ui/shadcn/sidebar";
import { useTrainingStore } from "@/frontend/store/trainingStore";
import { ModelLayer } from "@/frontend/types";
import { useEffect, useRef, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

export default function HistorySection({ layer }: { layer: ModelLayer }) {
  const [graphs, setGraphs] =
    useState<
      Record<
        string,
        Record<string, { epochs: number; [metric: string]: number }[]>
      >
    >();

  const history = useTrainingStore((state) => state.history);

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
        const arr = Array.isArray(metricArray) ? metricArray : [];

        const content = arr.map((value, index) => ({
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
    <CollapsibleContent>
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
        <div className="text-xxs p-2 text-muted-foreground">
          No metrics to display, you must train your model first...
        </div>
      )}
    </CollapsibleContent>
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
  const [size, setSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ width: "100%", height: 200 }}>
      {size.width > 0 && size.height > 0 && (
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
      )}
    </div>
  );
}
