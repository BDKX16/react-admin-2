import { useEffect, useState } from "react";
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
import {
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
  X,
  RefreshCw,
  AlertTriangle,
  XCircle,
  Zap,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import useFetchAndLoad from "../../hooks/useFetchAndLoad";
import { triggerDeviceOTAUpdate } from "../../services/private";
import { useSnackbar } from "notistack";
import useMqtt from "../../hooks/useMqtt";

export function OTAUpdateModal({
  open,
  onClose,
  otaStatus,
  onUpdate,
  onCancel,
  isUpdating: externalIsUpdating,
}) {
  const { callEndpoint } = useFetchAndLoad();
  const { enqueueSnackbar } = useSnackbar();
  const { recived } = useMqtt();

  const [isUpdating, setIsUpdating] = useState(false);
  const [otaProgress, setOtaProgress] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Escuchar mensajes MQTT del topic updater/sdata para progreso OTA en tiempo real
  useEffect(() => {
    if (!otaStatus?.dId || !recived || recived.length === 0 || !open) return;


    const otaMessages = recived.filter(
      (msg) => msg.dId === otaStatus.dId && msg.variable === "updater"
    );


    if (otaMessages.length > 0) {
      const latestMsg = otaMessages[otaMessages.length - 1];

      try {
        const payload =
          typeof latestMsg.value === "string"
            ? JSON.parse(latestMsg.value)
            : latestMsg.value;


        if (payload.ota_status) {
          setOtaProgress({
            status: payload.ota_status,
            progress: payload.progress || 0,
            timestamp: Date.now(),
          });

          // Notificaciones y callbacks para estados importantes
          if (payload.ota_status === "completed") {
            enqueueSnackbar("✅ Actualización OTA completada exitosamente", {
              variant: "success",
            });
            setIsUpdating(false);

            // Llamar callback onUpdate si existe
            if (onUpdate) {
              setTimeout(() => {
                onUpdate();
              }, 2000);
            }

            // Auto-cerrar después de mostrar éxito
            setTimeout(() => {
              setOtaProgress(null);
              onClose();
            }, 3000);
          } else if (payload.ota_status === "failed") {
            enqueueSnackbar("❌ Error en actualización OTA", {
              variant: "error",
            });
            setIsUpdating(false);
            setTimeout(() => {
              setOtaProgress(null);
            }, 3000);
          } else if (payload.ota_status === "no_update") {
            enqueueSnackbar("ℹ️ No hay actualizaciones disponibles", {
              variant: "info",
            });
            setIsUpdating(false);
            setTimeout(() => {
              setOtaProgress(null);
            }, 3000);
          }
        }
      } catch (error) {
        console.error("Error parsing OTA MQTT message:", error);
      }
    }
  }, [recived, otaStatus, onUpdate, onClose, enqueueSnackbar,open]);

  const handleTriggerUpdate = async () => {
    if (!otaStatus?.dId) return;

    setIsUpdating(true);
    try {
      const response = await callEndpoint(
        triggerDeviceOTAUpdate(otaStatus.dId)
      );
      if (!response.error) {
        enqueueSnackbar("Comando de actualización OTA enviado al dispositivo", {
          variant: "success",
        });
        setOtaProgress({
          status: "pending",
          progress: 0,
          timestamp: Date.now(),
        });
      } else {
        enqueueSnackbar("Error al enviar comando OTA", {
          variant: "error",
        });
        setIsUpdating(false);
      }
    } catch (error) {
      console.error("Error triggering OTA:", error);
      enqueueSnackbar("Error al activar actualización OTA", {
        variant: "error",
      });
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    if (isUpdating || otaProgress?.status === "downloading") {
      enqueueSnackbar(
        "No se puede cerrar durante una actualización en progreso",
        {
          variant: "warning",
        }
      );
      return;
    }
    setOtaProgress(null);
    onClose();
  };

  const handleCancelUpdate = () => {
    if (onCancel) {
      onCancel();
    }
    setOtaProgress(null);
    setIsUpdating(false);
    onClose();
  };

  if (!otaStatus) return null;

  const { currentVersion, updateAvailable, availableFirmware } = otaStatus;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {otaProgress?.status === "completed" ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : otaProgress?.status === "failed" ? (
              <XCircle className="h-5 w-5 text-red-600" />
            ) : availableFirmware?.isCritical ? (
              <AlertCircle className="h-5 w-5 text-red-600" />
            ) : (
              <Zap className="h-5 w-5 text-blue-600" />
            )}
            {otaProgress
              ? "Actualización de Firmware"
              : availableFirmware?.isCritical
              ? "Actualización Crítica Disponible"
              : "Actualización de Firmware OTA"}
          </DialogTitle>
          <DialogDescription>
            {otaProgress
              ? "Progreso de actualización en tiempo real"
              : "Gestiona las actualizaciones del firmware de tu dispositivo"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Información de versiones */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Versión Actual
              </p>
              <p className="text-lg font-semibold">{currentVersion}</p>
            </div>
            {updateAvailable && availableFirmware && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Nueva Versión
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold text-green-600">
                    {availableFirmware.version}
                  </p>
                  {availableFirmware.isCritical && (
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Detalles del firmware disponible */}
          {updateAvailable && availableFirmware && !otaProgress && (
            <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-900 dark:text-green-100">
                    Actualización disponible
                  </span>
                </div>
                <span className="text-xs font-medium text-green-700 dark:text-green-300">
                  {availableFirmware.fileSizeMB} MB
                </span>
              </div>

              {availableFirmware.isCritical && (
                <div className="flex items-center gap-2 mb-2 p-2 bg-amber-100 dark:bg-amber-900/30 rounded">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
                    Actualización crítica de seguridad
                  </p>
                </div>
              )}

              {availableFirmware.changelog && (
                <div className="space-y-1">
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-xs text-green-700 dark:text-green-300 hover:underline"
                  >
                    {showDetails ? "Ocultar" : "Ver"} notas de la versión
                  </button>
                  {showDetails && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1 pl-2 border-l-2 border-green-300 whitespace-pre-line">
                      {availableFirmware.changelog}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Progreso OTA en tiempo real via MQTT */}
          {otaProgress && (
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 rounded-lg border-2 border-blue-300 dark:border-blue-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {otaProgress.status === "completed" ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : otaProgress.status === "failed" ||
                    otaProgress.status === "error" ? (
                    <XCircle className="h-5 w-5 text-red-600" />
                  ) : (
                    <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                      {otaProgress.status === "downloading"
                        ? "Descargando firmware..."
                        : otaProgress.status === "completed"
                        ? "¡Actualización completada!"
                        : otaProgress.status === "failed"
                        ? "Error en actualización"
                        : otaProgress.status === "no_update"
                        ? "Sin actualizaciones"
                        : otaProgress.status === "pending"
                        ? "Enviando comando..."
                        : "Procesando..."}
                    </span>
                    <span className="text-xs text-blue-600 dark:text-blue-400">
                      {otaProgress.status === "downloading" &&
                        "El dispositivo está descargando el firmware"}
                      {otaProgress.status === "completed" &&
                        "El dispositivo se reiniciará automáticamente"}
                      {otaProgress.status === "failed" &&
                        "Hubo un error. Puedes intentar nuevamente"}
                      {otaProgress.status === "pending" &&
                        "Esperando respuesta del dispositivo..."}
                    </span>
                  </div>
                </div>
                {otaProgress.status !== "pending" && (
                  <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                    {otaProgress.progress}%
                  </span>
                )}
              </div>

              {(otaProgress.status === "downloading" ||
                otaProgress.status === "pending") && (
                <Progress value={otaProgress.progress} className="h-2 mb-2" />
              )}

              {otaProgress.status === "downloading" && (
                <div className="flex items-center gap-2 p-2 bg-amber-100 dark:bg-amber-900/30 rounded mt-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
                    No desconectes ni apagues el dispositivo durante la
                    actualización
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Sin actualizaciones */}
          {!updateAvailable && !otaProgress && (
            <div className="p-4 bg-muted rounded-lg text-center">
              <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-muted-foreground">
                Tu dispositivo está actualizado
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Versión {currentVersion}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {!otaProgress && updateAvailable && (
            <Button
              variant="default"
              onClick={handleTriggerUpdate}
              disabled={isUpdating || externalIsUpdating}
              className="w-full sm:w-auto"
            >
              {isUpdating || externalIsUpdating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Enviando comando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Actualizar Ahora
                </>
              )}
            </Button>
          )}

          {otaProgress?.status === "downloading" ? (
            <Button variant="outline" disabled className="w-full sm:w-auto">
              Actualizando...
            </Button>
          ) : otaProgress?.status === "completed" ? (
            <Button
              variant="default"
              onClick={handleClose}
              className="w-full sm:w-auto"
            >
              Cerrar
            </Button>
          ) : otaProgress?.status === "failed" ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancelUpdate}
                className="w-full sm:w-auto"
              >
                Cerrar
              </Button>
              <Button
                variant="default"
                onClick={handleTriggerUpdate}
                className="w-full sm:w-auto"
              >
                Reintentar
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={
                isUpdating ||
                externalIsUpdating ||
                otaProgress?.status === "downloading"
              }
              className="w-full sm:w-auto"
            >
              {!updateAvailable ? "Cerrar" : "Recordar más tarde"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}