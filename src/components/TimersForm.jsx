import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { setSingleTimer } from "../services/public";

import useFetchAndLoad from "@/hooks/useFetchAndLoad";
import { Label } from "@/components/ui/label";
const TimersForm = ({ timers, dId }) => {
  const { loading, callEndpoint } = useFetchAndLoad();
  const [horaEncendido, setHoraEncendido] = useState(null);
  const [horaApagado, setHoraApagado] = useState(null);

  useEffect(() => {
    if (timers) {
      const encendidoHour = Math.floor(timers.encendido / (1000 * 60 * 60));
      const apagadoHour = Math.floor(timers.apagado / (1000 * 60 * 60));

      setHoraEncendido(encendidoHour.toString());
      setHoraApagado(apagadoHour.toString());
    }
  }, [timers]);

  const buttonLogic = () => {
    const encendidoHour = Math.floor(timers.encendido / (1000 * 60 * 60));
    const apagadoHour = Math.floor(timers.apagado / (1000 * 60 * 60));

    if (
      (encendidoHour.toString() != horaEncendido ||
        apagadoHour.toString() != horaApagado) &&
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

    const timer = {
      encendido: encendidoMillis,
      apagado: apagadoMillis,
      variable: timers.variable,
    };

    await callEndpoint(setSingleTimer(timer, dId));
  };

  if (!horaEncendido || !horaApagado) return null;
  return (
    <div className="flex flex-row space-x-3 items-end">
      <div>
        <Label>Hora de encendido</Label>
        <Select
          defaultValue={horaEncendido}
          onValueChange={(value) => setHoraEncendido(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Hora de encendido" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 AM</SelectItem>
            <SelectItem value="2">2 AM</SelectItem>
            <SelectItem value="3">3 AM</SelectItem>
            <SelectItem value="4">4 AM</SelectItem>
            <SelectItem value="5">5 AM</SelectItem>
            <SelectItem value="6">6 AM</SelectItem>
            <SelectItem value="7">7 AM</SelectItem>
            <SelectItem value="8">8 AM</SelectItem>
            <SelectItem value="9">9 AM</SelectItem>
            <SelectItem value="10">10 AM</SelectItem>
            <SelectItem value="11">11 AM</SelectItem>
            <SelectItem value="12">12 AM</SelectItem>
            <SelectItem value="13">1 PM</SelectItem>
            <SelectItem value="14">2 PM</SelectItem>
            <SelectItem value="15">3 PM</SelectItem>
            <SelectItem value="16">4 PM</SelectItem>
            <SelectItem value="17">5 PM</SelectItem>
            <SelectItem value="18">6 PM</SelectItem>
            <SelectItem value="19">7 PM</SelectItem>
            <SelectItem value="20">8 PM</SelectItem>
            <SelectItem value="21">9 PM</SelectItem>
            <SelectItem value="22">10 PM</SelectItem>
            <SelectItem value="23">11 PM</SelectItem>
            <SelectItem value="24">12 PM</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Hora de apagado</Label>
        <Select
          onValueChange={(value) => setHoraApagado(value)}
          defaultValue={horaApagado}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Hora de apagado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 AM</SelectItem>
            <SelectItem value="2">2 AM</SelectItem>
            <SelectItem value="3">3 AM</SelectItem>
            <SelectItem value="4">4 AM</SelectItem>
            <SelectItem value="5">5 AM</SelectItem>
            <SelectItem value="6">6 AM</SelectItem>
            <SelectItem value="7">7 AM</SelectItem>
            <SelectItem value="8">8 AM</SelectItem>
            <SelectItem value="9">9 AM</SelectItem>
            <SelectItem value="10">10 AM</SelectItem>
            <SelectItem value="11">11 AM</SelectItem>
            <SelectItem value="12">12 AM</SelectItem>
            <SelectItem value="13">1 PM</SelectItem>
            <SelectItem value="14">2 PM</SelectItem>
            <SelectItem value="15">3 PM</SelectItem>
            <SelectItem value="16">4 PM</SelectItem>
            <SelectItem value="17">5 PM</SelectItem>
            <SelectItem value="18">6 PM</SelectItem>
            <SelectItem value="19">7 PM</SelectItem>
            <SelectItem value="20">8 PM</SelectItem>
            <SelectItem value="21">9 PM</SelectItem>
            <SelectItem value="22">10 PM</SelectItem>
            <SelectItem value="23">11 PM</SelectItem>
            <SelectItem value="24">12 PM</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button variant="outline" disabled={buttonLogic()} onClick={handleSubmit}>
        Button
      </Button>
    </div>
  );
};

export default TimersForm;
