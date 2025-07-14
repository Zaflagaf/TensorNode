"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Tooltip } from "recharts"; // en haut si pas déjà importé
import Handle from "@/components/handle/Handle";
import { denseNodeColor1 } from "@/public/colors/color";
import { useEffect, useRef } from "react";
import { useFlowContext } from "@/context/FlowContext";

// Générer les points de la fonction sigmoid
const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

const data = Array.from({ length: 100 }, (_, i) => {
  const x = (i - 50) / 10; // de -5 à +5
  return {
    x: x.toFixed(1), // pour l'affichage sur XAxis
    value: sigmoid(x),
  };
});

export default function NodeGraph({
    id,
    label,
}: {
    id: string;
    label: string;
}) {
    
    return (
        <div>
        <Handle type="target" id={id}>
            Activation
        </Handle>
        <div className="flex flex-col items-center space-y-4">
            <Card className="p-4 border-none shadow-none w-full max-w-md">
            <CardContent className="p-0">
                <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-sm text-gray-500">Activation function</p>
                    <h2 className="text-xl font-semibold">Sigmoid</h2>
                </div>
                </div>
                <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                    data={data}
                    margin={{ top: 10, right: 10, bottom: 0, left: 10 }}
                    >
                    <Tooltip
                        contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #E5E7EB", // gray-200
                        borderRadius: "0.5rem",
                        fontSize: "0.75rem",
                        padding: "0.5rem",
                        color: "#0F172A",
                        }}
                        cursor={{ stroke: "#CBD5E1", strokeWidth: 1 }} // light gray hover line
                    />
                    <XAxis
                        dataKey="x"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#6B7280" }}
                    />
                    <YAxis domain={[0, 1]} hide />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#0F172A"
                        strokeWidth={3}
                        dot={false}
                    />
                    </LineChart>
                </ResponsiveContainer>
                </div>
            </CardContent>
            </Card>
        </div>
        </div>
    );
}