import Canvas from "@/components/layout/canvas/Canvas";
import StatusBar from "@/components/other/StatusBar";
import Provider from "@/context/Provider";
import "./page.scss";

export default function App() {
  return (

        <Provider /*initialNodes={initialNodes}*/ /*initialEdges={initialEdges}*/>
          {/* Content */}
          <main className="flex-1 w-full">
            <Canvas />
          </main>

          {/* Footer */}
          <footer className="flex w-full h-10">
            <StatusBar />
          </footer>
        </Provider>
  );
}
