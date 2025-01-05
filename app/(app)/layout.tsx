import { LinkBreadcrumbs } from "@/components/link-breadcrumbs";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SwEventsHandler } from "@/components/sw-events-handler";
import { Separator } from "@/components/ui/separator";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <main className="p-4 flex flex-col gap-4 w-full max-w-xl mx-auto">
          <div className="flex items-center h-6 gap-2">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-full mr-2" />
            <LinkBreadcrumbs />
          </div>
          {children}
        </main>
      </SidebarProvider>
      <SwEventsHandler />
      <Toaster />
    </>
  );
}
