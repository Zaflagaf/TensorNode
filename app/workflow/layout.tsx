import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/frontend/components/ui/shadcn/resizable";
import {
  SidebarInset,
  SidebarProvider,
} from "@/frontend/components/ui/shadcn/sidebar";
import { Toaster } from "@/frontend/components/ui/shadcn/sonner";
import WorkflowLeftSidebar from "@/frontend/components/ui/workflow-interface/left-sidebar/LeftSidebar";
import WorkflowRightSidebar from "@/frontend/components/ui/workflow-interface/right-sidebar/RightSidebar";
import TopTabs from "@/frontend/components/ui/workflow-interface/top-tabs/TopTabs";
import type React from "react";

export default async function WorkflowLayout({
  children,
}: {
  children: React.ReactNode;
}) {


  return (
    <div className="w-[100svw] h-[100svh]">
      <SidebarProvider defaultOpen={true}>
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel minSize={15} defaultSize={15}>
            <WorkflowLeftSidebar />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>
            <Toaster />
            <SidebarInset className="w-full h-full">
              <TopTabs />
              {children}
            </SidebarInset>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel minSize={15} defaultSize={15}>
            <WorkflowRightSidebar />
          </ResizablePanel>
        </ResizablePanelGroup>
      </SidebarProvider>
    </div>
  );
}
