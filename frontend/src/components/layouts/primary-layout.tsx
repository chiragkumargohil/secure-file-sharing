import React, { useState } from "react";
import { AppSidebar } from "../app-sidebar";
import { Separator } from "../ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "../ui/sidebar";

const PrimaryLayout = ({ children }: { children: React.ReactNode }) => {
  const [title, setTitle] = useState("");

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex sticky top-0 bg-background h-16 z-10 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h4 className="text-lg font-semibold">{title}</h4>
        </header>

        <div className="p-4 h-full">
          {React.cloneElement(children as React.ReactElement, {
            setTitle,
          })}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default PrimaryLayout;
