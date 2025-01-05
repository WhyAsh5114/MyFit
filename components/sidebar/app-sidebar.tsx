import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { HomeButton } from "./client-buttons";
import { SwInstallButton } from "./sw-install-button";
import { ModeToggle } from "../mode-toggle";

export async function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <HomeButton />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/data">Data</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <ModeToggle />
        <SwInstallButton />
        <Suspense fallback={<Skeleton className="h-14 w-full" />}>
          <Button variant="outline">Auth soon!</Button>
        </Suspense>
      </SidebarFooter>
    </Sidebar>
  );
}
