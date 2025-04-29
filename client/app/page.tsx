import Editor from "@/components/other/Editor";
import FlowProvider from "@/context/FlowContext";
import PropertiesPanel from "@/components/other/PropertiesPanel";
import ToolsPanel from "@/components/other/ToolsPanel";
import IAPanel from "@/components/IA panel/IAPanel";
import StatusBar from "@/components/other/StatusBar";
import Navbar from "@/components/other/Navbar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import "./page.scss";

export default function App() {
  return (
    <FlowProvider>
      <div id="app-wrapper">
        {/* Navbar en haut */}
        <div className="panel" style={{ gridRow: "1", gridColumn: "1 / 4" }}>
          {/*
          <Navbar />
        */}
        </div>

        {/* Ligne centrale avec Editor + PropertiesPanel en redimensionnable */}
        <ResizablePanelGroup
          direction="horizontal"
          style={{ gridRow: "1/3", gridColumn: "1 / 4", display: "flex" }}
        >
          {/* Editor (gauche + centre) */}
          <ResizablePanel defaultSize={75} minSize={30}>
            <div className="panel h-full w-full">
              <Editor />
            </div>
          </ResizablePanel>

          {/* Handle */}
          <ResizableHandle />

          {/* PropertiesPanel (droite) */}
          <ResizablePanel defaultSize={25} minSize={15}>
            <div className="panel h-full w-full">
              <IAPanel />
              {/*<PropertiesPanel />*/}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>

        {/* Status bar en bas */}
        <div className="panel" style={{ gridRow: "3", gridColumn: "1 / 4" }}>
          <StatusBar />
        </div>
      </div>
    </FlowProvider>
  );
}
