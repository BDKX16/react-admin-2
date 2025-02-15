import React, { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import useFetchAndLoad from "../hooks/useFetchAndLoad";
import { updateRule } from "../services/public";
const conditionAdapter = (value) => {
  if (value == ">") return ">=";
  if (value == "<=") return "<";

  return value;
};

const UpdateRuleDialog = ({ rule, selectedDevice }) => {
  const { callEndpoint } = useFetchAndLoad();
  const [formData, setFormData] = useState({
    variable: rule.variableFullName,
    condition: conditionAdapter(rule.condition),
    value: rule.value,
    action: rule.action.toString(),
    actuator: rule.actionVariable,
    triggerTime: rule.triggerTime || 20,
  });

  const [errors, setErrors] = useState({
    variable: false,
    condition: false,
    value: false,
    action: false,
    actuator: false,
  });

  const handleChange = (field) => (value) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: false,
    }));
  };

  const handleUpdate = async () => {
    const newErrors = {
      value: !formData.value,
      triggerTime: !formData.triggerTime,
    };

    if (Object.values(newErrors).some((error) => error)) {
      console.log("error");
      setErrors(newErrors);
      return;
    }

    console.log(rule);
    const toSend = {
      oldAlarmId: rule.emqxRuleId,
      value: formData.value,
      triggerTime: formData.triggerTime,
    };

    const res = await callEndpoint(updateRule(toSend));
    console.log(res);
    if (res.status === 200) {
      window.location.reload();
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Edit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Regla</DialogTitle>
          <DialogDescription>Edita los detalles de la regla.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex flex-col gap-2">
              <Select disabled defaultValue={formData.variable}>
                <SelectTrigger
                  className={
                    errors.variable ? "border-red-500 w-full" : "w-full"
                  }
                >
                  <SelectValue placeholder="Variable" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Temp">Temperatura</SelectItem>
                  <SelectItem value="Hum">Humedad</SelectItem>
                  <SelectItem value="Soil Hum">Humedad del suelo</SelectItem>
                </SelectContent>
              </Select>

              <Select disabled defaultValue={formData.condition}>
                <SelectTrigger
                  className={
                    errors.condition ? "border-red-500 w-full" : "w-full"
                  }
                >
                  <SelectValue placeholder="Condición" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="=">Igual a</SelectItem>
                  <SelectItem value=">=">Mayor que</SelectItem>
                  <SelectItem value="<">Menor que</SelectItem>
                </SelectContent>
              </Select>
              {errors.variable && (
                <Label className="text-red-500">Campo variable requerido</Label>
              )}
              {errors.condition && (
                <Label className="text-red-500">
                  Campo condicion requerido
                </Label>
              )}
            </div>
            <div className="flex flex-col gap-2 align-center justify-center">
              <Input
                placeholder="Valor"
                type="number"
                className={`mx-auto ${errors.value ? "border-red-500" : ""}`}
                defaultValue={formData.value}
                onChange={(e) => handleChange("value")(e.target.value)}
              />
              {errors.value && (
                <Label className="text-red-500">Campo requerido</Label>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Select disabled defaultValue={formData.action}>
                <SelectTrigger
                  className={errors.action ? "border-red-500 w-full" : "w-full"}
                >
                  <SelectValue placeholder="Acción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Encender</SelectItem>
                  <SelectItem value="0">Apagar</SelectItem>
                  <SelectItem value="3">Poner en modo Timer</SelectItem>
                  <SelectItem value="5">Poner en modo Ciclos</SelectItem>
                </SelectContent>
              </Select>

              <Select disabled defaultValue={formData.actuator}>
                <SelectTrigger
                  className={
                    errors.actuator ? "border-red-500 w-full" : "w-full"
                  }
                >
                  <SelectValue placeholder="Actuador" />
                </SelectTrigger>
                <SelectContent>
                  {selectedDevice.map((widget) => {
                    if (widget.widgetType !== "Switch") return;

                    return (
                      <SelectItem key={widget.variable} value={widget.variable}>
                        {widget.variableFullName}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {errors.action && (
                <Label className="text-red-500">Campo acción requerido</Label>
              )}
              {errors.actuator && (
                <Label className="text-red-500">Campo actuador requerido</Label>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="font-bold">Tiempo entre activaciones:</Label>
            <Slider
              min={10}
              max={60}
              step={1}
              defaultValue={[formData.triggerTime]}
              onValueChange={(value) => handleChange("triggerTime")(value[0])}
            />
            <Label>{formData.triggerTime} minutos</Label>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleUpdate}>Update Rule</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateRuleDialog;
