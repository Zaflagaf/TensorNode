"use client";

export default function Home() {

  async function pickFolder() {
    if (!("showDirectoryPicker" in window)) {
      alert("Votre navigateur ne supporte pas showDirectoryPicker.");
      return;
    }

    // TypeScript: autoriser provisoirement
    const dirHandle = await (window as any).showDirectoryPicker();

    for await (const entry of dirHandle.values()) {
      if (entry.kind === "file") {
        const fileHandle = entry as any; // ou ton interface custom
        const file = await fileHandle.getFile();
        console.log("FICHIER:", file.name, file.size);
      }

      if (entry.kind === "directory") {
        console.log("SOUS DOSSIER:", entry.name);
      }
    }
  }

  return (
    <div className="w-full h-screen bg-background flex items-center justify-center">
      <button
        onClick={pickFolder}
        className="px-4 py-2 rounded bg-blue-600 text-white"
      >
        Pick Folder
      </button>
    </div>
  );
}


/* const panels = [
  {
    name: "Outliner",
    content: (
      <div className="p-4">
        <h3 className="text-sm font-semibold mb-4">Outliner</h3>
        <div className="space-y-2 text-xs">
          <div className="text-muted-foreground">Object List</div>
          <div className="text-muted-foreground">Hierarchy View</div>
        </div>
      </div>
    ),
  },
  {
    name: "Editor",
    content: (
      <div className="p-4">
        <h3 className="text-sm font-semibold mb-4">Editor</h3>
        <div className="space-y-2 text-xs">
          <div className="text-muted-foreground">Code Editor</div>
          <div className="text-muted-foreground">File Management</div>
        </div>
      </div>
    ),
  },
  {
    name: "Properties",
    content: (
      <div className="p-4">
        <h3 className="text-sm font-semibold mb-4">Properties</h3>
        <div className="space-y-2 text-xs">
          <div className="text-muted-foreground">Object Properties</div>
          <div className="text-muted-foreground">Settings Panel</div>
        </div>
      </div>
    ),
  },
  {
    name: "Viewport",
    content: (
      <div className="p-4">
        <h3 className="text-sm font-semibold mb-4">Viewport</h3>
        <div className="space-y-2 text-xs">
          <div className="text-muted-foreground">3D View</div>
          <div className="text-muted-foreground">Render Area</div>
        </div>
      </div>
    ),
  },
  {
    name: "Timeline",
    content: (
      <div className="p-4">
        <h3 className="text-sm font-semibold mb-4">Timeline</h3>
        <div className="space-y-2 text-xs">
          <div className="text-muted-foreground">Animation Frames</div>
          <div className="text-muted-foreground">Keyframes</div>
        </div>
      </div>
    ),
  },
  {
    name: "Console",
    content: (
      <div className="p-4">
        <h3 className="text-sm font-semibold mb-4">Console</h3>
        <div className="space-y-2 text-xs">
          <div className="text-muted-foreground">Debug Output</div>
          <div className="text-muted-foreground">Errors & Warnings</div>
        </div>
      </div>
    ),
  },
];
 */
