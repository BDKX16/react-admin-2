"use client";

import * as React from "react";
import { ChevronsUpDown, Plus, Loader2 } from "lucide-react";

import useFetchAndLoad from "@/hooks/useFetchAndLoad";
import { selectDevice } from "@/services/public";
import { AddDeviceDialog } from "@/components/add-device-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import useDevices from "@/hooks/useDevices";

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string;
    logo: React.ElementType;
    plan: string;
    dId: string;
    selected: boolean;
    modelId?: string;
  }[];
}) {
  const { loading, callEndpoint } = useFetchAndLoad();
  const { isMobile } = useSidebar();
  const [activeTeam, setActiveTeam] = React.useState(
    teams.find((t) => t.selected)
  );
  const { setReload, isSwitchingDevice, setIsSwitchingDevice } = useDevices();
  const [isAddDeviceDialogOpen, setIsAddDeviceDialogOpen] =
    React.useState(false);

  // Efecto para actualizar el dispositivo activo cuando cambien los teams
  React.useEffect(() => {
    const selectedTeam = teams.find((t) => t.selected);
    if (selectedTeam && (!activeTeam || activeTeam.dId !== selectedTeam.dId)) {
      setActiveTeam(selectedTeam);
      setIsSwitchingDevice(false);
    }
  }, [teams, activeTeam]);

  const handleSetActive = async (device) => {
    setIsSwitchingDevice(true);
    const startTime = Date.now();

    let data = await callEndpoint(selectDevice(device.dId));

    if (data.data.status == "success") {
      // Asegurar al menos 1 segundo de animación
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(1000 - elapsed, 0);

      setTimeout(() => {
        setReload(true);
        setActiveTeam(device);
      }, remainingTime);
    } else {
      console.log("Error al seleccionar dispositivo");
      setIsSwitchingDevice(false);
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              disabled={loading || !teams.length}
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              data-tour="team-switcher"
            >
              <div
                className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground"
                style={{
                  backgroundColor:
                    activeTeam?.modelId === "default" ||
                    activeTeam?.modelId === "default v2"
                      ? "oklch(55% .26 155)"
                      : "hsl(var(--sidebar-primary))",
                }}
              >
                {isSwitchingDevice ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  activeTeam &&
                  (activeTeam.modelId === "default" ||
                  activeTeam.modelId === "default v2" ? (
                    <img src="/logo.svg" alt="Confi Plant" className="size-6" />
                  ) : (
                    <activeTeam.logo className="size-4" />
                  ))
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {loading
                    ? "Cargando..."
                    : activeTeam
                    ? activeTeam.name
                    : "No hay dispositivos"}
                </span>
                <span className="truncate text-xs">
                  {loading
                    ? "Obteniendo dispositivos..."
                    : activeTeam
                    ? activeTeam.plan
                    : "Carga el primero."}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Dispositivos
            </DropdownMenuLabel>
            {teams.map((team, index) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() => handleSetActive(team)}
                className="gap-2 p-2"
              >
                <div
                  className="flex size-6 items-center justify-center rounded-sm border"
                  style={{
                    backgroundColor:
                      team.modelId === "default" ||
                      team.modelId === "default v2"
                        ? "transparent"
                        : "transparent",
                  }}
                >
                  {team.modelId === "default" ||
                  team.modelId === "default v2" ? (
                    <img
                      src="/logo.svg"
                      alt="Confi Plant"
                      className="size-4 shrink-0"
                    />
                  ) : (
                    <team.logo className="size-4 shrink-0" />
                  )}
                </div>
                {team.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2"
              onClick={() => setIsAddDeviceDialogOpen(true)}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">
                Agregar dispositivo
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <AddDeviceDialog
          open={isAddDeviceDialogOpen}
          onOpenChange={setIsAddDeviceDialogOpen}
        />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
