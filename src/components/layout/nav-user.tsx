import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
  Crown,
  User,
  Settings,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import { Moon, Sun } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { ThemeModeToggle } from "@/components/theme-mode-toggle";
import useAuth from "@/hooks/useAuth";
import useSubscription from "@/hooks/useSubscription";

import { useTheme } from "@/providers/theme-provider";
export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { theme, setTheme } = useTheme();
  const { isMobile } = useSidebar();
  const { logout, auth } = useAuth();
  const navigate = useNavigate();
  const { isPro } = useSubscription();
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);

  const changeTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  const currentPlan = auth?.userData?.plan || "free";
  const isProPlan = isPro();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={auth?.userData?.name} />
                <AvatarFallback className="rounded-lg">CP</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {auth?.userData?.name}
                </span>
                <span className="truncate text-xs">
                  {auth?.userData?.email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="start"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={auth?.userData?.name} />
                  <AvatarFallback className="rounded-lg">CP</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {auth?.userData?.name}
                  </span>
                  <span className="truncate text-xs">
                    {auth?.userData?.email}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => {
                    navigate("/profile");
                  }}
                >
                  <Settings />
                </Button>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                variant="outline"
                size="icon"
                onSelect={(e) => e.preventDefault()}
                onClick={() => changeTheme()}
              >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                Tema
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Dialog
                open={isAccountDialogOpen}
                onOpenChange={setIsAccountDialogOpen}
              >
                <DialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <BadgeCheck />
                    Cuenta
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Mi Cuenta
                    </DialogTitle>
                    <DialogDescription>
                      Gestiona tu información personal y plan de suscripción.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6 py-4">
                    {/* Información del Usuario */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">
                        Información Personal
                      </h3>
                      <div className="grid gap-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="name" className="text-right">
                            Nombre
                          </Label>
                          <Input
                            id="name"
                            value={auth?.userData?.name || ""}
                            className="col-span-3"
                            readOnly
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="email" className="text-right">
                            Email
                          </Label>
                          <Input
                            id="email"
                            value={auth?.userData?.email || ""}
                            className="col-span-3"
                            readOnly
                          />
                        </div>
                      </div>
                    </div>

                    {/* Plan de Suscripción */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">
                        Plan de Suscripción
                      </h3>
                      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {isProPlan ? (
                            <Crown className="h-6 w-6 text-yellow-500" />
                          ) : (
                            <User className="h-6 w-6 text-gray-500" />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                Plan {isProPlan ? "Pro" : "Free"}
                              </span>
                              <Badge
                                variant={isProPlan ? "default" : "secondary"}
                              >
                                {isProPlan ? "Activo" : "Básico"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {isProPlan
                                ? "Acceso completo a todas las funciones premium"
                                : "Funciones básicas de la aplicación"}
                            </p>
                          </div>
                        </div>
                        {!isProPlan ? (
                          <Button
                            size="sm"
                            className="ml-4"
                            onClick={() => {
                              setIsAccountDialogOpen(false);
                              window.location.href = "/subscription";
                            }}
                          >
                            <Sparkles className="h-4 w-4 mr-1" />
                            Ver Planes
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="ml-4"
                            onClick={() => {
                              setIsAccountDialogOpen(false);
                              window.location.href = "/subscription";
                            }}
                          >
                            <Crown className="h-4 w-4 mr-1" />
                            Ver Planes
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <DropdownMenuItem onClick={() => navigate("/payment-history")}>
                <CreditCard />
                Pagos
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <Bell />
                Notificationes
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => logout()}>
              <LogOut />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
