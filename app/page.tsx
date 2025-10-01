import { cn } from "@/frontend/lib/utils";
import { GitBranch, GitBranchIcon, GitFork, Plus } from "lucide-react";

const gradients: Record<string, string> = {
  red: "from-red-400 to-red-600",
  blue: "from-blue-400 to-blue-600",
  green: "from-green-400 to-green-600",
  amber: "from-amber-400 to-amber-600",
  slate: "from-slate-400 to-slate-600",
  indigo: "from-indigo-400 to-indigo-600",
  purple: "from-purple-400 to-purple-600",
  cyan: "from-cyan-400 to-cyan-600",
};

function Node({ color }: { color: string }) {
  return (
    <div className="flex flex-col w-full h-full border bg-gradient-to-br from-white to-neutral-50 rounded-2xl border-muted-foreground">
      <div
        className={cn(
          `h-[40px] flex px-4 py-2 font-bold text-white bg-gradient-to-br ${gradients[color]} rounded-t-2xl`
        )}
      >
        Node
      </div>
      <div className="flex px-4 py-2 h-[40px] bg-gradient-to-b from-white to-neutral-50 rounded-b-2xl"></div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="flex w-screen h-screen">
      <div className="flex flex-col w-full gap-40 px-50 pt-50">
        <div className="flex flex-col w-full h-full">
          <div className="text-5xl font-bold">
            <div className="flex items-center justify-center gap-2 w-fit">
              <p>TensorNode.</p>
            </div>
          </div>
          <div className="text-lg text-muted-foreground">
             L’outil visuel qui transforme la conception d’IA en jeu d’enfant
          </div>
          <div className="flex gap-5 mt-5">
            <button className="flex items-center justify-center gap-2 px-4 py-2 text-black border border-black rounded-lg cursor-pointer">
              <Plus className="stroke-1" /> <p>Create</p>
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2 text-white bg-black rounded-lg cursor-pointer">
              Learn More
            </button>
          </div>
        </div>

        <div className="relative overflow-y-hidden bg-white">
          <div
            className="relative grid w-full h-[600px] grid-cols-7 grid-rows-3 gap-5 px-5 py-5"
            /*             style={{
              backgroundImage: `radial-gradient(circle 2px, hsl(0,0%,90%) 100%, transparent 100%)`,
              backgroundSize: `20px 20px`,
            }} */
          >
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[rgba(255,255,255,0.2)] to-white" />

            <div className="col-span-1">
              <Node color="blue" />
            </div>
            <div className="col-span-3">
              <Node color="red" />
            </div>
            <div className="col-span-1 row-span-2">
              <Node color="purple" />
            </div>
            <div className="col-span-2 row-span-2">
              <Node color="green" />
            </div>
            <div className="col-span-2 row-span-2">
              <Node color="indigo" />
            </div>
            <div className="col-span-1 row-span-2">
              <Node color="amber" />
            </div>
            <div className="col-span-1 row-span-2">
              <Node color="slate" />
            </div>
            <div className="col-span-3 row-span-2">
              <Node color="cyan" />
            </div>
          </div>
        </div>
        {/*         <div className="relative flex w-auto h-[500px]">
          <img
            src="/images/nodes.png"
            alt="nodes"
            className="w-full h-full filter grayscale contrast-200 brightness-75"
          />
          <div className="absolute inset-0 bg-radial from-transparent to-white"></div>
        </div> */}
      </div>
    </div>
  );
}
