import React from "react";
import FlowProvider from "./FlowContext";
import Loading from "@/components/layout/loading/Loading";

interface ChildProps {
  children: React.ReactNode;
}

export default function Provider({ children }: ChildProps) {
  return (
    <Loading>
      <div className="flex flex-col w-screen h-screen">
        <FlowProvider>{children}</FlowProvider>
      </div>
    </Loading>
  );
}
