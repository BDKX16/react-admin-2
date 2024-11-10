"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "@/components/layout/nav-main";
import { NavProjects } from "@/components/layout/nav-projects";
import { NavUser } from "@/components/layout/nav-user";
import { TeamSwitcher } from "@/components/layout/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Sweet home alabahama",
      logo: GalleryVerticalEnd,
      plan: "AutoKit 1",
    },
    {
      name: "Living",
      logo: AudioWaveform,
      plan: "AutoKit 2",
    },
    {
      name: "Hidroponia",
      logo: Command,
      plan: "ConfiWater",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Dispositivo",
          url: "#",
        },
        {
          title: "Graficos",
          url: "#",
        },
      ],
    },
    {
      title: "Devices",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Lista de dispositivos",
          url: "#",
        },
        {
          title: "Agregar dispositivo",
          url: "#",
        },
      ],
    },
    {
      title: "Automatizaciones",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Limites",
          url: "#",
        },
        {
          title: "Timers",
          url: "#",
        },
        {
          title: "Ciclos",
          url: "#",
        },
        {
          title: "Alertas",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Contraseña dispositivo",
          url: "#",
        },
        {
          title: "Calibrar sensores",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

export function SidebarLeft({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
