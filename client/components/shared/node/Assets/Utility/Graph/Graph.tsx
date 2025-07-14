"use client";

import Handle from "@/components/shared/handle/Handle";
import { ChartContainer } from "@/components/ui/chart";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFlowContext } from "@/context/FlowContext";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import Node from "../../../Node";

type ChartType = "bar" | "line" | "pie" | "area" | "scatter";
type ColorScheme = "default" | "blue" | "green" | "purple" | "orange";

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
    fill?: boolean;
  }[];
}

function processDataForChart(
  data: number[][],
  labels: string[],
  chartType: ChartType,
  colorScheme: ColorScheme
): { chartData: ChartData; rechartsData: any[] } {
  const colors = {
    default: [
      "hsl(var(--chart-1))",
      "hsl(var(--chart-2))",
      "hsl(var(--chart-3))",
      "hsl(var(--chart-4))",
      "hsl(var(--chart-5))",
    ],
    blue: ["#3b82f6", "#1d4ed8", "#1e40af", "#1e3a8a", "#172554"],
    green: ["#10b981", "#059669", "#047857", "#065f46", "#064e3b"],
    purple: ["#8b5cf6", "#7c3aed", "#6d28d9", "#5b21b6", "#4c1d95"],
    orange: ["#f97316", "#ea580c", "#dc2626", "#b91c1c", "#991b1b"],
  };

  const selectedColors = colors[colorScheme];

  if (!data || !data[0] || !labels) {
    return {
      chartData: { labels: [], datasets: [] },
      rechartsData: [],
    };
  }

  const processedData = data[0];
  const chartLabels = labels.slice(0, processedData.length);

  // Create chart data for output
  const chartData: ChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Dataset",
        data: processedData,
        backgroundColor:
          chartType === "pie"
            ? selectedColors.slice(0, processedData.length)
            : [selectedColors[0]],
        borderColor:
          chartType === "line" || chartType === "area"
            ? selectedColors[0]
            : undefined,
        fill: chartType === "area",
      },
    ],
  };

  // Create data for Recharts preview
  const rechartsData = chartLabels.map((label, index) => ({
    name: label,
    value: processedData[index] || 0,
    fill: selectedColors[index % selectedColors.length],
  }));

  return { chartData, rechartsData };
}

export function GraphVisualizationNodeComponents({
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
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [colorScheme, setColorScheme] = useState<ColorScheme>("default");
  const [previewData, setPreviewData] = useState<any[]>([]);

  const process = (data: number[][], labels: string[]) => {
    if (!data || !data[0] || !labels) return null;

    return processDataForChart(data, labels, chartType, colorScheme);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      const inputData = values.input?.data;
      const inputLabels = values.input?.labels || [];
      const outputData = values.output?.chartData;

      if (!Array.isArray(inputData)) {
        setPreviewData([]);
        return;
      }

      const result = process(inputData, inputLabels);
      if (!result) return;

      const { chartData, rechartsData } = result;
      setPreviewData(rechartsData);

      if (JSON.stringify(chartData) === JSON.stringify(outputData)) return;

      updateNode(id, "values.output.chartData", chartData);
      updateNode(id, "values.output.chartType", chartType);
      updateNode(id, "values.output.colorScheme", colorScheme);
    }, 0);

    return () => clearTimeout(timeout);
  }, [
    JSON.stringify(values.input?.data),
    JSON.stringify(values.input?.labels),
    chartType,
    colorScheme,
    id,
  ]);

  const renderChart = () => {
    if (!previewData.length) {
      return (
        <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
          No data to display
        </div>
      );
    }

    const chartConfig = {
      value: {
        label: "Value",
        color: "hsl(var(--chart-1))",
      },
    };

    switch (chartType) {
      case "bar":
        return (
          <ChartContainer config={chartConfig} className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={previewData}>
                <XAxis dataKey="name" fontSize={10} />
                <YAxis fontSize={10} />
                <Bar dataKey="value" fill="var(--color-value)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        );

      case "line":
        return (
          <ChartContainer config={chartConfig} className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={previewData}>
                <XAxis dataKey="name" fontSize={10} />
                <YAxis fontSize={10} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-value)"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        );

      case "pie":
        return (
          <ChartContainer config={chartConfig} className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={previewData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={50}
                  fill="var(--color-value)"
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        );

      case "area":
        return (
          <ChartContainer config={chartConfig} className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={previewData}>
                <XAxis dataKey="name" fontSize={10} />
                <YAxis fontSize={10} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-value)"
                  fill="var(--color-value)"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        );

      default:
        return (
          <ChartContainer config={chartConfig} className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={previewData}>
                <XAxis dataKey="name" fontSize={10} />
                <YAxis fontSize={10} />
                <Bar dataKey="value" fill="var(--color-value)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        );
    }
  };

  return (
    <Node id={id} defaultPosition={position}>
      <div className="graphVisualization" id={id}>
        {/*<NodeHeader label={label} id={id} logo={BarChart3}/>*/}

        <div className="px-5 py-2 space-y-3">
          <div className="space-y-1">
            <Label htmlFor="chart-type" className="text-muted-foreground">
              Chart Type
            </Label>
            <Select
              onValueChange={(value: ChartType) => setChartType(value)}
              defaultValue="bar"
            >
              <SelectTrigger id="chart-type" className="w-[180px]">
                <SelectValue placeholder="Chart Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Bar Chart</SelectItem>
                <SelectItem value="line">Line Chart</SelectItem>
                <SelectItem value="pie">Pie Chart</SelectItem>
                <SelectItem value="area">Area Chart</SelectItem>
                <SelectItem value="scatter">Scatter Plot</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="color-scheme" className="text-muted-foreground">
              Color Scheme
            </Label>
            <Select
              onValueChange={(value: ColorScheme) => setColorScheme(value)}
              defaultValue="default"
            >
              <SelectTrigger id="color-scheme" className="w-[180px]">
                <SelectValue placeholder="Color Scheme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="blue">Blue</SelectItem>
                <SelectItem value="green">Green</SelectItem>
                <SelectItem value="purple">Purple</SelectItem>
                <SelectItem value="orange">Orange</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Chart Preview */}
          <div className="space-y-1">
            <Label className="text-muted-foreground">Preview</Label>
            <div className="p-2 border rounded-md bg-background">
              {renderChart()}
            </div>
          </div>
        </div>

        {/* Input Handles */}
        <Handle type="target" id="graphViz-h1" dataId="data">
          <div>Data</div>
        </Handle>

        <Handle type="target" id="graphViz-h2" dataId="labels">
          <div>Labels</div>
        </Handle>

        {/* Output Handle */}
        <Handle type="source" id="graphViz-h3" dataId="chartData">
          <div>Chart</div>
        </Handle>
      </div>
    </Node>
  );
}

export default GraphVisualizationNodeComponents;
