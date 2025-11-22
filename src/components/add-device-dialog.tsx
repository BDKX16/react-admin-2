"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import useFetchAndLoad from "@/hooks/useFetchAndLoad";
import { newDevice } from "@/services/public";
import useDevices from "@/hooks/useDevices";
import { enqueueSnackbar } from "notistack";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { deviceTour } from "@/config/tours";

interface AddDeviceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddDeviceDialog({ open, onOpenChange }: AddDeviceDialogProps) {
  const { callEndpoint } = useFetchAndLoad();
  const { setReload, devicesArr, setDevicesArr } = useDevices();
  const { startTour } = useOnboarding();
  const [serialInput, setSerialInput] = React.useState("");
  const [nameInput, setNameInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadingTextIndex, setLoadingTextIndex] = React.useState(0);
  const [fadeIn, setFadeIn] = React.useState(true);

  const loadingTexts = [
    "Preparando tu dispositivo...",
    "Configurando sensores...",
    "Estableciendo conexión...",
    "Sincronizando datos...",
    "Casi listo...",
  ];

  // Efecto para cambiar los textos de carga
  React.useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setLoadingTextIndex((prev) => (prev + 1) % loadingTexts.length);
        setFadeIn(true);
      }, 300);
    }, 2000);

    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSubmit = async () => {
    if (serialInput.length === 10 && nameInput !== "") {
      setIsLoading(true);
      const startTime = Date.now();

      const data = await callEndpoint(newDevice(serialInput, nameInput));

      if (!data.error && data?.data?.status === "success") {
        // Asegurar al menos 5 segundos de animación
        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(5000 - elapsed, 0);

        setTimeout(() => {
          enqueueSnackbar("Dispositivo agregado: " + nameInput, {
            variant: "success",
          });

          setSerialInput("");
          setNameInput("");
          setIsLoading(false);
          setLoadingTextIndex(0);
          setReload(true); // Recargar la lista de dispositivos
          onOpenChange(false); // Cerrar el modal

          // Iniciar tour de dispositivo después de cerrar modal
          setTimeout(() => {
            startTour("device", deviceTour, {
              allowClose: true, // Permitir cerrar con X
              overlayClickNext: false, // No avanzar con click en overlay
            });
          }, 500);
        }, remainingTime);
      } else {
        setIsLoading(false);
        enqueueSnackbar("Error al agregar dispositivo", { variant: "error" });
      }
      return;
    } else {
      enqueueSnackbar("Datos invalidos", { variant: "error" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={isLoading ? undefined : onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar dispositivo</DialogTitle>
          <DialogDescription>
            Ingresa el codigo de diez digitos que vino con tu dispositivo Confi
            Kit
          </DialogDescription>
        </DialogHeader>

        {/* Ilustración SVG */}
        <div className="flex justify-center py-4">
          <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-primary"
          >
            {/* Dispositivo base */}
            <rect
              x="30"
              y="40"
              width="60"
              height="50"
              rx="8"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />

            {/* Pantalla/Display */}
            <rect
              x="40"
              y="50"
              width="40"
              height="20"
              rx="4"
              stroke="currentColor"
              strokeWidth="2"
              fill="currentColor"
              opacity="0.1"
            />

            {/* Botones/Controles */}
            <circle cx="50" cy="80" r="3" fill="currentColor" />
            <circle cx="60" cy="80" r="3" fill="currentColor" />
            <circle cx="70" cy="80" r="3" fill="currentColor" />

            {/* Símbolo de añadir (Plus) */}
            <circle
              cx="85"
              cy="30"
              r="15"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <line
              x1="85"
              y1="22"
              x2="85"
              y2="38"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="77"
              y1="30"
              x2="93"
              y2="30"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Señal WiFi */}
            <path
              d="M 45 25 Q 50 20 55 25"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 42 28 Q 50 17 58 28"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="50" cy="32" r="2" fill="currentColor" />
          </svg>
        </div>

        {isLoading ? (
          // Pantalla de carga
          <div className="flex flex-col items-center justify-center py-4 space-y-6">
            <div className="flex space-x-2">
              <div
                className="w-3 h-3 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className="w-3 h-3 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></div>
              <div
                className="w-3 h-3 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></div>
            </div>
            <p
              className={`text-sm text-muted-foreground text-center transition-opacity duration-300 ${
                fadeIn ? "opacity-100" : "opacity-0"
              }`}
            >
              {loadingTexts[loadingTextIndex]}
            </p>
          </div>
        ) : (
          <DialogFooter className="flex-col sm:flex-row gap-3 sm:gap-2">
            <div className="space-y-1 w-full">
              <Label htmlFor="serial" className="text-xs">
                Código del dispositivo
              </Label>
              <Input
                id="serial"
                placeholder="Ej: a1b2c3d4e5"
                onChange={(e) => setSerialInput(e.target.value)}
                value={serialInput}
              />
            </div>
            <div className="space-y-1 w-full">
              <Label htmlFor="name" className="text-xs">
                Nombre del dispositivo
              </Label>
              <Input
                id="name"
                placeholder="Ej: Cultivo interior"
                onChange={(e) => setNameInput(e.target.value)}
                value={nameInput}
              />
            </div>
            <Button
              type="submit"
              onClick={handleSubmit}
              className="w-full sm:w-auto sm:self-end"
            >
              Confirmar
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
