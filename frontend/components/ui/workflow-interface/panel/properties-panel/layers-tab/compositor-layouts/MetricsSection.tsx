"use client";

import { Badge } from "@/frontend/components/ui/shadcn/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/frontend/components/ui/shadcn/popover";
import { cn } from "@/frontend/lib/utils";
import { CheckCircle, LineChart, Target } from "lucide-react";
import type React from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from "../../../../../shadcn/sidebar";
import ButtonProperties from "../../layouts/Button";

export default function MetricsSection({
  selectedMetrics,
  setSelectedMetrics,
}: {
  selectedMetrics: string[];
  setSelectedMetrics: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const metrics = [
    {
      category: "Classification",
      icon: <CheckCircle className="text-green-500" size={18} />,
      items: [
        "accuracy",
        "binary_accuracy",
        "categorical_accuracy",
        "precision",
        "recall",
        "AUC",
      ],
    },
    {
      category: "Regression",
      icon: <LineChart className="text-blue-500" size={18} />,
      items: [
        "mean_squared_error",
        "mean_absolute_error",
        "mean_absolute_percentage_error",
        "cosine_similarity",
      ],
    },
    {
      category: "Advanced",
      icon: <Target className="text-yellow-500" size={18} />,
      items: [
        "hinge",
        "squared_hinge",
        "kullback_leibler_divergence",
        "poisson",
      ],
    },
  ];

  const handleSelect = (metric: string) => {
    if (!selectedMetrics.includes(metric)) {
      setSelectedMetrics((prev) => [...prev, metric]);
    }
  };

  const handleRemove = (metric: string) => {
    setSelectedMetrics((prev) => prev.filter((m) => m !== metric));
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent className="space-y-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <Popover>
              <PopoverTrigger asChild>
                <ButtonProperties label="Add metrics" />
                {/* <SidebarMenuButton className="bg-input/30 relative overflow-hidden rounded-sm justify-center cursor-pointer z-0 text-xs">
                  <ChartArea />
                  <span className="text-xs">Add metrics to track</span>
                </SidebarMenuButton> */}
              </PopoverTrigger>
              <PopoverContent
                align="start"
                side="right"
                className="w-[280px] p-3 space-y-3 rounded-md border border-border/50 shadow-md max-h-[400px] overflow-y-auto"
              >
                {metrics.map((group) => (
                  <div key={group.category}>
                    <div className="flex items-center gap-2 mb-2">
                      {group.icon}
                      <span className="text-sm font-medium text-foreground/80">
                        {group.category}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {group.items.map((metric) => (
                        <Badge
                          key={metric}
                          onClick={() => handleSelect(metric)}
                          variant="secondary"
                          className={cn(
                            "cursor-pointer hover:bg-primary hover:text-primary-foreground transition",
                            selectedMetrics.includes(metric)
                              ? "bg-hue-260 hover:bg-hue-260/50 hover:text-primary"
                              : ""
                          )}
                        >
                          {metric}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </PopoverContent>
            </Popover>
          </SidebarMenuItem>
        </SidebarMenu>
        {/* Liste verticale et en mosaïque des métriques sélectionnées */}
        {/* <div className="grid grid-cols-2 gap-2 max-h-[300px]">
          <AnimatePresence>
            {selectedMetrics.map((metric) => (
              <motion.div
                key={metric}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-1"
              >
                <Badge
                  variant="outline"
                  className="flex-1 flex items-center justify-between text-sm px-2 py-1 border-border/50 hover:bg-destructive hover:opacity-75 hover:translate-y-[-2px] transition-all group"
                  onClick={() => handleRemove(metric)}
                >
                  {metric}
                </Badge>
              </motion.div>
            ))}
          </AnimatePresence>
        </div> */}
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
