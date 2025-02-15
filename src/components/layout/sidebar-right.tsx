import * as React from "react";
import { Plus, ServerOff, Server, Router } from "lucide-react";

import { Calendars } from "@/components/layout/calendars";
import { DatePicker } from "@/components/layout/date-picker";
import { NavUser } from "@/components/layout/nav-user";
import { Bell, BellDot } from "lucide-react";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";

import { Download } from "lucide-react";
import { NotificationMenu } from "../NotificationMenu";
import useMqtt from "@/hooks/useMqtt";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  calendars: [
    {
      name: "Proximos Eventos",
      items: ["Defoliar", "Fertilizar", "Revisar plagas"],
    },
    {
      name: "Riegos",
      items: ["Regar 5pm", "Regar 1am"],
    },
  ],
};

export function SidebarRight({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { mqttStatus } = useMqtt();
  return (
    <Sidebar
      collapsible="none"
      className="sticky hidden lg:flex top-0 h-svh border-l"
      {...props}
    >
      <SidebarHeader className="h-16 border-b border-sidebar-border">
        <a
          href="https://play.google.com/store/apps/details?id=com.xavigmp.confiplant"
          target="_blank"
          className="flex gap-2 items-center justify-center h-full text-primary-500"
        >
          <Download size={20} />
          <p>Instalar aplicacion</p>
        </a>
      </SidebarHeader>
      <SidebarContent>
        <DatePicker />
        <SidebarSeparator className="mx-0" />
        <Calendars calendars={data.calendars} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Plus />
              <span>Añadir evento</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          <Menubar className="flex justify-evenly">
            <MenubarMenu>
              <MenubarTrigger>
                <Bell size={17} />
              </MenubarTrigger>
              <MenubarContent className="w-[380px]">
                <NotificationMenu />
              </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger>
                {mqttStatus === "online" && "Online"}

                {mqttStatus === "disconnected" && "Desconectado"}
                {mqttStatus === "connecting" && "Conectando..."}
              </MenubarTrigger>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger>
                {mqttStatus === "online" && <Server size={17} />}
                {mqttStatus === "disconnected" && <ServerOff size={17} />}
                {mqttStatus === "connecting" && <Router size={17} />}
              </MenubarTrigger>
            </MenubarMenu>
          </Menubar>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
