import { LinkBreadcrumbs } from "@/components/link-breadcrumbs";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import SwEventsHandler from "@/components/sw-events-handler";
import { ThemeProvider } from "@/components/theme-provider";
import { Separator } from "@/components/ui/separator";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyFit",
  description: "Open source workout tracker inspired by the RP Hypertrophy App",
};

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/ios/192.png" />
        <meta name="theme-color" content="#3079ca" />
      </head>
      <body
        className={cn(
          inter.className,
          "min-h-screen min-w-full overflow-y-auto overflow-x-hidden"
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
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
        </ThemeProvider>
      </body>
    </html>
  );
}
