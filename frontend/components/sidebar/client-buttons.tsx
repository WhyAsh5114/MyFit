"use client";

import { authClient } from "@/lib/auth-client";
import {
  BookOpenTextIcon,
  CalendarIcon,
  ChartNoAxesCombinedIcon,
  ChevronUp,
  CogIcon,
  DumbbellIcon,
  GithubIcon,
  GlobeLockIcon,
  HandCoinsIcon,
  LayoutDashboardIcon,
  LoaderCircle,
  LogInIcon,
  LogOutIcon,
  NotebookTextIcon,
  PackagePlusIcon,
  RssIcon,
  User2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
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

export function UserDropdownButtons() {
  const { setOpenMobile } = useSidebar();

  return (
    <>
      <DropdownMenuItem asChild>
        <Link href="/settings" onClick={() => setOpenMobile(false)}>
          <CogIcon /> Settings
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link href="/profile" onClick={() => setOpenMobile(false)}>
          <User2 /> Profile
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem
        className="text-destructive"
        onClick={() => {
          authClient.signOut();
          localStorage.clear();
        }}
      >
        <LogOutIcon />
        Logout
      </DropdownMenuItem>
    </>
  );
}

export function UserDropdownTriggerButton() {
  const session = authClient.useSession();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated || session.isPending) {
    return (
      <SidebarMenuButton variant="outline" className="justify-center" disabled>
        <LoaderCircle className="animate-spin" />
      </SidebarMenuButton>
    );
  }

  if (session.error) {
    toast.error("Failed to fetch user session");
    console.error(session.error);
    return null;
  }

  if (!session.data) {
    return (
      <SidebarMenuButton variant="outline" asChild>
        <Link href="/login">
          <LogInIcon /> Login
        </Link>
      </SidebarMenuButton>
    );
  }

  return (
    <DropdownMenuTrigger asChild>
      <SidebarMenuButton variant="outline">
        <User2 /> {session.data.user.name} <ChevronUp className="ml-auto" />
      </SidebarMenuButton>
    </DropdownMenuTrigger>
  );
}
