"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  LayoutDashboard,
  Bot,
  Command,
  GalleryVerticalEnd,
  ChartNoAxesGanttIcon,
  ChartNoAxesCombined,
  Calendar,
  Settings2,
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
import useDevices from "@/hooks/useDevices";
import { Skeleton } from "../ui/skeleton";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [],
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: LayoutDashboard,
      isActive: true,
      items: [
        {
          title: "Dispositivo",
          url: "/dashboard",
        },
        {
          title: "Graficos",
          url: "/charts",
        },
      ],
    },

    {
      title: "Automatizaciones",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Reglas",
          url: "/rule-engine",
        },
        // {
        //   title: "Timers",
        //   url: "#",
        // },
        // {
        //   title: "Ciclos",
        //   url: "#",
        // },
        {
          title: "Notificaciones",
          url: "/notifications",
        },
        {
          title: "Configuración",
          url: "/device-config",
        },
      ],
    },
    // {
    //   title: "Dispositivos",
    //   url: "#",
    //   icon: Bot,
    //   items: [
    //     {
    //       title: "Lista de dispositivos",
    //       url: "#",
    //     },
    //     {
    //       title: "Agregar dispositivo",
    //       url: "#",
    //     },
    //   ],
    // },
    // {
    //   title: "Configuracion",
    //   url: "#",
    //   icon: Settings2,
    //   items: [
    //     {
    //       title: "Calibrar sensores",
    //       url: "#",
    //     },

    //     {
    //       title: "Notificaciones",
    //       url: "#",
    //     },
    //     {
    //       title: "Contraseña dispositivo",
    //       url: "#",
    //     },
    //   ],
    // },
  ],
  navMainNoDevices: [
    {
      title: "Dashboard",
      url: "#",
      icon: LayoutDashboard,
      isActive: true,
      items: [
        {
          title: "Dispositivo",
          url: "/dashboard",
        },
      ],
    },

    {
      title: "Automatizaciones",
      url: "#",
      icon: BookOpen,
      items: [],
    },
  ],
  projects: [
    {
      name: "Calendario",
      url: "#",
      icon: Calendar,
    },
    {
      name: "Eventos",
      url: "#",
      icon: ChartNoAxesGanttIcon,
    },
    {
      name: "Estadisticas",
      url: "#",
      icon: ChartNoAxesCombined,
    },
  ],
};

const parsePlansName = (plan) => {
  if (plan === "default") {
    return "AutoKit v1";
  } else if (plan === "default v2") {
    return "AutoKit v2";
  } else if (plan === "hidroponics") {
    return "Confi Hydro";
  }
};

export function SidebarLeft({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { devicesArr } = useDevices();
  const updatedTeams = devicesArr.map((item) => {
    return {
      name: item.name,
      dId: item.dId,
      logo: GalleryVerticalEnd,
      plan: parsePlansName(item.modelId),
      selected: item.selected,
    };
  });

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {devicesArr != null ? (
          <TeamSwitcher teams={updatedTeams} />
        ) : (
          <>
            <div className="flex items-center space-x-3 py-2 pl-2">
              <Skeleton className="h-8 w-8 square-full " />
              <div className="space-y-2">
                <Skeleton className="h-3 w-[130px]" />
                <Skeleton className="h-3 w-[80px]" />
              </div>
            </div>
          </>
        )}
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={devicesArr.length === 0 ? data.navMainNoDevices : data.navMain}
        />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
