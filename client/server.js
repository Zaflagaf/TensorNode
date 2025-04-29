const express = require("express");
const cors = require("cors");  // Utilisation correcte de CORS
const fs = require("fs");
const path = require("path");

const app = express();

// Active CORS pour toutes les origines (facile en développement)
app.use(
  cors({
    origin: "http://localhost:3000",  // Autorise uniquement ce domaine
  })
);

// Middleware pour parser le JSON
app.use(express.json());

// Route pour sauvegarder les nodes
app.post("/api/save-nodes", (req, res) => {
  const nodes = req.body;
  const filePath = path.join(__dirname, "nodes.json");

  fs.writeFile(filePath, JSON.stringify(nodes, null, 2), (err) => {
    if (err) {
      console.error("Erreur lors de l'écriture :", err);
      return res
        .status(500)
        .json({ message: "Erreur lors de l'écriture du fichier" });
    }
    res.status(200).json({ message: "Fichier sauvegardé avec succès" });
  });
});

// Route pour sauvegarder les edges
app.post("/api/save-edges", (req, res) => {
  console.log("Données reçues pour les edges : ", req.body);  // Log des données
  const edges = req.body;
  const filePath = path.join(__dirname, "edges.json");

  fs.writeFile(filePath, JSON.stringify(edges, null, 2), (err) => {
    if (err) {
      console.error("Erreur lors de l'écriture :", err);
      return res
        .status(500)
        .json({ message: "Erreur lors de l'écriture du fichier" });
    }
    res.status(200).json({ message: "Fichier sauvegardé avec succès" });
  });
});

// Route d'accueil
app.get("/", (req, res) => {
  res.send("🚀 Serveur backend Express opérationnel !");
});

// Démarrer le serveur
app.listen(3001, () => {
  console.log("Serveur en écoute sur http://localhost:3001");
});