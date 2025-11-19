import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import useFetchAndLoad from "../../hooks/useFetchAndLoad";
import { useSnackbar } from "notistack";
import useMqtt from "../../hooks/useMqtt";
import { triggerBulkOTAUpdate } from "../../services/private";

export function OTABulkUpdateModal({ open, onClose, devicesData = [] }) {
  const { callEndpoint } = useFetchAndLoad();
  const { enqueueSnackbar } = useSnackbar();
  const { recived } = useMqtt();

  const [devices, setDevices] = useState([]);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [otaProgress, setOtaProgress] = useState({});
  const [hideFor7Days, setHideFor7Days] = useState(false);

  // Cargar dispositivos cuando se abre el modal o cuando cambian los datos
  useEffect(() => {
    if (open && devicesData.length > 0) {
      setDevices(devicesData);
      // Seleccionar todos los dispositivos por defecto
      setSelectedDevices(devicesData.map((d) => d.dId));
    }
  }, [open, devicesData]);

  // Monitorear progreso OTA via MQTT
  useEffect(() => {
    if (!recived || recived.length === 0) return;

    const otaMessages = recived.filter((msg) => msg.variable === "updater");

    otaMessages.forEach((msg) => {
      if (msg.value) {
        const { ota_status, progress } = msg.value;

        if (ota_status) {
          setOtaProgress((prev) => ({
            ...prev,
            [msg.dId]: {
              status: ota_status,
              progress: progress || 0,
            },
          }));

          // Notificaciones
          if (ota_status === "completed") {
            enqueueSnackbar(
              `✅ Dispositivo ${msg.dId} actualizado correctamente`,
              {
                variant: "success",
              }
            );

            // Verificar si todos los dispositivos seleccionados terminaron
            setOtaProgress((prev) => {
              const allCompleted = selectedDevices.every((dId) => {
                const deviceProgress =
                  dId === msg.dId ? { status: "completed" } : prev[dId];
                return (
                  deviceProgress &&
                  (deviceProgress.status === "completed" ||
                    deviceProgress.status === "failed")
                );
              });

              if (allCompleted && updating) {
                // Todos terminaron, cerrar modal después de 2 segundos
                setTimeout(() => {
                  setUpdating(false);
                  onClose(false);
                }, 2000);
              }

              return prev;
            });
          } else if (ota_status === "failed") {
            enqueueSnackbar(`❌ Error actualizando dispositivo ${msg.dId}`, {
              variant: "error",
            });

            // Verificar si todos los dispositivos seleccionados terminaron
            setOtaProgress((prev) => {
              const allCompleted = selectedDevices.every((dId) => {
                const deviceProgress =
                  dId === msg.dId ? { status: "failed" } : prev[dId];
                return (
                  deviceProgress &&
                  (deviceProgress.status === "completed" ||
                    deviceProgress.status === "failed")
                );
              });

              if (allCompleted && updating) {
                // Todos terminaron, cerrar modal después de 2 segundos
                setTimeout(() => {
                  setUpdating(false);
                  onClose(false);
                }, 2000);
              }

              return prev;
            });
          }
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recived]);

  const handleSelectDevice = (dId) => {
    setSelectedDevices((prev) =>
      prev.includes(dId) ? prev.filter((id) => id !== dId) : [...prev, dId]
    );
  };

  const handleBulkUpdate = async () => {
    if (selectedDevices.length === 0) {
      enqueueSnackbar("Selecciona al menos un dispositivo", {
        variant: "warning",
      });
      return;
    }

    setUpdating(true);
    try {
      const response = await callEndpoint(
        triggerBulkOTAUpdate({ deviceIds: selectedDevices })
      );

      if (!response.error && response.data) {
        const data = response.data.data || response.data;
        const successful = data.successful || [];
        const failed = data.failed || [];

        if (successful.length > 0) {
          enqueueSnackbar(
            `🚀 Actualización iniciada para ${successful.length} dispositivo(s)`,
            { variant: "success" }
          );
        }

        if (failed.length > 0) {
          failed.forEach((f) => {
            enqueueSnackbar(`❌ ${f.dId}: ${f.reason}`, { variant: "error" });
          });

          // Si todos fallaron, permitir cerrar
          if (successful.length === 0) {
            setUpdating(false);
          }
        }
      } else {
        enqueueSnackbar("Error al iniciar actualización", { variant: "error" });
      }
    } catch (error) {
      console.error("Error triggering updates:", error);
      enqueueSnackbar("Error al iniciar actualización", { variant: "error" });
    } finally {
      setUpdating(false);
    }
  };

  const getProgressForDevice = (dId) => {
    return otaProgress[dId] || null;
  };

  return (
    <Dialog open={open} onOpenChange={updating ? undefined : onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            Actualizacion Disponible
          </DialogTitle>
          <DialogDescription>
            Selecciona los dispositivos conectados que deseas actualizar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {devices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Cargando dispositivos...
              </p>
            </div>
          ) : devices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
              <h3 className="text-lg font-semibold">
                No hay dispositivos con actualizaciones disponibles
              </h3>
              <p className="text-sm text-muted-foreground">
                Todos tus dispositivos están al día
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    Dispositivos para actualizar
                  </p>
                  <div className="text-sm text-muted-foreground">
                    <strong>{selectedDevices.length}</strong> de{" "}
                    <strong>{devices.length}</strong> seleccionados
                  </div>
                </div>

                {/* Cards horizontales con scroll */}
                <ScrollArea className="w-full whitespace-nowrap">
                  <div className="flex gap-3 pb-4">
                    {devices.map((device) => {
                      const progress = getProgressForDevice(device.dId);
                      const isUpdating =
                        progress &&
                        ["downloading", "installing", "pending"].includes(
                          progress.status
                        );
                      const isSelected = selectedDevices.includes(device.dId);

                      return (
                        <Card
                          key={device.dId}
                          className={`relative flex-shrink-0 w-32 h-40 cursor-pointer transition-all rounded-md ${
                            isUpdating ? "opacity-60 cursor-not-allowed" : ""
                          } ${
                            isSelected
                              ? "border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)] border-2"
                              : "border hover:border-brand-primary/50"
                          }`}
                          onClick={() =>
                            !isUpdating && handleSelectDevice(device.dId)
                          }
                        >
                          {/* Checkbox en la esquina superior derecha */}
                          <div className="absolute top-2 right-2 z-10">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() =>
                                handleSelectDevice(device.dId)
                              }
                              onClick={(e) => e.stopPropagation()}
                              disabled={isUpdating}
                              className="bg-background"
                            />
                          </div>

                          {/* Badge de crítica en la esquina superior izquierda */}
                          {device.availableFirmware?.isCritical && (
                            <div className="absolute top-2 left-2 z-10">
                              <Badge
                                variant="destructive"
                                className="text-xs px-1.5 py-0.5"
                              >
                                <AlertTriangle className="h-3 w-3" />
                              </Badge>
                            </div>
                          )}

                          {/* Imagen del dispositivo */}
                          <div className="flex items-center justify-center h-24 bg-muted/30 rounded-t-md overflow-hidden">
                            <img
                              src="/images/Confi4Sockets.webp"
                              alt={device.name || "Device"}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Info del dispositivo */}
                          <div className="p-2 space-y-1">
                            <p
                              className="text-xs font-medium truncate"
                              title={device.name || device.dId}
                            >
                              {device.name || device.dId}
                            </p>

                            {/* Progress bar si está actualizando */}
                            {progress ? (
                              <div className="space-y-1">
                                <Progress
                                  value={progress.progress}
                                  className="h-1"
                                />
                                <div className="flex items-center justify-between">
                                  <Badge
                                    variant={
                                      progress.status === "completed"
                                        ? "default"
                                        : progress.status === "failed"
                                        ? "destructive"
                                        : "secondary"
                                    }
                                    className="text-[10px] px-1 py-0"
                                  >
                                    {progress.status}
                                  </Badge>
                                  <span className="text-[10px] text-muted-foreground">
                                    {progress.progress}%
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between text-[10px]">
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-1 py-0"
                                >
                                  {device.currentVersion}
                                </Badge>
                                <span className="text-muted-foreground">→</span>
                                <Badge className="text-[10px] px-1 py-0">
                                  {device.availableFirmware?.version}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>

              {/* Changelog de dispositivo seleccionado único */}
              {selectedDevices.length === 1 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Notas de la versión:</p>
                  <p className="text-sm text-muted-foreground">
                    {devices.find((d) => d.dId === selectedDevices[0])
                      ?.availableFirmware?.changelog ||
                      "Sin información de cambios"}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex items-center gap-2 mr-auto">
            <Checkbox
              id="hide-7days"
              checked={hideFor7Days}
              onCheckedChange={setHideFor7Days}
              disabled={updating}
            />
            <label
              htmlFor="hide-7days"
              className="text-sm text-muted-foreground cursor-pointer"
            >
              No mostrar por 7 días
            </label>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onClose(hideFor7Days)}
              disabled={updating}
            >
              {updating ? "Cerrar" : "Cancelar"}
            </Button>
            {!updating && selectedDevices.length > 0 && (
              <Button
                onClick={handleBulkUpdate}
                disabled={selectedDevices.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Actualizar {selectedDevices.length} dispositivo(s)
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
