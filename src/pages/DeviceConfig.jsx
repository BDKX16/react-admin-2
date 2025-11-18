import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
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
import useFetchAndLoad from "../hooks/useFetchAndLoad";
import { deleteDevice, updateDeviceConfig } from "../services/private";
import useDevices from "../hooks/useDevices";
import { LocationConfigModal } from "../components/automation/LocationConfigModal";
import { MapPin, Download } from "lucide-react";
import { updateDeviceLocation } from "../services/public";
import { getDeviceOTAStatus } from "../services/private";

const DeviceConfig = () => {
  const { selectedDevice } = useDevices();
  const { callEndpoint } = useFetchAndLoad();
  const [saveToDatabase, setSaveToDatabase] = useState(false);
  const [deviceName, setDeviceName] = useState("");
  const [configs, setConfigs] = useState([]);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [otaStatus, setOtaStatus] = useState(null);
  const [loadingOTA, setLoadingOTA] = useState(false);
  useEffect(() => {
    if (selectedDevice) {
      setDeviceName(selectedDevice.name);
      setConfigs(
        selectedDevice.template.widgets
          .filter((w) => w.widgetType === "Switch")
          .map((w) => {
            return {
              variable: w.variable,
              variableFullName: w.variableFullName,
              initial: w.initialValue === undefined ? 3 : w.initialValue,
            };
          })
      );

      // Cargar estado OTA
      loadOTAStatus();
    }
  }, [selectedDevice]);

  const loadOTAStatus = async () => {
    if (!selectedDevice?.dId) return;

    setLoadingOTA(true);
    try {
      const response = await callEndpoint(
        getDeviceOTAStatus(selectedDevice.dId)
      );
      if (!response.error && response.data) {
        setOtaStatus(response.data);
      }
    } catch (error) {
      console.error("Error loading OTA status:", error);
    } finally {
      setLoadingOTA(false);
    }
  };

  const handleSave = async () => {
    const toSend = {
      dId: selectedDevice.dId,
      deviceName: deviceName !== selectedDevice.name ? deviceName : null,
      configs,
    };
    // Example of calling an endpoint function
    const response = await callEndpoint(updateDeviceConfig(toSend));

    if (!response.error) {
      window.location.reload();
    }
  };

  const handleDelete = async () => {
    const res = await callEndpoint(deleteDevice);
    if (res.error) return;
    else {
      window.location.reload();
    }
  };

  const handleConfigChange = (index, key, value) => {
    const newConfigs = [...configs];
    newConfigs[index] = {
      ...newConfigs[index],
      [key]: key === "initial" ? parseInt(value) : value,
    };
    setConfigs(newConfigs);
  };

  const handleLocationSave = async (locationData) => {
    try {
      console.log("Guardando ubicación:", locationData);
      const response = await updateDeviceLocation(
        selectedDevice.dId,
        locationData
      );
      if (response.status === "success") {
        setLocationModalOpen(false);
        // Recargar la página para actualizar los datos del dispositivo
        window.location.reload();
        console.log("Ubicación actualizada correctamente");
      } else {
        throw new Error("Error guardando ubicación");
      }
    } catch (error) {
      console.error("Error guardando ubicación:", error);
    }
  };

  return (
    <div className="p-4 rounded-lg shadow-md text-left w-full max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-2">
        Configuración del dispositivo
      </h2>
      <Separator></Separator>
      <div className="flex flex-col items-start gap-3 mb-6 mt-6">
        <Label className="mr-4 font-bold">Nombre del dispositivo</Label>
        <Input
          placeholder="Sweet Home Alabahama"
          value={deviceName}
          onChange={(e) => setDeviceName(e.target.value)}
        ></Input>
        <Label className="text-gray-500">
          Puedes cambiar el nombre del dispositivo para identificarlo en todas
          las plataformas.
        </Label>
      </div>

      {/* Sección de Ubicación */}
      <div className="flex flex-col items-start gap-3 mb-6">
        <div className="flex items-center justify-between w-full">
          <Label className="font-bold">Ubicación del dispositivo</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocationModalOpen(true)}
            className="gap-2"
          >
            <MapPin className="h-4 w-4" />
            {selectedDevice?.location
              ? "Cambiar ubicación"
              : "Configurar ubicación"}
          </Button>
        </div>
        {selectedDevice?.location ? (
          <div className="p-3 bg-muted rounded-lg w-full">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">
                {selectedDevice.location.displayName ||
                  `${selectedDevice.location.name}, ${selectedDevice.location.state}, ${selectedDevice.location.country}`}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg w-full">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-amber-800 dark:text-amber-200">
                Sin ubicación configurada
              </span>
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-300 mt-1">
              Configure la ubicación para usar funciones climáticas en
              automatizaciones.
            </p>
          </div>
        )}
        <Label className="text-gray-500">
          La ubicación se utiliza para automatizaciones con aspectos climáticos
          (clima, dia/noche, etc.).
        </Label>
      </div>

      {/* Sección de Firmware OTA */}
      <div className="flex flex-col items-start gap-3 mb-6">
        <Label className="font-bold">Versión de Firmware</Label>
        {loadingOTA ? (
          <div className="p-3 bg-muted rounded-lg w-full">
            <span className="text-sm text-muted-foreground">
              Cargando información OTA...
            </span>
          </div>
        ) : otaStatus ? (
          <div className="p-3 bg-muted rounded-lg w-full">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">
                  Versión actual: {otaStatus.currentVersion || "Desconocida"}
                </span>
                {otaStatus.updateAvailable && otaStatus.availableFirmware && (
                  <span className="text-xs text-green-600 dark:text-green-400">
                    Nueva versión {otaStatus.availableFirmware.version}{" "}
                    disponible ({otaStatus.availableFirmware.fileSizeMB} MB)
                    {otaStatus.availableFirmware.isCritical &&
                      " - Actualización crítica"}
                  </span>
                )}
                {otaStatus.ongoingUpdate && (
                  <span className="text-xs text-blue-600 dark:text-blue-400">
                    Actualización en progreso: {otaStatus.ongoingUpdate.status}{" "}
                    ({otaStatus.ongoingUpdate.progress}%)
                  </span>
                )}
              </div>
              {otaStatus.updateAvailable && !otaStatus.ongoingUpdate && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => (window.location.href = "/dashboard")}
                >
                  <Download className="h-4 w-4" />
                  Ver actualización
                </Button>
              )}
            </div>
            {otaStatus.availableFirmware?.changelog && (
              <p className="text-xs text-muted-foreground mt-2">
                {otaStatus.availableFirmware.changelog}
              </p>
            )}
          </div>
        ) : (
          <div className="p-3 bg-muted rounded-lg w-full">
            <span className="text-sm text-muted-foreground">
              Información de firmware no disponible
            </span>
          </div>
        )}
        <Label className="text-gray-500">
          El dispositivo se actualiza automáticamente cuando detecta una nueva
          versión disponible.
        </Label>
      </div>

      <div className=" mb-10">
        <div className="flex items-center font-bold justify-between">
          <Label className="mr-4">Guardar datos de sensores:</Label>
          <Switch
            checked={saveToDatabase}
            onCheckedChange={setSaveToDatabase}
          />
        </div>
        <Label className="text-gray-500">
          Si desactivas esta opcion dejaras de guardar datos de tus sensores.
        </Label>
      </div>
      {configs.map((config, index) => (
        <div
          key={config.variable}
          className="flex flex-col items-start gap-3 mb-10"
        >
          <Label className="mr-4 font-bold text-md">{`Actuador ${
            index + 1
          }:`}</Label>
          <Input
            placeholder={config.variableFullName}
            onChange={(e) =>
              handleConfigChange(index, "variableFullName", e.target.value)
            }
            className="w-[240px]"
          ></Input>
          <Label className="text-gray-500 mb-3">
            El nombre del relay es para identificarlo en la aplicacion. Puedes
            dejarlo en blanco y aparecera la opcion por defecto.
          </Label>
          <Select
            value={config.initial.toString()}
            onValueChange={(value) =>
              handleConfigChange(index, "initial", value)
            }
          >
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Apagado</SelectItem>
              <SelectItem value="1">Encendido</SelectItem>
              <SelectItem value="3">Timer</SelectItem>
              <SelectItem value="5">Ciclos</SelectItem>
            </SelectContent>
          </Select>

          <Label className="text-gray-500">
            Puedes configurar el estado al encender el dispositivo. Ante cortes
            de luz el dispositivo iniciara en este modo.
          </Label>
        </div>
      ))}
      <Button type="primary" onClick={handleSave}>
        Guardar Configuración
      </Button>
      <div className="mt-8 border-[0.5px] rounded-lg p-4 border-red-600 border-opacity-25">
        <h3 className="text-xl font-semibold text-red-600">Danger Zone</h3>
        <p className="text-gray-500 mb-6 leading-tight">
          Esta zona es peligrosa. Aquí puedes eliminar el dispositivo. Esta
          acción no se puede deshacer.
        </p>
        <div className="flex justify-between  items-center">
          <Label className="font-normal leading-tight">
            Una vez que eliminas un dispositivo, no hay vuelta atrás. Por favor
            esté seguro.
          </Label>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" className="ml-3">
                Eliminar dispositivo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Eliminar dispositivo</DialogTitle>
                <DialogDescription>
                  ¿Estás seguro de que deseas eliminar este dispositivo? Esta
                  acción no se puede deshacer.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button variant="destructive" onClick={handleDelete}>
                  Eliminar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Modal de configuración de ubicación */}
      <LocationConfigModal
        open={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        onSave={handleLocationSave}
        deviceName={selectedDevice?.name}
        hasExistingLocation={
          !!(selectedDevice?.location && selectedDevice.location.latitude)
        }
      />
    </div>
  );
};

export default DeviceConfig;
