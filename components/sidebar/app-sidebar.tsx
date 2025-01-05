import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ModeToggle } from "../mode-toggle";
import { HomeButton, SidebarNavigation } from "./client-buttons";
import { SwInstallButton, SwUpdateButton } from "./sw-buttons";

export async function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="h-fit" asChild>
              <HomeButton />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarNavigation />
      </SidebarContent>
      <SidebarFooter>
        <div className="flex gap-2">
          <ModeToggle />
          <SwUpdateButton />
          <SwInstallButton />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
