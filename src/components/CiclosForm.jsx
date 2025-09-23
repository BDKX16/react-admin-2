import { useState, useEffect } from "react";
import PropTypes from "prop-types";
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

  // Estados para la UI amigable (tiempo encendido + tiempo apagado)
  const [tiempoEncendidoValue, setTiempoEncendidoValue] = useState("");
  const [tiempoEncendidoUnit, setTiempoEncendidoUnit] = useState("seconds");
  const [tiempoApagadoValue, setTiempoApagadoValue] = useState("");
  const [tiempoApagadoUnit, setTiempoApagadoUnit] = useState("seconds");

  // Función para convertir tiempo a milisegundos
  const timeToMilliseconds = (value, unit) => {
    const numValue = parseInt(value) || 0;
    switch (unit) {
      case "seconds":
        return numValue * 1000;
      case "minutes":
        return numValue * 60 * 1000;
      case "hours":
        return numValue * 60 * 60 * 1000;
      default:
        return 0;
    }
  };

  // Función para convertir milisegundos a tiempo legible
  const millisecondsToTime = (ms) => {
    if (ms >= 3600000) {
      // >= 1 hora
      return { value: Math.floor(ms / 3600000), unit: "hours" };
    } else if (ms >= 60000) {
      // >= 1 minuto
      return { value: Math.floor(ms / 60000), unit: "minutes" };
    } else {
      return { value: Math.floor(ms / 1000), unit: "seconds" };
    }
  };

  useEffect(() => {
    if (ciclo && ciclo.tiempoEncendido && ciclo.tiempoTotal) {
      // Convertir datos del dispositivo (tiempo total + tiempo encendido)
      // a formato amigable (tiempo encendido + tiempo apagado)
      const tiempoEncendidoMs = ciclo.tiempoEncendido;
      const tiempoTotalMs = ciclo.tiempoTotal;
      const tiempoApagadoMs = tiempoTotalMs - tiempoEncendidoMs;

      const encendido = millisecondsToTime(tiempoEncendidoMs);
      const apagado = millisecondsToTime(tiempoApagadoMs);

      setTiempoEncendidoValue(encendido.value.toString());
      setTiempoEncendidoUnit(encendido.unit);
      setTiempoApagadoValue(apagado.value.toString());
      setTiempoApagadoUnit(apagado.unit);
    }
  }, [ciclo]);

  // Verificar si hay cambios para habilitar/deshabilitar el botón
  const hasChanges = () => {
    if (!ciclo) return false;

    const currentEncendidoMs = timeToMilliseconds(
      tiempoEncendidoValue,
      tiempoEncendidoUnit
    );
    const currentApagadoMs = timeToMilliseconds(
      tiempoApagadoValue,
      tiempoApagadoUnit
    );
    const currentTotalMs = currentEncendidoMs + currentApagadoMs;

    return (
      currentEncendidoMs !== ciclo.tiempoEncendido ||
      currentTotalMs !== ciclo.tiempoTotal
    );
  };

  const handleSubmit = async () => {
    // Convertir UI amigable a formato del dispositivo
    const tiempoEncendidoMs = timeToMilliseconds(
      tiempoEncendidoValue,
      tiempoEncendidoUnit
    );
    const tiempoApagadoMs = timeToMilliseconds(
      tiempoApagadoValue,
      tiempoApagadoUnit
    );
    const tiempoTotalMs = tiempoEncendidoMs + tiempoApagadoMs;

    // Validaciones
    if (tiempoEncendidoMs <= 0) {
      alert("El tiempo encendido debe ser mayor a 0");
      return;
    }
    if (tiempoApagadoMs <= 0) {
      alert("El tiempo apagado debe ser mayor a 0");
      return;
    }

    const toSend = {
      encendido: tiempoEncendidoMs, // Tiempo encendido en ms
      apagado: tiempoTotalMs, // Tiempo total en ms (lo que el dispositivo llama "apagado")
      variable: ciclo.variable,
    };

    console.log("Enviando al dispositivo:", {
      tiempoEncendido: tiempoEncendidoMs,
      tiempoTotal: tiempoTotalMs,
      variable: ciclo.variable,
    });

    await callEndpoint(setSingleCicle(toSend, dId));
  };

  if (!ciclo) return null;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Configuración de Ciclos</h3>
        <p className="text-sm text-muted-foreground">
          Configure los tiempos de encendido y apagado del dispositivo
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tiempo Encendido */}
        <div className="space-y-2">
          <Label htmlFor="tiempo-encendido">Tiempo Encendido</Label>
          <div className="flex space-x-2">
            <Input
              id="tiempo-encendido"
              type="number"
              min="1"
              placeholder="0"
              value={tiempoEncendidoValue}
              onChange={(e) => setTiempoEncendidoValue(e.target.value)}
              className="flex-1"
            />
            <Select
              value={tiempoEncendidoUnit}
              onValueChange={setTiempoEncendidoUnit}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="seconds">Segundos</SelectItem>
                <SelectItem value="minutes">Minutos</SelectItem>
                <SelectItem value="hours">Horas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tiempo Apagado */}
        <div className="space-y-2">
          <Label htmlFor="tiempo-apagado">Tiempo Apagado</Label>
          <div className="flex space-x-2">
            <Input
              id="tiempo-apagado"
              type="number"
              min="1"
              placeholder="0"
              value={tiempoApagadoValue}
              onChange={(e) => setTiempoApagadoValue(e.target.value)}
              className="flex-1"
            />
            <Select
              value={tiempoApagadoUnit}
              onValueChange={setTiempoApagadoUnit}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="seconds">Segundos</SelectItem>
                <SelectItem value="minutes">Minutos</SelectItem>
                <SelectItem value="hours">Horas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Información del ciclo calculado */}
      <div className="p-3 bg-muted rounded-lg">
        <div className="text-sm text-muted-foreground">
          <strong>Ciclo resultante:</strong>
          <br />• Encendido: {tiempoEncendidoValue || 0} {tiempoEncendidoUnit}
          <br />• Apagado: {tiempoApagadoValue || 0} {tiempoApagadoUnit}
          <br />• Ciclo total:{" "}
          {(parseInt(tiempoEncendidoValue) || 0) +
            (parseInt(tiempoApagadoValue) || 0)}{" "}
          {tiempoEncendidoUnit === tiempoApagadoUnit
            ? tiempoEncendidoUnit
            : "unidades mixtas"}
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={!hasChanges() || loading}
          className="min-w-32"
        >
          {loading ? "Guardando..." : "Guardar Ciclo"}
        </Button>
      </div>
    </div>
  );
};

CiclosForm.propTypes = {
  ciclo: PropTypes.shape({
    tiempoEncendido: PropTypes.number,
    tiempoTotal: PropTypes.number,
    variable: PropTypes.string,
  }),
  dId: PropTypes.string.isRequired,
};

export default CiclosForm;
