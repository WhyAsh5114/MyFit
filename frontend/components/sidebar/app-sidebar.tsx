import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent } from "../ui/dropdown-menu";
import {
  HomeButton,
  SidebarNavigation,
  UserDropdownButtons,
  UserDropdownTriggerButton,
} from "./client-buttons";
import { SwInstallOrUpdateButton } from "./sw-buttons";

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
        <SidebarMenu className="flex flex-row w-full">
          <SwInstallOrUpdateButton />
          <SidebarMenuItem className="w-full">
            <DropdownMenu>
              <UserDropdownTriggerButton />
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <UserDropdownButtons />
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
