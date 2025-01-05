"use client";

import {
  BookOpenTextIcon,
  CalendarIcon,
  ChartNoAxesCombinedIcon,
  DumbbellIcon,
  GithubIcon,
  GlobeLockIcon,
  HandCoinsIcon,
  LayoutDashboardIcon,
  NotebookTextIcon,
  PackagePlusIcon,
  RssIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../ui/sidebar";

export function HomeButton() {
  const { setOpenMobile } = useSidebar();

  return (
    <Button
      className="w-full justify-start text-start h-fit"
      variant="secondary"
      onClick={() => setOpenMobile(false)}
      asChild
    >
      <Link className="text-xl font-semibold w-full p-2" href="/">
        <Image src="favicon.ico" alt="logo" width={48} height={48} />
        MyFit <span className="font-normal text-sm ml-auto">v4</span>
      </Link>
    </Button>
  );
}

export function SidebarNavigation() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  const linkGroups = [
    {
      label: "Application",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboardIcon },
        {
          label: "Progression",
          href: "/progression",
          icon: ChartNoAxesCombinedIcon,
        },
      ],
    },
    {
      label: "Items",
      items: [
        { label: "Workouts", href: "/workouts", icon: DumbbellIcon },
        { label: "Mesocycles", href: "/mesocycles", icon: NotebookTextIcon },
        {
          label: "Exercise splits",
          href: "/exercise-splits",
          icon: CalendarIcon,
        },
      ],
    },
    {
      label: "Resources",
      items: [
        { label: "Docs", href: "/docs", icon: BookOpenTextIcon },
        { label: "Changelog", href: "/changelog", icon: PackagePlusIcon },
        { label: "Blog", href: "/blog", icon: RssIcon },
      ],
    },
    {
      label: "More",
      items: [
        { label: "Donations", href: "/donations", icon: HandCoinsIcon },
        {
          label: "Github",
          href: "https://github.com/WhyAsh5114/MyFit",
          icon: GithubIcon,
        },
        {
          label: "Privacy policy",
          href: "/privacy-policy",
          icon: GlobeLockIcon,
        },
      ],
    },
  ];

  return linkGroups.map((group) => (
    <SidebarGroup key={group.label}>
      <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {group.items.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                isActive={pathname.startsWith(item.href)}
                onClick={() => setOpenMobile(false)}
                asChild
              >
                <Link href={item.href}>
                  <item.icon />
                  {item.label}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  ));
}
