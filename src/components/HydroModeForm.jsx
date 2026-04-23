import { useState, useEffect } from "react";
import PropTypes from "prop-types";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, Droplets, Wind, Moon, Sprout, Waves, Cloud } from "lucide-react";
import axios from "axios";
import useMqtt from "@/hooks/useMqtt";
import useFetchAndLoad from "@/hooks/useFetchAndLoad";
import { setSingleCicle } from "../services/public";

const HydroModeForm = ({ userId, dId, mode, hydroType, variable, currentConfig }) => {
  const { setSend, recived } = useMqtt();
  const { loading, callEndpoint } = useFetchAndLoad();

  // Estados para tiempos
  const [tiempoEncendidoValue, setTiempoEncendidoValue] = useState("");
  const [tiempoEncendidoUnit, setTiempoEncendidoUnit] = useState("minutes");
  const [tiempoApagadoValue, setTiempoApagadoValue] = useState("");
  const [tiempoApagadoUnit, setTiempoApagadoUnit] = useState("minutes");
  const [showWarning, setShowWarning] = useState(false);

  const TIEMPO_MINIMO_RELAY = 5; // segundos

  // Tipos de hidroponía con sus presets (debe coincidir con HydroponicPumpCard)
  const HYDRO_TYPES = {
    nft: {
      name: "NFT (Nutrient Film)",
      icon: Waves,
      description: "Película nutritiva en canales",
      modes: {
        eco: { 
          name: "Eco",
          description: "Ahorro de energía y agua",
          detail: "Ciclo eficiente",
          onMin: 15, 
          offMin: 20 
        },
        normal: { 
          name: "Normal",
          description: "Ciclo estándar",
          detail: "Flujo continuo para película nutritiva",
          onMin: 20, 
          offMin: 5 
        },
        silencio: { 
          name: "Silencio",
          description: "Bajo ruido nocturno",
          detail: "Ciclos espaciados",
          onMin: 10, 
          offMin: 25 
        },
      },
    },
    dwc: {
      name: "DWC (Deep Water)",
      icon: Wind,
      description: "Raíces sumergidas con oxigenación",
      modes: {
        eco: { 
          name: "Eco",
          description: "Ahorro de energía",
          detail: "Oxigenación eficiente",
          onMin: 20, 
          offMin: 30 
        },
        normal: { 
          name: "Normal",
          description: "Ciclo equilibrado",
          detail: "Oxigenación balanceada para raíces sumergidas",
          onMin: 30, 
          offMin: 30 
        },
        silencio: { 
          name: "Silencio",
          description: "Bajo ruido",
          detail: "Ciclos espaciados",
          onMin: 15, 
          offMin: 40 
        },
      },
    },
    aeroponico: {
      name: "Aeropónico",
      icon: Cloud,
      description: "Nebulización de raíces",
      modes: {
        eco: { 
          name: "Eco",
          description: "Ahorro de agua",
          detail: "Nebulización eficiente",
          onSec: 20, 
          offMin: 5 
        },
        normal: { 
          name: "Normal",
          description: "Nebulización frecuente",
          detail: "Ciclos cortos para raíces expuestas",
          onSec: 30, 
          offMin: 4.5 
        },
        silencio: { 
          name: "Silencio",
          description: "Bajo ruido",
          detail: "Nebulización espaciada",
          onSec: 15, 
          offMin: 7 
        },
      },
    },
    torres: {
      name: "Torres/Goteo Vertical",
      icon: Droplets,
      description: "Sistema de goteo en torres",
      modes: {
        eco: { 
          name: "Eco",
          description: "Ahorro de agua y energía",
          detail: "Ciclo eficiente para torres",
          onMin: 10, 
          offMin: 20 
        },
        normal: { 
          name: "Normal",
          description: "Ciclo estándar",
          detail: "Equilibrado para goteo vertical",
          onMin: 15, 
          offMin: 15 
        },
        silencio: { 
          name: "Silencio",
          description: "Bajo ruido nocturno",
          detail: "Ciclos espaciados",
          onMin: 5, 
          offMin: 30 
        },
      },
    },
  };

  // Obtener preset actual según tipo y modo
  const getCurrentPresetConfig = () => {
    if (mode === "custom" || !hydroType) {
      return null;
    }

    const typeConfig = HYDRO_TYPES[hydroType];
    if (!typeConfig || !typeConfig.modes[mode]) {
      return null;
    }

    return typeConfig.modes[mode];
  };

  const preset = getCurrentPresetConfig();

  // Función para convertir tiempo a segundos
  const timeToSeconds = (value, unit) => {
    const numValue = parseFloat(value) || 0;
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
    if (seconds >= 3600 && seconds % 3600 === 0) {
      return { value: seconds / 3600, unit: "hours" };
    } else if (seconds >= 60 && seconds % 60 === 0) {
      return { value: seconds / 60, unit: "minutes" };
    } else {
      return { value: seconds, unit: "seconds" };
    }
  };

  // Cargar valores del preset cuando se selecciona eco/normal/silencio
  useEffect(() => {
    if (mode === "custom") return; // custom se maneja por MQTT

    if (preset) {
      if (preset.onSec !== undefined) {
        setTiempoEncendidoValue(preset.onSec.toString());
        setTiempoEncendidoUnit("seconds");
      } else if (preset.onMin !== undefined) {
        setTiempoEncendidoValue(preset.onMin.toString());
        setTiempoEncendidoUnit("minutes");
      }

      if (preset.offMin !== undefined) {
        setTiempoApagadoValue(preset.offMin.toString());
        setTiempoApagadoUnit("minutes");
      } else if (preset.offSec !== undefined) {
        setTiempoApagadoValue(preset.offSec.toString());
        setTiempoApagadoUnit("seconds");
      }
    }
  }, [mode, hydroType]);

  // En modo custom: escuchar valores que llegan por MQTT desde el dispositivo
  useEffect(() => {
    if (mode !== "custom") return;

    if (recived) {
      recived.map((item) => {
        if (item.dId === dId && item.variable === variable) {
          console.log("=== MQTT recibido en HydroModeForm (custom) ===", item);
          const tiempoEncendidoSeg = item.tiempoEncendido;
          const tiempoTotalSeg = item.tiempoTotal;
          if (tiempoEncendidoSeg > 0 && tiempoTotalSeg > 0) {
            const tiempoApagadoSeg = tiempoTotalSeg - tiempoEncendidoSeg;
            const encendido = secondsToTime(tiempoEncendidoSeg);
            const apagado = secondsToTime(tiempoApagadoSeg);
            setTiempoEncendidoValue(encendido.value.toString());
            setTiempoEncendidoUnit(encendido.unit);
            setTiempoApagadoValue(apagado.value.toString());
            setTiempoApagadoUnit(apagado.unit);
          }
        }
      });
    }
  }, [recived, dId, variable, mode]);

  // NO guardar automáticamente presets - los valores se guardan solo en modo custom
  // Los presets solo sirven como referencia visual
  // Los valores reales siempre vienen del dispositivo via currentConfig

  const getMinValueForUnit = (unit) => {
    switch (unit) {
      case "seconds":
        return TIEMPO_MINIMO_RELAY;
      case "minutes":
        return 1;
      case "hours":
        return 1;
      default:
        return 1;
    }
  };

  const hasChanges = () => {
    if (!currentConfig) return true;

    const tiempoEncendidoSeg = timeToSeconds(
      tiempoEncendidoValue,
      tiempoEncendidoUnit
    );
    const tiempoApagadoSeg = timeToSeconds(
      tiempoApagadoValue,
      tiempoApagadoUnit
    );
    const tiempoTotalSeg = tiempoEncendidoSeg + tiempoApagadoSeg;

    return (
      tiempoEncendidoSeg !== currentConfig.tiempoEncendido ||
      tiempoTotalSeg !== currentConfig.tiempoTotal
    );
  };

  const handleApply = async () => {
    const tiempoEncendidoSeg = timeToSeconds(
      tiempoEncendidoValue,
      tiempoEncendidoUnit
    );
    const tiempoApagadoSeg = timeToSeconds(
      tiempoApagadoValue,
      tiempoApagadoUnit
    );
    const tiempoTotalSeg = tiempoEncendidoSeg + tiempoApagadoSeg;

    if (tiempoEncendidoSeg <= 0 || tiempoApagadoSeg <= 0) {
      alert("Por favor ingrese valores válidos para los tiempos");
      return;
    }

    // Validar mínimos
    if (tiempoEncendidoSeg < TIEMPO_MINIMO_RELAY || tiempoApagadoSeg < TIEMPO_MINIMO_RELAY) {
      setShowWarning(true);
      return;
    }

    // Send MQTT message
    const toSend = {
      topic: `${userId}/${dId}/${variable}/actdata`,
      msg: {
        value: 5, // Modo Ciclos
        tiempoEncendido: tiempoEncendidoSeg,
        tiempoTotal: tiempoTotalSeg,
      },
    };

    setSend({ msg: toSend.msg, topic: toSend.topic });

    // Persist ciclo timing to database
    const cicloConfig = {
      tiempoEncendido: tiempoEncendidoSeg,
      tiempoTotal: tiempoTotalSeg,
      variable: variable,
    };

    await callEndpoint(setSingleCicle(cicloConfig, dId));

    // Persist hydroMode to device-config
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/device-config`,
        {
          dId: dId,
          configs: [
            {
              variable: variable,
              hydroMode: mode,
            },
          ],
        },
        {
          headers: {
            token: token,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.error("Error guardando hydroMode en device-config:", error);
    }
  };

  const PresetIcon = preset?.icon;

  return (
    <div className="space-y-4">
      {/* Header con descripción del preset o personalizado */}
      {preset ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {PresetIcon && <PresetIcon className="h-5 w-5 text-blue-500" />}
            <h3 className="text-lg font-semibold">{preset.name}</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm font-medium">{preset.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {preset.detail}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-sm text-muted-foreground">{preset.description}</p>
        </div>
      ) : (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Modo Personalizado</h3>
          <p className="text-sm text-muted-foreground">
            Configure los tiempos de encendido y apagado manualmente
          </p>
        </div>
      )}

      {showWarning && (
        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md p-3">
          <p className="text-xs text-amber-800 dark:text-amber-200">
            ⚠️ <strong>Importante:</strong> Los tiempos mínimos son de 5
            segundos para proteger el relay magnético contra desgaste prematuro.
          </p>
        </div>
      )}

      {/* Configuración de tiempos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tiempo Encendido */}
        <div className="space-y-2">
          <Label htmlFor="tiempo-encendido">Tiempo Encendido</Label>
          <div className="flex space-x-2">
            <Input
              id="tiempo-encendido"
              type="number"
              step="0.1"
              placeholder={getMinValueForUnit(tiempoEncendidoUnit).toString()}
              value={tiempoEncendidoValue}
              onChange={(e) => {
                setTiempoEncendidoValue(e.target.value);
                const segundos = timeToSeconds(e.target.value, tiempoEncendidoUnit);
                setShowWarning(segundos > 0 && segundos < TIEMPO_MINIMO_RELAY);
              }}
              onBlur={(e) => {
                const segundos = timeToSeconds(e.target.value, tiempoEncendidoUnit);
                if (segundos > 0 && segundos < TIEMPO_MINIMO_RELAY) {
                  const { value, unit } = secondsToTime(TIEMPO_MINIMO_RELAY);
                  setTiempoEncendidoValue(value.toString());
                  setTiempoEncendidoUnit(unit);
                  setShowWarning(true);
                }
              }}
              disabled={mode !== "custom" && preset}
              className="flex-1"
            />
            <Select
              value={tiempoEncendidoUnit}
              onValueChange={setTiempoEncendidoUnit}
              disabled={mode !== "custom" && preset}
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
              step="0.1"
              placeholder={getMinValueForUnit(tiempoApagadoUnit).toString()}
              value={tiempoApagadoValue}
              onChange={(e) => {
                setTiempoApagadoValue(e.target.value);
                const segundos = timeToSeconds(e.target.value, tiempoApagadoUnit);
                setShowWarning(segundos > 0 && segundos < TIEMPO_MINIMO_RELAY);
              }}
              onBlur={(e) => {
                const segundos = timeToSeconds(e.target.value, tiempoApagadoUnit);
                if (segundos > 0 && segundos < TIEMPO_MINIMO_RELAY) {
                  const { value, unit } = secondsToTime(TIEMPO_MINIMO_RELAY);
                  setTiempoApagadoValue(value.toString());
                  setTiempoApagadoUnit(unit);
                  setShowWarning(true);
                }
              }}
              disabled={mode !== "custom" && preset}
              className="flex-1"
            />
            <Select
              value={tiempoApagadoUnit}
              onValueChange={setTiempoApagadoUnit}
              disabled={mode !== "custom" && preset}
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

      {/* Resumen del ciclo */}
      <div className="bg-muted/50 rounded-md p-3">
        <p className="text-sm">
          <span className="font-medium">Ciclo total:</span>{" "}
          {(() => {
            const totalSeg =
              timeToSeconds(tiempoEncendidoValue, tiempoEncendidoUnit) +
              timeToSeconds(tiempoApagadoValue, tiempoApagadoUnit);
            const { value, unit } = secondsToTime(totalSeg);
            const unitLabel = {
              seconds: "segundos",
              minutes: "minutos",
              hours: "horas",
            }[unit];
            return `${value} ${unitLabel}`;
          })()}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {timeToSeconds(tiempoEncendidoValue, tiempoEncendidoUnit)} seg ON /{" "}
          {timeToSeconds(tiempoApagadoValue, tiempoApagadoUnit)} seg OFF
        </p>
      </div>

      {/* Botón aplicar - solo en modo custom */}
      {mode === "custom" && (
        <Button
          onClick={handleApply}
          disabled={loading || !hasChanges()}
          className="w-full"
        >
          {loading ? "Aplicando..." : "Guardar Configuración"}
        </Button>
      )}
    </div>
  );
};

HydroModeForm.propTypes = {
  userId: PropTypes.string.isRequired,
  dId: PropTypes.string.isRequired,
  mode: PropTypes.oneOf([
    "eco",
    "normal",
    "silencio",
    "custom",
  ]).isRequired,
  hydroType: PropTypes.oneOf([
    "nft",
    "dwc",
    "aeroponico",
    "torres",
  ]).isRequired,
  variable: PropTypes.string.isRequired,
  currentConfig: PropTypes.shape({
    tiempoEncendido: PropTypes.number,
    tiempoTotal: PropTypes.number,
    variable: PropTypes.string,
  }),
};

export default HydroModeForm;
