import { NodeType } from "@/frontend/schemas/node";
import { EdgeType } from "../schemas/edge";

const useSaveWorkflow = () => {
  const saveWorkflow = async (
    nodes: Record<string, NodeType>,
    edges: Record<string, EdgeType>
  ) => {
    try {
      const res = await fetch("/api/save-workflow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nodes, edges }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save workflow");
      }

      return data;
    } catch (err) {
      console.error("Error saving workflow:", err);
      throw err;
    }
  };

  return { saveWorkflow };
};

export default useSaveWorkflow