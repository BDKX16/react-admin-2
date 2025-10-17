import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Thermometer,
  Droplets,
  Wind,
  GitBranch,
  Clock,
  Zap,
  Power,
  Bell,
  Plus,
  Sprout,
  Sun,
  CloudRain,
  Sunrise,
  Moon,
  Calendar,
  CloudSnow,
  Leaf,
  Gauge,
  FlaskConical,
  Timer,
  Repeat,
  Activity,
  TrendingUp,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import PropTypes from "prop-types";

const triggerNodes = [
  {
    icon: Thermometer,
    label: "Temperatura",
    data: {
      label: "Sensor de Temperatura",
      icon: Thermometer,
      sensorType: "temperature",
    },
  },
  {
    icon: Droplets,
    label: "Humedad Aire",
    data: {
      label: "Sensor de Humedad",
      icon: Droplets,
      sensorType: "humidity",
    },
  },
  {
    icon: Sprout,
    label: "Humedad Suelo",
    data: {
      label: "Humedad del Suelo",
      icon: Sprout,
      sensorType: "soilMoisture",
    },
  },
  {
    icon: Wind,
    label: "CO2",
    data: { label: "Sensor de CO2", icon: Wind, sensorType: "co2" },
  },
  {
    icon: FlaskConical,
    label: "pH",
    data: { label: "Sensor de pH", icon: FlaskConical, sensorType: "ph" },
  },
  {
    icon: Clock,
    label: "Horario",
    data: { label: "Horario", icon: Clock, sensorType: "schedule" },
  },
];

const conditionNodes = [
  {
    icon: GitBranch,
    label: "Comparación",
    data: {
      label: "Comparar Valor",
      icon: GitBranch,
      conditionType: "comparison",
      condition: "> < = !=",
    },
  },
  {
    icon: GitBranch,
    label: "Rango",
    data: {
      label: "En Rango",
      icon: GitBranch,
      conditionType: "range",
      condition: "min - max",
    },
  },
  {
    icon: Clock,
    label: "Horario",
    data: {
      label: "Verificar Horario",
      icon: Clock,
      conditionType: "time",
      condition: "HH:MM",
    },
  },
  {
    icon: Sunrise,
    label: "Amanecer/Atardecer",
    data: {
      label: "Hora Solar",
      icon: Sunrise,
      conditionType: "solar",
      condition: "sunrise/sunset",
    },
  },
  {
    icon: Moon,
    label: "Día/Noche",
    data: {
      label: "Ciclo Diurno",
      icon: Moon,
      conditionType: "dayNight",
      condition: "day/night",
    },
  },
  {
    icon: Calendar,
    label: "Estación",
    data: {
      label: "Estación del Año",
      icon: Calendar,
      conditionType: "season",
      condition: "primavera/verano/otoño/invierno",
    },
  },
  {
    icon: CloudRain,
    label: "Pronóstico Lluvia",
    data: {
      label: "Probabilidad de Lluvia",
      icon: CloudRain,
      conditionType: "rainForecast",
      condition: "> 50%",
    },
  },
  {
    icon: CloudSnow,
    label: "Riesgo Helada",
    data: {
      label: "Alerta de Helada",
      icon: CloudSnow,
      conditionType: "frostRisk",
      condition: "< 2°C",
    },
  },
  {
    icon: Thermometer,
    label: "Índice de Calor",
    data: {
      label: "Sensación Térmica",
      icon: Thermometer,
      conditionType: "heatIndex",
      condition: "temp + humedad",
    },
  },
  {
    icon: Leaf,
    label: "Punto de Rocío",
    data: {
      label: "Punto de Rocío",
      icon: Leaf,
      conditionType: "dewPoint",
      condition: "condensación",
    },
  },
  {
    icon: Sun,
    label: "Horas de Luz",
    data: {
      label: "Duración del Día",
      icon: Sun,
      conditionType: "daylightHours",
      condition: "> 12h",
    },
  },
  {
    icon: Sprout,
    label: "Déficit Hídrico",
    data: {
      label: "Necesidad de Riego",
      icon: Sprout,
      conditionType: "waterDeficit",
      condition: "evaporación - lluvia",
    },
  },
];

const actionNodes = [
  {
    icon: Power,
    label: "Switch ON",
    data: {
      label: "Encender Switch",
      icon: Power,
      action: "Activar",
      actionType: "switch",
    },
  },
  {
    icon: Power,
    label: "Switch OFF",
    data: {
      label: "Apagar Switch",
      icon: Power,
      action: "Desactivar",
      actionType: "switch",
    },
  },
  {
    icon: Zap,
    label: "Toggle",
    data: {
      label: "Alternar Switch",
      icon: Zap,
      action: "Toggle",
      actionType: "toggle",
    },
  },
  {
    icon: Bell,
    label: "Notificación",
    data: {
      label: "Enviar Notificación",
      icon: Bell,
      action: "Notificar",
      actionType: "notification",
    },
  },
  {
    icon: Gauge,
    label: "Control PID",
    data: {
      label: "Control PID",
      icon: Gauge,
      action: "PID",
      actionType: "pid",
    },
  },
  {
    icon: Timer,
    label: "Modo Timer",
    data: {
      label: "Modo Timer",
      icon: Timer,
      action: "Timer",
      actionType: "timer",
    },
  },
  {
    icon: Repeat,
    label: "Modo Ciclos",
    data: {
      label: "Modo Ciclos",
      icon: Repeat,
      action: "Ciclos",
      actionType: "cycles",
    },
  },
  {
    icon: Activity,
    label: "Modo PWM",
    data: {
      label: "Modo PWM",
      icon: Activity,
      action: "PWM",
      actionType: "pwm",
    },
  },
  {
    icon: TrendingUp,
    label: "Modo PI",
    data: {
      label: "Control PI",
      icon: TrendingUp,
      action: "PI",
      actionType: "pi",
    },
  },
  {
    icon: TrendingUp,
    label: "Modo P",
    data: {
      label: "Control P",
      icon: TrendingUp,
      action: "P",
      actionType: "p",
    },
  },
];

export function NodePalette({ onAddNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      className={`${
        isCollapsed ? "w-12" : "w-64"
      } transition-all duration-300 ease-in-out border-l border-border bg-card flex flex-col h-full`}
    >
      {/* Header con botón de colapso */}
      <div
        className={`${
          isCollapsed ? "p-2" : "p-4"
        } border-b border-border flex items-center justify-between flex-shrink-0`}
      >
        {!isCollapsed && (
          <div className="flex-1">
            <h2 className="font-semibold text-sm">Paleta de Nodos</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Arrastra o haz clic para agregar
            </p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCollapse}
          className={`${isCollapsed ? "w-8 h-8 p-0" : "ml-2"} flex-shrink-0`}
        >
          {isCollapsed ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Contenido colapsable */}
      {!isCollapsed && (
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {/* Triggers */}
            <div>
              <h3 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                Triggers
              </h3>
              <div className="space-y-2">
                {triggerNodes.map((node, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 h-auto py-2 bg-transparent"
                    onClick={() => onAddNode("trigger", node.data)}
                  >
                    <div className="p-1 rounded bg-chart-1/10">
                      <node.icon className="h-3.5 w-3.5 text-chart-1" />
                    </div>
                    <span className="text-xs">{node.label}</span>
                    <Plus className="h-3 w-3 ml-auto opacity-50" />
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Conditions */}
            <div>
              <h3 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                Condiciones
              </h3>
              <div className="space-y-2">
                {conditionNodes.map((node, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 h-auto py-2 bg-transparent"
                    onClick={() => onAddNode("condition", node.data)}
                  >
                    <div className="p-1 rounded bg-chart-2/10">
                      <node.icon className="h-3.5 w-3.5 text-chart-2" />
                    </div>
                    <span className="text-xs">{node.label}</span>
                    <Plus className="h-3 w-3 ml-auto opacity-50" />
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div>
              <h3 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                Acciones
              </h3>
              <div className="space-y-2">
                {actionNodes.map((node, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 h-auto py-2 bg-transparent"
                    onClick={() => onAddNode("action", node.data)}
                  >
                    <div className="p-1 rounded bg-chart-3/10">
                      <node.icon className="h-3.5 w-3.5 text-chart-3" />
                    </div>
                    <span className="text-xs">{node.label}</span>
                    <Plus className="h-3 w-3 ml-auto opacity-50" />
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      )}

      {/* Versión colapsada - solo iconos */}
      {isCollapsed && (
        <div className="flex flex-col items-center py-2 space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0"
            title="Triggers"
          >
            <Thermometer className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0"
            title="Condiciones"
          >
            <GitBranch className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0"
            title="Acciones"
          >
            <Zap className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

NodePalette.propTypes = {
  onAddNode: PropTypes.func.isRequired,
};
