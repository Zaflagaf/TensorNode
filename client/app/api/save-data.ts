import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

let isWritingNodes = false;
let pendingNodesWrite: { data: any; resolve: (res: any) => void } | null = null;

function processNodesWrite() {
  if (!pendingNodesWrite) {
    isWritingNodes = false;
    return;
  }

  isWritingNodes = true;
  const { data, resolve } = pendingNodesWrite;
  pendingNodesWrite = null;

  const filePath = path.join(process.cwd(), "/json", "nodes.json");

  fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.error("Erreur écriture nodes :", err);
      resolve(NextResponse.json({ message: "Erreur écriture fichier nodes" }, { status: 500 }));
    } else {
      resolve(NextResponse.json({ message: "Fichier nodes sauvegardé avec succès" }));
    }
    processNodesWrite();
  });
}

let isWritingEdges = false;
let pendingEdgesWrite: { data: any; resolve: (res: any) => void } | null = null;

function processEdgesWrite() {
  if (!pendingEdgesWrite) {
    isWritingEdges = false;
    return;
  }

  isWritingEdges = true;
  const { data, resolve } = pendingEdgesWrite;
  pendingEdgesWrite = null;

  const filePath = path.join(process.cwd(), "/json", "edges.json");

  fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.error("Erreur écriture edges :", err);
      resolve(NextResponse.json({ message: "Erreur écriture fichier edges" }, { status: 500 }));
    } else {
      resolve(NextResponse.json({ message: "Fichier edges sauvegardé avec succès" }));
    }
    processEdgesWrite();
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type, data } = body; // tu peux envoyer { type: "nodes", data: ... } ou { type: "edges", data: ... }

  return new Promise<NextResponse>((resolve) => {
    if (type === "nodes") {
      pendingNodesWrite = { data, resolve };
      if (!isWritingNodes) processNodesWrite();
    } else if (type === "edges") {
      pendingEdgesWrite = { data, resolve };
      if (!isWritingEdges) processEdgesWrite();
    } else {
      resolve(NextResponse.json({ message: "Type invalide" }, { status: 400 }));
    }
  });
}
