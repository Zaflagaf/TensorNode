import { NextResponse, NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import { NodeType } from "@/frontend/schemas/node";

export async function POST(req: NextRequest) {
  try {
    const data: { nodes: Record<string, NodeType>; edges: any } = await req.json();

    const nodesPath = path.join(process.cwd(), "database", "nodes.json");
    const edgesPath = path.join(process.cwd(), "database", "edges.json");

    fs.writeFileSync(nodesPath, JSON.stringify(data.nodes, null, 2));
    fs.writeFileSync(edgesPath, JSON.stringify(data.edges, null, 2));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save workflow" }, { status: 500 });
  }
}
