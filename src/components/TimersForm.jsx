import { useEffect, useState } from "react";
import PropTypes from "prop-types";
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
import useMqtt from "@/hooks/useMqtt";
import { Label } from "@/components/ui/label";

const TimersForm = ({ userId, timers, dId }) => {
  const { loading, callEndpoint } = useFetchAndLoad();
  const [horaEncendido, setHoraEncendido] = useState(null);
  const [horaApagado, setHoraApagado] = useState(null);
  const { setSend } = useMqtt();

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

    const res = await callEndpoint(setSingleTimer(timer, dId));
    if (res?.data.status === "success") {
      const toSend = {
        topic: userId + "/" + dId + "/" + timer.variable + "/actdata",
        msg: {
          value: 4,
        },
      };

      setSend({ msg: toSend.msg, topic: toSend.topic });
    }
  };

  if (!horaEncendido || !horaApagado) return null;

  return (
    <div className="w-full space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">
          Configuración de Temporizadores
        </h3>
        <p className="text-sm text-muted-foreground">
          Configure las horas de encendido y apagado automático
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hora de Encendido */}
        <div className="space-y-2">
          <Label htmlFor="hora-encendido">Hora de Encendido</Label>
          <Select
            defaultValue={horaEncendido}
            onValueChange={(value) => setHoraEncendido(value)}
          >
            <SelectTrigger className="w-full">
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

        {/* Hora de Apagado */}
        <div className="space-y-2">
          <Label htmlFor="hora-apagado">Hora de Apagado</Label>
          <Select
            onValueChange={(value) => setHoraApagado(value)}
            defaultValue={horaApagado}
          >
            <SelectTrigger className="w-full">
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
      </div>

      {/* Información del horario configurado */}
      <div className="p-3 bg-muted rounded-lg">
        <div className="text-sm text-muted-foreground">
          <strong>Horario configurado:</strong>
          <br />• Encendido:{" "}
          {horaEncendido
            ? parseInt(horaEncendido) > 12
              ? `${parseInt(horaEncendido) - 12} PM`
              : `${horaEncendido} ${
                  parseInt(horaEncendido) === 12 ? "PM" : "AM"
                }`
            : "No configurado"}
          <br />• Apagado:{" "}
          {horaApagado
            ? parseInt(horaApagado) > 12
              ? `${parseInt(horaApagado) - 12} PM`
              : `${horaApagado} ${parseInt(horaApagado) === 12 ? "PM" : "AM"}`
            : "No configurado"}
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          variant="outline"
          disabled={buttonLogic()}
          onClick={handleSubmit}
          className="min-w-32"
        >
          {loading ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </div>
  );
};

TimersForm.propTypes = {
  userId: PropTypes.string.isRequired,
  timers: PropTypes.shape({
    encendido: PropTypes.number,
    apagado: PropTypes.number,
    variable: PropTypes.string,
  }),
  dId: PropTypes.string.isRequired,
};

export default TimersForm;
