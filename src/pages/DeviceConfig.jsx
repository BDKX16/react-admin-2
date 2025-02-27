import React, { useEffect, useState } from "react";
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
import {
  deleteDevice,
  updateSaverRule,
  updateDeviceConfig,
} from "../services/private";
import useDevices from "../hooks/useDevices";

const DeviceConfig = () => {
  const { selectedDevice } = useDevices();
  const { loading, callEndpoint } = useFetchAndLoad();
  const [saveToDatabase, setSaveToDatabase] = useState(false);
  const [deviceName, setDeviceName] = useState("");
  const [configs, setConfigs] = useState([]);
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
    }
  }, [selectedDevice]);

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
    </div>
  );
};

export default DeviceConfig;
