import { cn } from "@/frontend/lib/utils";
import useTerminalStore from "@/frontend/store/panels-store/terminal-store";
import { Log, LogStatus } from "@/frontend/types";
import { Check, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function LogLine({ log, n }: { log: Log; n: number }) {
  return (
    <div
      className={cn(
        "flex gap-1 m-px !font-mono text-muted-foreground",
        n % 2 === 0 ? "bg-neutral-900" : "bg-neutral-950"
      )}
    >
      {log.status === LogStatus.error && (
        <>
          <X className="size-3 text-foreground p-px bg-hue-20 rounded-xs" />
          Python: {log.message}
        </>
      )}
      {log.status === LogStatus.success && (
        <>
          <Check className="size-3 text-foreground p-px bg-hue-140 rounded-xs" />
          Python: {log.message}
        </>
      )}
      {log.status === LogStatus.info && (
        <>
          <p className="size-3 text-foreground p-px" />
          {log.message}
        </>
      )}
    </div>
  );
}

export default function WorkflowTerminalPanel() {
  const logs = useTerminalStore((state) => state.logs);
  const containerRef = useRef<HTMLDivElement>(null);

  // garde si l'utilisateur est au bottom ou pas
  const [isStuckBottom, setIsStuckBottom] = useState(true);

  // détecte si l’utilisateur remonte / descend
  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;

    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 5;

    setIsStuckBottom(isAtBottom);
  };

  // auto-scroll si on est collé au bas
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (isStuckBottom) {
      el.scrollTop = el.scrollHeight;
    }
  }, [logs, isStuckBottom]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex flex-col text-xxs overflow-y-auto h-full"
    >
      {logs.map((log, key) => (
        <LogLine key={key} n={key} log={log} />
      ))}
    </div>
  );
}
