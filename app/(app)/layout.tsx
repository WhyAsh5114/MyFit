import { LinkBreadcrumbs } from "@/components/link-breadcrumbs";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SwEventsHandler } from "@/components/sw-events-handler";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { PIDBComponent } from "./pidb-component";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <PIDBComponent />
      <SidebarProvider>
        <AppSidebar />
        <ScrollArea className="h-screen w-full max-w-xl mx-auto">
          <div className="flex items-center min-h-12 gap-2 sticky top-0 bg-background/80 backdrop-blur-sm px-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-6 mr-2" />
            <LinkBreadcrumbs />
          </div>
          <main className="p-4 flex flex-col gap-4 w-full grow">
            {children}
          </main>
        </ScrollArea>
      </SidebarProvider>
      <SwEventsHandler />
      <Toaster />
    </>
  );
}
