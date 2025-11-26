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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useMqtt from "@/hooks/useMqtt";

const CiclosForm = ({ userId, ciclo, dId }) => {
  const { setSend } = useMqtt();

  // Estados para la UI amigable (tiempo encendido + tiempo apagado)
  const [tiempoEncendidoValue, setTiempoEncendidoValue] = useState("");
  const [tiempoEncendidoUnit, setTiempoEncendidoUnit] = useState("seconds");
  const [tiempoApagadoValue, setTiempoApagadoValue] = useState("");
  const [tiempoApagadoUnit, setTiempoApagadoUnit] = useState("seconds");
  const [showWarning, setShowWarning] = useState(false);

  // Valor mínimo para proteger el relay (5 segundos)
  const TIEMPO_MINIMO_RELAY = 5;

  // Función para obtener el valor mínimo según la unidad
  const getMinValueForUnit = (unit) => {
    switch (unit) {
      case "seconds":
        return TIEMPO_MINIMO_RELAY; // 5 segundos
      case "minutes":
        return 1; // 1 minuto = 60 segundos (> 5 segundos)
      case "hours":
        return 1; // 1 hora (> 5 segundos)
      default:
        return 1;
    }
  };

  // Función para convertir tiempo a segundos
  const timeToSeconds = (value, unit) => {
    const numValue = parseInt(value) || 0;
    switch (unit) {
      case "seconds":
        return numValue;
      case "minutes":
        return numValue * 60;
      case "hours":
        return numValue * 3600;
      default:
        return 0;
    }
  };

  // Función para convertir segundos a tiempo legible
  const secondsToTime = (seconds) => {
    if (seconds >= 3600) {
      // >= 1 hora
      return { value: Math.floor(seconds / 3600), unit: "hours" };
    } else if (seconds >= 60) {
      // >= 1 minuto
      return { value: Math.floor(seconds / 60), unit: "minutes" };
    } else {
      return { value: seconds, unit: "seconds" };
    }
  };

  useEffect(() => {
    if (ciclo && ciclo.tiempoEncendido && ciclo.tiempoTotal) {
      // El backend y dispositivo usan segundos
      const tiempoEncendidoSeg = ciclo.tiempoEncendido;
      const tiempoTotalSeg = ciclo.tiempoTotal;
      const tiempoApagadoSeg = tiempoTotalSeg - tiempoEncendidoSeg;

      const encendido = secondsToTime(tiempoEncendidoSeg);
      const apagado = secondsToTime(tiempoApagadoSeg);

      setTiempoEncendidoValue(encendido.value.toString());
      setTiempoEncendidoUnit(encendido.unit);
      setTiempoApagadoValue(apagado.value.toString());
      setTiempoApagadoUnit(apagado.unit);
    }
  }, [ciclo]);

  // Verificar si hay cambios para habilitar/deshabilitar el botón
  const hasChanges = () => {
    if (!ciclo) return false;

    const currentEncendidoSeg = timeToSeconds(
      tiempoEncendidoValue,
      tiempoEncendidoUnit
    );
    const currentApagadoSeg = timeToSeconds(
      tiempoApagadoValue,
      tiempoApagadoUnit
    );
    const currentTotalSeg = currentEncendidoSeg + currentApagadoSeg;

    return (
      currentEncendidoSeg !== ciclo.tiempoEncendido ||
      currentTotalSeg !== ciclo.tiempoTotal
    );
  };

  const handleSubmit = () => {
    // Convertir UI a segundos (formato del backend y dispositivo)
    const tiempoEncendidoSeg = timeToSeconds(
      tiempoEncendidoValue,
      tiempoEncendidoUnit
    );
    const tiempoApagadoSeg = timeToSeconds(
      tiempoApagadoValue,
      tiempoApagadoUnit
    );
    const tiempoTotalSeg = tiempoEncendidoSeg + tiempoApagadoSeg;

    // Validaciones básicas (los mínimos ya están controlados por el input)
    if (tiempoEncendidoSeg <= 0 || tiempoApagadoSeg <= 0) {
      alert("Por favor ingrese valores válidos para los tiempos");
      return;
    }

    // Send MQTT message with ciclo values
    const toSend = {
      topic: `${userId}/${dId}/${ciclo.variable}/actdata`,
      msg: {
        value: 5, // Modo Ciclos
        tiempoEncendido: tiempoEncendidoSeg,
        tiempoTotal: tiempoTotalSeg,
      },
    };

    setSend({ msg: toSend.msg, topic: toSend.topic });
  };

  if (!ciclo) return null;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Configuración de Ciclos</h3>
        <p className="text-sm text-muted-foreground">
          Configure los tiempos de encendido y apagado del dispositivo
        </p>
        {showWarning && (
          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md p-3 mt-2">
            <p className="text-xs text-amber-800 dark:text-amber-200">
              ⚠️ <strong>Importante:</strong> Los tiempos mínimos son de 5
              segundos para proteger el relay magnético de 10A contra desgaste
              prematuro.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tiempo Encendido */}
        <div className="space-y-2">
          <Label htmlFor="tiempo-encendido">Tiempo Encendido</Label>
          <div className="flex space-x-2">
            <Input
              id="tiempo-encendido"
              type="number"
              min={getMinValueForUnit(tiempoEncendidoUnit)}
              placeholder={getMinValueForUnit(tiempoEncendidoUnit).toString()}
              value={tiempoEncendidoValue}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                const minVal = getMinValueForUnit(tiempoEncendidoUnit);
                if (val >= minVal || e.target.value === "") {
                  setTiempoEncendidoValue(e.target.value);
                }
                // Mostrar warning si el valor en segundos es <= 5
                const segundosActuales = timeToSeconds(
                  e.target.value,
                  tiempoEncendidoUnit
                );
                setShowWarning(
                  segundosActuales > 0 &&
                    segundosActuales <= TIEMPO_MINIMO_RELAY
                );
              }}
              className="flex-1"
            />
            <Select
              value={tiempoEncendidoUnit}
              onValueChange={(newUnit) => {
                const currentSeconds = timeToSeconds(
                  tiempoEncendidoValue,
                  tiempoEncendidoUnit
                );
                const minVal = getMinValueForUnit(newUnit);
                setTiempoEncendidoUnit(newUnit);
                // Ajustar el valor si es menor al mínimo de la nueva unidad
                if (currentSeconds < TIEMPO_MINIMO_RELAY) {
                  setTiempoEncendidoValue(minVal.toString());
                }
              }}
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
              min={getMinValueForUnit(tiempoApagadoUnit)}
              placeholder={getMinValueForUnit(tiempoApagadoUnit).toString()}
              value={tiempoApagadoValue}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                const minVal = getMinValueForUnit(tiempoApagadoUnit);
                if (val >= minVal || e.target.value === "") {
                  setTiempoApagadoValue(e.target.value);
                }
                // Mostrar warning si el valor en segundos es <= 5
                const segundosActuales = timeToSeconds(
                  e.target.value,
                  tiempoApagadoUnit
                );
                setShowWarning(
                  segundosActuales > 0 &&
                    segundosActuales <= TIEMPO_MINIMO_RELAY
                );
              }}
              className="flex-1"
            />
            <Select
              value={tiempoApagadoUnit}
              onValueChange={(newUnit) => {
                const currentSeconds = timeToSeconds(
                  tiempoApagadoValue,
                  tiempoApagadoUnit
                );
                const minVal = getMinValueForUnit(newUnit);
                setTiempoApagadoUnit(newUnit);
                // Ajustar el valor si es menor al mínimo de la nueva unidad
                if (currentSeconds < TIEMPO_MINIMO_RELAY) {
                  setTiempoApagadoValue(minVal.toString());
                }
              }}
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
          disabled={!hasChanges()}
          className="min-w-32"
        >
          Guardar Ciclo
        </Button>
      </div>
    </div>
  );
};

CiclosForm.propTypes = {
  userId: PropTypes.string.isRequired,
  ciclo: PropTypes.shape({
    tiempoEncendido: PropTypes.number,
    tiempoTotal: PropTypes.number,
    variable: PropTypes.string,
  }),
  dId: PropTypes.string.isRequired,
};

export default CiclosForm;
