import React, { useState } from "react";
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

const DeviceConfig = () => {
  const [saveToDatabase, setSaveToDatabase] = useState(false);
  const [config1, setConfig1] = useState("timer");
  const [config2, setConfig2] = useState("timer");
  const [config3, setConfig3] = useState("timer");
  const [config4, setConfig4] = useState("timer");

  const handleSave = () => {
    // Logic to save the configuration
    console.log({
      saveToDatabase,
      config1,
      config2,
      config3,
      config4,
    });
  };

  const handleDelete = () => {
    // Logic to delete the device
    console.log("Device deleted");
  };

  return (
    <div className="p-4 rounded-lg shadow-md text-left w-full max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-2">
        Configuración del dispositivo
      </h2>
      <Separator></Separator>
      <div className="flex flex-col items-start gap-3 mb-6 mt-6">
        <Label className="mr-4 font-bold">Nombre del dispositivo</Label>
        <Input placeholder="Sweet Home Alabahama"></Input>
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
      <div className="flex flex-col items-start gap-3 mb-8">
        <Label className="mr-4 font-bold text-md">Relay 1:</Label>
        <Input placeholder="Aireador" className="w-[240px]"></Input>
        <Label className="text-gray-500 mb-3">
          El nombre del relay es para identificarlo en la aplicacion. Puedes
          dejarlo en blanco y aparecera la opcion por defecto.
        </Label>
        <Select value={config1} onValueChange={setConfig1}>
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Encendido</SelectItem>
            <SelectItem value="false">Apagado</SelectItem>
            <SelectItem value="timer">Timer</SelectItem>
            <SelectItem value="ciclos">Ciclos</SelectItem>
          </SelectContent>
        </Select>
        <Label className="text-gray-500">
          Puedes configurar el estado inicial de la salida.
        </Label>
      </div>
      <div className="flex flex-col items-start gap-3 mb-10">
        <Label className="mr-4 font-bold text-md">Relay 2:</Label>
        <Input placeholder="Aireador" className="w-[240px]"></Input>
        <Label className="text-gray-500 mb-3">
          El nombre del relay es para identificarlo en la aplicacion. Puedes
          dejarlo en blanco y aparecera la opcion por defecto.
        </Label>
        <Select value={config2} onValueChange={setConfig2}>
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Encendido</SelectItem>
            <SelectItem value="false">Apagado</SelectItem>
            <SelectItem value="timer">Timer</SelectItem>
            <SelectItem value="ciclos">Ciclos</SelectItem>
          </SelectContent>
        </Select>
        <Label className="text-gray-500">
          Puedes configurar el estado inicial de la salida.
        </Label>
      </div>
      <div className="flex flex-col items-start gap-3 mb-10">
        <Label className="mr-4 font-bold text-md">Relay 3:</Label>
        <Input placeholder="Aireador" className="w-[240px]"></Input>
        <Label className="text-gray-500 mb-3">
          El nombre del relay es para identificarlo en la aplicacion. Puedes
          dejarlo en blanco y aparecera la opcion por defecto.
        </Label>
        <Select value={config3} onValueChange={setConfig3}>
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Encendido</SelectItem>
            <SelectItem value="false">Apagado</SelectItem>
            <SelectItem value="timer">Timer</SelectItem>
            <SelectItem value="ciclos">Ciclos</SelectItem>
          </SelectContent>
        </Select>
        <Label className="text-gray-500">
          Puedes configurar el estado inicial de la salida.
        </Label>
      </div>
      <div className="flex flex-col items-start gap-3 mb-10">
        <Label className="mr-4 font-bold text-md">Relay 4:</Label>
        <Input placeholder="Aireador" className="w-[240px]"></Input>
        <Label className="text-gray-500 mb-3">
          El nombre del relay es para identificarlo en la aplicacion. Puedes
          dejarlo en blanco y aparecera la opcion por defecto.
        </Label>
        <Select value={config4} onValueChange={setConfig4}>
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Encendido</SelectItem>
            <SelectItem value="false">Apagado</SelectItem>
            <SelectItem value="timer">Timer</SelectItem>
            <SelectItem value="ciclos">Ciclos</SelectItem>
          </SelectContent>
        </Select>
        <Label className="text-gray-500">
          Puedes configurar el estado inicial de la salida.
        </Label>
      </div>
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
