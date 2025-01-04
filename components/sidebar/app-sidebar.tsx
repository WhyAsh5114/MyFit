import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Suspense } from "react";
import { Skeleton } from "../ui/skeleton";
import { HomeButton } from "./client-buttons";
import { Button } from "../ui/button";

export async function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <HomeButton />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter>
        <Suspense fallback={<Skeleton className="h-14 w-full" />}>
          <Button variant="outline">Auth soon!</Button>
        </Suspense>
      </SidebarFooter>
    </Sidebar>
  );
}
