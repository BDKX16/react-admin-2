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
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const OTA_STORAGE_KEY = "ota_notification_dismissed";
const OTA_EXPIRATION_DAYS = 7; // Mostrar nuevamente después de 7 días
const CRITICAL_CHECK_INTERVAL_HOURS = 24; // Para actualizaciones críticas, mostrar cada 24h

export function OTAUpdateModal({
  open,
  onClose,
  otaStatus,
  onUpdate,
  onCancel,
  isUpdating,
}) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (open && otaStatus?.availableFirmware) {
      // Si el modal se abre, marcar como visto
      const dismissalData = {
        version: otaStatus.availableFirmware.version,
        timestamp: Date.now(),
        isCritical: otaStatus.availableFirmware.isCritical,
      };
      // No guardamos aquí, solo cuando el usuario cierra el modal
    }
  }, [open, otaStatus]);

  const handleClose = () => {
    if (dontShowAgain && otaStatus?.availableFirmware) {
      saveDismissal(otaStatus.availableFirmware);
    }
    onClose();
  };

  const handleUpdate = () => {
    onUpdate();
  };

  const saveDismissal = (firmware) => {
    const dismissalData = {
      version: firmware.version,
      timestamp: Date.now(),
      isCritical: firmware.isCritical,
    };
    localStorage.setItem(OTA_STORAGE_KEY, JSON.stringify(dismissalData));
  };

  if (!otaStatus) return null;

  const { availableFirmware, ongoingUpdate, currentVersion } = otaStatus;

  // Si hay actualización en progreso, mostrar progreso
  if (ongoingUpdate) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
              Actualización en progreso
            </DialogTitle>
            <DialogDescription>
              Instalando versión {ongoingUpdate.version}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estado:</span>
                <span className="font-medium capitalize">
                  {ongoingUpdate.status === "downloading"
                    ? "Descargando"
                    : ongoingUpdate.status === "installing"
                    ? "Instalando"
                    : ongoingUpdate.status}
                </span>
              </div>
              <Progress value={ongoingUpdate.progress || 0} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{ongoingUpdate.progress || 0}%</span>
                <span>{ongoingUpdate.fileSizeMB} MB</span>
              </div>
            </div>

            <Alert>
              <Clock className="h-4 w-4" />
              <AlertTitle>Por favor espera</AlertTitle>
              <AlertDescription>
                El dispositivo está actualizándose. No lo apagues durante este
                proceso. Una vez completada la actualización, el dispositivo se
                reiniciará automáticamente.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            {ongoingUpdate.status === "pending" && (
              <Button
                variant="outline"
                onClick={() => onCancel()}
                disabled={isUpdating}
              >
                Cancelar actualización
              </Button>
            )}
            <Button variant="outline" onClick={handleClose}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Si hay actualización disponible
  if (!availableFirmware) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {availableFirmware.isCritical ? (
              <>
                <AlertCircle className="h-5 w-5 text-red-600" />
                Actualización Crítica Disponible
              </>
            ) : (
              <>
                <Download className="h-5 w-5 text-green-600" />
                Nueva Actualización Disponible
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            Versión {availableFirmware.version} ({availableFirmware.fileSizeMB}{" "}
            MB)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
            <div>
              <p className="text-sm font-medium">Versión actual</p>
              <p className="text-2xl font-bold">{currentVersion}</p>
            </div>
            <div className="text-muted-foreground">→</div>
            <div>
              <p className="text-sm font-medium text-green-600">
                Nueva versión
              </p>
              <p className="text-2xl font-bold text-green-600">
                {availableFirmware.version}
              </p>
            </div>
          </div>

          {availableFirmware.isCritical && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Actualización Crítica</AlertTitle>
              <AlertDescription>
                Esta actualización contiene correcciones importantes de
                seguridad o estabilidad. Se recomienda instalarla lo antes
                posible.
              </AlertDescription>
            </Alert>
          )}

          {availableFirmware.changelog && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Novedades:</h4>
              <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg whitespace-pre-line">
                {availableFirmware.changelog}
              </div>
            </div>
          )}

          {availableFirmware.releaseNotes && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Notas de lanzamiento:</h4>
              <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg whitespace-pre-line">
                {availableFirmware.releaseNotes}
              </div>
            </div>
          )}

          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Actualización automática</AlertTitle>
            <AlertDescription>
              El dispositivo detectará y aplicará esta actualización
              automáticamente en las próximas horas. El proceso tarda
              aproximadamente {Math.ceil(availableFirmware.fileSize / 200000)}{" "}
              minutos y el dispositivo se reiniciará automáticamente.
            </AlertDescription>
          </Alert>

          {!availableFirmware.isCritical && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="dontShowAgain"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label
                htmlFor="dontShowAgain"
                className="text-sm text-muted-foreground cursor-pointer"
              >
                No volver a mostrar este aviso por 7 días
              </label>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            className="w-full sm:w-auto"
          >
            <X className="h-4 w-4 mr-2" />
            Recordar más tarde
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="w-full sm:w-auto"
          >
            <Download className="h-4 w-4 mr-2" />
            {isUpdating ? "Iniciando..." : "Actualizar ahora"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper para verificar si debe mostrarse el modal
export function shouldShowOTAModal(otaStatus) {
  if (!otaStatus?.availableFirmware || !otaStatus.updateAvailable) {
    return false;
  }

  // Si hay una actualización en progreso, siempre mostrar
  if (otaStatus.ongoingUpdate) {
    return true;
  }

  const { availableFirmware } = otaStatus;
  const dismissalData = localStorage.getItem(OTA_STORAGE_KEY);

  if (!dismissalData) {
    return true; // Primera vez, mostrar
  }

  try {
    const parsed = JSON.parse(dismissalData);

    // Si es una nueva versión diferente, mostrar
    if (parsed.version !== availableFirmware.version) {
      return true;
    }

    const now = Date.now();
    const timeSinceDismissal = now - parsed.timestamp;

    // Si es crítica, mostrar cada 24h
    if (availableFirmware.isCritical) {
      const hoursElapsed = timeSinceDismissal / (1000 * 60 * 60);
      return hoursElapsed >= CRITICAL_CHECK_INTERVAL_HOURS;
    }

    // Si no es crítica, mostrar después de N días
    const daysElapsed = timeSinceDismissal / (1000 * 60 * 60 * 24);
    return daysElapsed >= OTA_EXPIRATION_DAYS;
  } catch (error) {
    console.error("Error parsing OTA dismissal data:", error);
    return true; // Si hay error, mostrar por seguridad
  }
}

// Helper para limpiar datos obsoletos
export function clearOTADismissal() {
  localStorage.removeItem(OTA_STORAGE_KEY);
}
