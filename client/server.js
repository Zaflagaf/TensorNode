const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.use(express.json());

let isWritingNodes = false;
let pendingNodesWrite = null;

function processNodesWrite() {
  if (!pendingNodesWrite) {
    isWritingNodes = false;
    return;
  }

  isWritingNodes = true;
  const { data, res } = pendingNodesWrite;
  pendingNodesWrite = null;

  const filePath = path.join(__dirname, "nodes.json");
  fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.error("Erreur écriture nodes :", err);
      res.status(500).json({ message: "Erreur écriture fichier nodes" });
    } else {
      res.status(200).json({ message: "Fichier nodes sauvegardé avec succès" });
    }

    processNodesWrite();
  });
}

app.post("/api/save-nodes", (req, res) => {
  const nodes = req.body;
  console.log("📥 Derniers nodes reçus (n10) :", JSON.stringify(nodes["n10"], null, 2));

  // Remplace l'écriture en attente
  pendingNodesWrite = { data: nodes, res };

  if (!isWritingNodes) {
    processNodesWrite();
  }
});

let isWritingEdges = false;
let pendingEdgesWrite = null;

function processEdgesWrite() {
  if (!pendingEdgesWrite) {
    isWritingEdges = false;
    return;
  }

  isWritingEdges = true;
  const { data, res } = pendingEdgesWrite;
  pendingEdgesWrite = null;

  const filePath = path.join(__dirname, "edges.json");
  fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.error("Erreur écriture edges :", err);
      if (!res.headersSent) {
        res.status(500).json({ message: "Erreur écriture fichier edges" });
      }
    } else {
      if (!res.headersSent) {
        res.status(200).json({ message: "Fichier edges sauvegardé avec succès" });
      }
    }

    processEdgesWrite();
  });
}

app.post("/api/save-edges", (req, res) => {
  const edges = req.body;
  console.log("📥 Edges reçus :", Object.keys(edges));

  pendingEdgesWrite = { data: edges, res };

  if (!isWritingEdges) {
    processEdgesWrite();
  }
});

app.get("/", (req, res) => {
  res.send("🚀 Serveur backend Express opérationnel !");
});

app.listen(3001, () => {
  console.log("Serveur en écoute sur http://localhost:3001");
});
