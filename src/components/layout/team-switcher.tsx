"use client";

import * as React from "react";
import { ChevronsUpDown, Plus } from "lucide-react";

import useFetchAndLoad from "@/hooks/useFetchAndLoad";
import { Button } from "@/components/ui/button";
import { selectDevice, newDevice } from "@/services/public";

import { Input } from "../ui/input";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { enqueueSnackbar } from "notistack";

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string;
    logo: React.ElementType;
    plan: string;
    dId: string;
    selected: boolean;
  }[];
}) {
  const { loading, callEndpoint } = useFetchAndLoad();
  const { isMobile } = useSidebar();
  const [activeTeam, setActiveTeam] = React.useState(
    teams.find((t) => t.selected)
  );
  const { setReload } = useDevices();
  const [serialInput, setSerialInput] = React.useState("");

  const [nameInput, setNameInput] = React.useState("");

  const handleSetActive = async (device) => {
    let data = await callEndpoint(selectDevice(device.dId));

    if (data.data.status == "success") {
      setReload(true);
      setActiveTeam(device);
    } else {
      console.log("Error al seleccionar dispositivo");
    }
  };

  const handleSubmit = async () => {
    if (serialInput.length == 10 && nameInput != "") {
      let data = await callEndpoint(newDevice(serialInput, nameInput));

      if (data.error == false) {
        enqueueSnackbar("Dispositivo agregado: " + nameInput, {
          variant: "success",
        });

        setSerialInput("");
        setNameInput("");
      }
      return;
    } else {
      enqueueSnackbar("Datos invalidos", { variant: "error" });
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Dialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                disabled={loading || !teams.length}
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  {activeTeam && <activeTeam.logo className="size-4" />}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {activeTeam ? activeTeam.name : "No hay dispositivos"}
                  </span>
                  <span className="truncate text-xs">
                    {activeTeam ? activeTeam.plan : "Carga el primero."}
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
                  <div className="flex size-6 items-center justify-center rounded-sm border">
                    <team.logo className="size-4 shrink-0" />
                  </div>
                  {team.name}
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DialogTrigger asChild>
                <DropdownMenuItem className="gap-2 p-2">
                  <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                    <Plus className="size-4" />
                  </div>
                  <div className="font-medium text-muted-foreground">
                    Agregar dispositivo
                  </div>
                </DropdownMenuItem>
              </DialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar dispositivo</DialogTitle>
              <DialogDescription>
                Ingresa el codigo de diez digitos que vino on tu dispositivo
                Confi Kit
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Input
                placeholder="Ej: a1b2c3d4e5"
                onKeyUp={(e) => setSerialInput(e.target.value)}
              ></Input>
              <Input
                placeholder="Nombre del dispositivo"
                onKeyUp={(e) => setNameInput(e.target.value)}
              ></Input>
              <Button type="submit" onClick={handleSubmit}>
                Confirmar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
