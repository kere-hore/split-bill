"use client";

import * as React from "react";
import {
  IconCamera,
  IconFileAi,
  IconFileDescription,
  IconHelp,
  IconInnerShadowTop,
  IconReport,
  IconSettings,
  IconUsersGroup,
  IconReceipt,
} from "@tabler/icons-react";

import { NavMain } from "@/shared/components/nav-main";
import { NavSecondary } from "@/shared/components/nav-secondary";
import { NavUser } from "@/shared/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar";
import Link from "next/link";

interface UserData {
  name: string;
  email: string;
  avatar: string;
}

const staticData = {
  navMain: [
    {
      title: "Allocations",
      url: "/allocations",
      icon: IconUsersGroup,
    },
    {
      title: "Settlements",
      url: "/settlement",
      icon: IconReport,
    },
    {
      title: "Bills to Pay",
      url: "/bills-to-pay",
      icon: IconReceipt,
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
  ],
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: UserData;
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const userData = {
    name: user?.name || "User",
    email: user?.email || "user@example.com",
    avatar: user?.avatar || "/avatars/default.jpg",
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Kere Hore</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={staticData.navMain} />
        <NavSecondary items={staticData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
