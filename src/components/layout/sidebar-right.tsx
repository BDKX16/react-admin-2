import * as React from "react";
import { Plus, ServerOff, Server, Router } from "lucide-react";
import { Calendars } from "@/components/layout/calendars";
import { DatePicker } from "@/components/layout/date-picker";
import { Bell, BellDot } from "lucide-react";
import {
  Menubar,
  MenubarContent,
  MenubarMenu,
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
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Download } from "lucide-react";
import { NotificationMenu } from "../NotificationMenu";
import useMqtt from "@/hooks/useMqtt";
import useFetchAndLoad from "@/hooks/useFetchAndLoad";
import { getSchedules, addDeviceSchedule } from "@/services/private";
import useDevices from "@/hooks/useDevices";
import { TourMenubarContent } from "../onboarding/TourMenu";
import { BookOpen } from "lucide-react";

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
      items: [],
    },
    {
      name: "Riegos",
      items: [],
    },
  ],
};

export function SidebarRight({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { mqttStatus } = useMqtt();
  const { loading, callEndpoint } = useFetchAndLoad();
  const { selectedDevice } = useDevices();
  const [calendars, setCalendar] = React.useState(data.calendars);
  const [eventData, setEventData] = React.useState({
    startDate: "",
    text: "",
    title: "",
    riegoActivo: false,
    color: "blue",
  });
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  React.useEffect(() => {
    const fetchData = async () => {
      const res = await callEndpoint(getSchedules(selectedDevice.dId));

      let nextEvents = {
        name: "Proximos Eventos",
        items: res.data.nextEvents.map((x) => ({
          title: x.title,
          date: x.startDate,
          checked: x.read,
          id: x._id,
        })),
      };
      let riegos = {
        name: "Riegos",
        items: res.data.irrigationEvents.map((x) => ({
          title: x.title,
          date: x.startDate,
          checked: x.read,
          id: x._id,
        })),
      };
      setCalendar([nextEvents, riegos]);
    };
    if (selectedDevice) {
      fetchData();
    }
  }, [selectedDevice]);

  const handleEventChange = (key, value) => {
    setEventData({ ...eventData, [key]: value });
  };

  const handleCreateEvent = async () => {
    const toSend = {
      ...eventData,
      endDate: eventData.startDate,
      dId: selectedDevice.dId,
      color: "blue",
    };
    const response = await callEndpoint(
      addDeviceSchedule({ newSchedule: toSend })
    );

    if (!response.error) {
      setEventData({
        startDate: "",
        text: "",
        title: "",
        riegoActivo: false,
        color: "blue",
      });

      const res = await callEndpoint(getSchedules(selectedDevice.dId));

      let nextEvents = {
        name: "Proximos Eventos",
        items: res.data.nextEvents.map((x) => ({
          title: x.title,
          date: x.startDate,
          checked: x.read,
          id: x._id,
        })),
      };
      let riegos = {
        name: "Riegos",
        items: res.data.irrigationEvents.map((x) => ({
          title: x.title,
          date: x.startDate,
          checked: x.read,
          id: x._id,
        })),
      };
      setCalendar([nextEvents, riegos]);
      setIsDialogOpen(false);
    }
  };

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
        <Calendars calendars={calendars} selectedDevice={selectedDevice} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <SidebarMenuButton>
                  <Plus />
                  <span>Añadir evento</span>
                </SidebarMenuButton>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Evento</DialogTitle>
                  <DialogDescription>
                    Rellena los campos para crear un nuevo evento.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                  <Label>Fecha del evento</Label>
                  <Calendar
                    selected={
                      eventData.startDate
                        ? new Date(eventData.startDate)
                        : undefined
                    }
                    onDayClick={(date) => handleEventChange("startDate", date)}
                  />

                  <Label>Título</Label>
                  <Input
                    value={eventData.title}
                    onChange={(e) => handleEventChange("title", e.target.value)}
                  />
                  <Label>Descripción</Label>
                  <Input
                    value={eventData.text}
                    onChange={(e) => handleEventChange("text", e.target.value)}
                  />
                  {selectedDevice?.template?.company === "confi-plant" && (
                    <>
                      <Label>Evento de riego</Label>
                      <Switch
                        checked={eventData.riegoActivo}
                        onCheckedChange={(value) =>
                          handleEventChange("riegoActivo", value)
                        }
                      />
                    </>
                  )}
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                  </DialogClose>
                  <Button variant="default" onClick={handleCreateEvent}>
                    Crear
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
              <MenubarTrigger className="cursor-pointer">
                <BookOpen size={17} />
              </MenubarTrigger>
              <TourMenubarContent />
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger>
                {mqttStatus === "online" && (
                  <p className="truncate max-w-[65px]">Online</p>
                )}

                {mqttStatus === "disconnected" && (
                  <p className="text-xs truncate max-w-[65px]">Desconectado</p>
                )}
                {mqttStatus === "connecting" && (
                  <p className="text-xs truncate max-w-[65px]">Conectando</p>
                )}
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
