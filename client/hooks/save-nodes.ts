import { useStore } from "./store"; // ton hook Zustand

// Quand tu veux envoyer les nodes
function sendNodesToServer() {
  const nodes = useStore.getState().nodes; // récupère l'état actuel

  fetch("http://localhost:5000/nodes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(nodes),
  })
    .then((res) => res.json())
    .then((data) => console.log("Nodes envoyés :", data))
    .catch((err) => console.error("Erreur fetch :", err));
}
