import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Download,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  XCircle,
  Zap,
  ArrowRight,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import useFetchAndLoad from "../../hooks/useFetchAndLoad";
import { triggerDeviceOTAUpdate } from "../../services/private";
import { useSnackbar } from "notistack";
import useMqtt from "../../hooks/useMqtt";

const OTA_MODAL_HIDE_UNTIL_KEY = "ota_modal_hide_until";

const OTAUpdateStep = ({ device, otaStatus, onSkip, onComplete }) => {
  const { callEndpoint } = useFetchAndLoad();
  const { enqueueSnackbar } = useSnackbar();
  const { recived, clearMessagesByVariable } = useMqtt();

  const [isUpdating, setIsUpdating] = useState(false);
  const [otaProgress, setOtaProgress] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [updateCompleted, setUpdateCompleted] = useState(false);
  const [lastNotifiedStatus, setLastNotifiedStatus] = useState(null);

  // Función para manejar el skip y ocultar el modal OTA hasta mañana
  const handleSkip = () => {
    // Guardar timestamp para mañana a las 00:00
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    localStorage.setItem(
      OTA_MODAL_HIDE_UNTIL_KEY,
      tomorrow.getTime().toString()
    );

    // Ejecutar la función onSkip original
    onSkip();
  };

  // Escuchar mensajes MQTT del topic updater/sdata para progreso OTA en tiempo real
  useEffect(() => {
    if (!device?.dId || !recived || recived.length === 0) return;

    const otaMessages = recived.filter(
      (msg) => msg.dId === device.dId && msg.variable === "updater"
    );

    if (otaMessages.length > 0) {
      const latestMsg = otaMessages[otaMessages.length - 1];

      // Validar que el mensaje tenga un value válido
      if (!latestMsg.value) {
        return;
      }

      try {
        const payload =
          typeof latestMsg.value === "string"
            ? JSON.parse(latestMsg.value)
            : latestMsg.value;

        // Validar que el payload tenga la estructura esperada
        if (!payload || typeof payload !== "object") {
          return;
        }

        if (payload.ota_status) {
          setOtaProgress({
            status: payload.ota_status,
            progress: payload.progress || 0,
            timestamp: Date.now(),
          });

          // Notificaciones y callbacks para estados importantes (solo si cambió el estado)
          if (payload.ota_status !== lastNotifiedStatus) {
            if (payload.ota_status === "completed") {
              enqueueSnackbar("✅ Actualización OTA completada exitosamente", {
                variant: "success",
              });
              setIsUpdating(false);
              setUpdateCompleted(true);
              setLastNotifiedStatus("completed");
            } else if (payload.ota_status === "failed") {
              enqueueSnackbar("❌ Error en actualización OTA", {
                variant: "error",
              });
              setIsUpdating(false);
              setLastNotifiedStatus("failed");
              // Limpiar mensajes de updater del array recived
              clearMessagesByVariable(device.dId, "updater");
              setTimeout(() => {
                setOtaProgress(null);
              }, 3000);
            } else if (payload.ota_status === "no_update") {
              enqueueSnackbar("ℹ️ No hay actualizaciones disponibles", {
                variant: "info",
              });
              setIsUpdating(false);
              setLastNotifiedStatus("no_update");
              // Limpiar mensajes de updater del array recived
              clearMessagesByVariable(device.dId, "updater");
              setTimeout(() => {
                setOtaProgress(null);
              }, 3000);
            }
          }
        }
      } catch (error) {
        console.error("Error parsing OTA MQTT message:", error);
      }
    }
  }, [
    recived,
    device,
    enqueueSnackbar,
    lastNotifiedStatus,
    clearMessagesByVariable,
  ]);

  const handleTriggerUpdate = async () => {
    if (!device?.dId) return;

    setIsUpdating(true);
    try {
      const response = await callEndpoint(triggerDeviceOTAUpdate(device.dId));
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

  if (!otaStatus) return null;

  const { currentVersion, updateAvailable, availableFirmware } = otaStatus;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in zoom-in duration-500">
      {/* Header */}
      <div className="text-center space-y-3">
        <div
          className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-3 ${
            updateCompleted
              ? "bg-gradient-to-br from-green-500 to-emerald-600"
              : "bg-gradient-to-br from-blue-500 to-purple-600"
          }`}
        >
          {updateCompleted ? (
            <CheckCircle2 className="h-10 w-10 text-white" />
          ) : (
            <Zap className="h-8 w-8 text-white" />
          )}
        </div>
        <h2 className="text-3xl font-bold">
          {updateCompleted ? "¡Todo listo!" : "Actualización de Firmware"}
        </h2>
        <p className="text-muted-foreground">
          {updateCompleted
            ? "Tu dispositivo está actualizado y listo para usar"
            : "Mantén tu dispositivo actualizado con las últimas mejoras"}
        </p>
      </div>

      {/* Información de versiones - Solo mostrar si NO está completado */}
      {!updateCompleted && (
        <div className="grid grid-cols-2 gap-6 p-5 bg-muted/50 rounded-lg border border-border">
          <div className="space-y-1 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              Versión Actual
            </p>
            <p className="text-lg font-semibold">{currentVersion}</p>
          </div>
          {updateAvailable && availableFirmware && (
            <div className="space-y-1 text-center">
              <p className="text-sm font-medium text-muted-foreground">
                Nueva Versión
              </p>
              <div className="flex items-center justify-center gap-2">
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
      )}

      {/* Detalles del firmware disponible */}
      {!updateCompleted &&
        updateAvailable &&
        availableFirmware &&
        !otaProgress && (
          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
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

      {/* Sin actualizaciones */}
      {!updateAvailable && !otaProgress && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Tu dispositivo ya tiene la versión más reciente del firmware
          </AlertDescription>
        </Alert>
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
              </div>
            </div>
            {otaProgress.progress > 0 && (
              <span className="text-sm font-bold text-blue-700 dark:text-blue-200">
                {otaProgress.progress}%
              </span>
            )}
          </div>

          {otaProgress.progress > 0 && (
            <Progress
              value={otaProgress.progress}
              className="h-3 bg-blue-200 dark:bg-blue-900"
            />
          )}

          {(otaProgress.status === "failed" ||
            otaProgress.status === "error") && (
            <Alert variant="destructive" className="mt-3">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Error durante la actualización. Por favor, intenta nuevamente.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Botones de acción */}
      <div className="space-y-3">
        {!updateCompleted && (
          <>
            {updateAvailable && !isUpdating && !otaProgress && (
              <div className="flex justify-end items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="text-muted-foreground hover:text-foreground text-xs"
                >
                  Saltar y continuar al dashboard
                </Button>
                <Button
                  size="lg"
                  onClick={handleTriggerUpdate}
                  className="px-6"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Actualizar ahora
                </Button>
              </div>
            )}

            {isUpdating && (
              <div className="flex justify-end">
                <Button size="lg" className="px-6" disabled>
                  <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                  Actualizando...
                </Button>
              </div>
            )}

            {!updateAvailable && !otaProgress && (
              <div className="flex justify-end">
                <Button size="lg" onClick={onComplete} className="px-6">
                  <ArrowRight className="mr-2 h-5 w-5" />
                  Ir al Dashboard
                </Button>
              </div>
            )}
          </>
        )}

        {updateCompleted && (
          <div className="flex justify-end">
            <Button size="lg" onClick={onComplete} className="px-6">
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Ir al Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OTAUpdateStep;
