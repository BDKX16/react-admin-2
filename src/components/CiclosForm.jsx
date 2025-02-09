import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

import { setSingleCicle } from "../services/public";

import useFetchAndLoad from "@/hooks/useFetchAndLoad";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
const CiclosForm = ({ ciclo, dId }) => {
  const { loading, callEndpoint } = useFetchAndLoad();
  const [horaEncendido, setHoraEncendido] = useState(null);
  const [horaApagado, setHoraApagado] = useState(null);

  useEffect(() => {
    if (ciclo) {
      setHoraEncendido(ciclo.encendido.toString());
      setHoraApagado(ciclo.apagado.toString());
    }
  }, [ciclo]);

  const buttonLogic = () => {
    const encendidoHour = ciclo.encendido.toString();
    const apagadoHour = ciclo.apagado.toString();

    if (
      (encendidoHour != horaEncendido || apagadoHour != horaApagado) &&
      !loading
    ) {
      return false;
    } else {
      return true;
    }
  };
  const handleSubmit = async () => {
    const encendidoMillis = parseInt(horaEncendido) * 60 * 60 * 1000;
    const apagadoMillis = parseInt(horaApagado) * 60 * 60 * 1000;

    const toSend = {
      encendido: encendidoMillis,
      apagado: apagadoMillis,
      variable: ciclo.variable,
    };

    await callEndpoint(setSingleCicle(toSend, dId));
  };

  if (!horaEncendido || !horaApagado) return null;
  return (
    <div className="flex flex-row space-x-3 items-end">
      <div className="space-y-1">
        <Label>Tiempo encendido</Label>
        <Input type="number" placeholder="Cantidad" />
        <Select
          defaultValue={"minutes"}
          onValueChange={(value) => console.log(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tiempo encendido" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="seconds">Segundos</SelectItem>
            <SelectItem value="minutes">Minutos</SelectItem>
            <SelectItem value="hours">Horas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label>Tiempo apagado</Label>
        <Input type="number" placeholder="Cantidad" />
        <Select
          onValueChange={(value) => console.log(value)}
          defaultValue={"seconds"}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tiempo apagado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="seconds">Segundos</SelectItem>
            <SelectItem value="minutes">Minutos</SelectItem>
            <SelectItem value="hours">Horas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button variant="outline" disabled={buttonLogic()} onClick={handleSubmit}>
        Button
      </Button>
    </div>
  );
};

export default CiclosForm;
