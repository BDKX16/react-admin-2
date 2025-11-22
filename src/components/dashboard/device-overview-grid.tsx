"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Power,
  PowerOff,
  Sun,
  Moon,
  Plus,
  Clock,
  XCircle,
  Unplug,
  AlertTriangle,
  Radio,
  Wrench,
  Zap,
  AlertOctagon,
  BarChart3,
  Wifi,
  Database,
  Timer,
} from "lucide-react";
import { AddDeviceDialog } from "@/components/add-device-dialog";
import useMqtt from "@/hooks/useMqtt";
import useAuth from "@/hooks/useAuth";
import { mqttValueToMode } from "@/utils/mqttModeMapper";
import { useNavigate } from "react-router-dom";
import useFetchAndLoad from "@/hooks/useFetchAndLoad";
import useDevices from "@/hooks/useDevices";
import { selectDevice } from "@/services/public";

interface Sensor {
  name: string;
  value: string;
  unit: string;
  variable: string;
}

interface Device {
  id: string;
  name: string;
  type: string;
  status: "on" | "off";
  sensors: Sensor[];
  controls: Array<{
    name: string;
    status: "on" | "off";
    modes: string[];
    variable: string;
    slave?: string;
    initialName?: string;
    mode?: string;
    isOn?: boolean;
  }>;
  isGrowthDevice?: boolean;
  optimizedFor?: "crecimiento" | "floracion" | "clonacion";
  lightCycle?: {
    on: number;
    off: number;
  };
  startDate?: Date;
  phaseDurations?: {
    clonacion: number;
    vegetacion: number;
    floracion: number;
  };
}

function RadialGauge({
  value,
  max,
  label,
  unit,
  min = 0,
  isOnline = true,
}: {
  value: number;
  max: number;
  label: string;
  unit: string;
  min?: number;
  isOnline?: boolean;
}) {
  // Códigos de error del sensor con iconos
  const errorIcons: { [key: number]: React.ReactNode } = {
    0: null, // SENSOR_OK - Funcionando correctamente
    [-1]: <Clock className="w-6 h-6" />, // Timeout
    [-2]: <XCircle className="w-6 h-6" />, // Error lectura
    [-3]: <Unplug className="w-6 h-6" />, // Desconectado
    [-4]: <AlertTriangle className="w-6 h-6" />, // Datos inválidos
    [-5]: <Radio className="w-6 h-6" />, // Error I2C
    [-6]: <Wrench className="w-6 h-6" />, // Error calibración
    [-7]: <Zap className="w-6 h-6" />, // Error alimentación
    [-8]: <AlertOctagon className="w-6 h-6" />, // Error inicialización
    [-9]: <BarChart3 className="w-6 h-6" />, // Fuera de rango
    [-10]: <Unplug className="w-6 h-6" />, // Múltiples desconectados
    [-11]: <Wifi className="w-6 h-6" />, // Conflicto WiFi-ADC2
    [-12]: <Database className="w-6 h-6" />, // Error buffer
    [-13]: <Timer className="w-6 h-6" />, // Error frecuencia
  };

  // Verificar si hay un código de error
  const hasError = value < 0 && errorIcons[value];

  const percentage = ((value - min) / (max - min)) * 100;
  const normalizedPercentage = Math.max(0, Math.min(100, percentage));

  let color = "#4CB649"; // Brand green-bright - optimal
  let bgColor = "rgba(76, 182, 73, 0.1)";

  // Si hay error, usar colores rojos
  if (hasError) {
    color = "#ef4444"; // Red
    bgColor = "rgba(239, 68, 68, 0.1)";
  }
  // Si está offline, usar colores grises
  else if (!isOnline) {
    color = "#6b7280"; // Gray
    bgColor = "rgba(107, 114, 128, 0.1)";
  } else {
    if (label === "Temperatura") {
      if (value < 18 || value > 28) {
        color = "#248A49"; // Brand green-mid - warning
        bgColor = "rgba(36, 138, 73, 0.1)";
      }
      if (value < 15 || value > 32) {
        color = "#0A5F3C"; // Brand green-dark - critical
        bgColor = "rgba(10, 95, 60, 0.1)";
      }
    } else if (label === "Humedad" || label === "Humedad Suelo") {
      if (value < 40 || value > 80) {
        color = "#248A49";
        bgColor = "rgba(36, 138, 73, 0.1)";
      }
      if (value < 30 || value > 90) {
        color = "#0A5F3C";
        bgColor = "rgba(10, 95, 60, 0.1)";
      }
    }
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className="relative w-full aspect-square max-w-24 rounded-full flex items-center justify-center"
        style={{
          background: bgColor,
          border: `3px solid ${color}`,
        }}
      >
        <svg
          className="absolute w-full h-full"
          viewBox="0 0 96 96"
          style={{ transform: "rotate(-90deg)" }}
        >
          <circle
            cx="48"
            cy="48"
            r="40"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="4"
          />
          <circle
            cx="48"
            cy="48"
            r="40"
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeDasharray={`${
              hasError ? 0 : (normalizedPercentage / 100) * 251.2
            } 251.2`}
            style={{ transition: "stroke-dasharray 0.5s ease" }}
          />
        </svg>
        <div className="text-center z-10 px-1 flex items-center justify-center">
          {hasError ? (
            <div style={{ color }}>{errorIcons[value]}</div>
          ) : (
            <div>
              <p className="text-lg font-bold" style={{ color }}>
                {value}
              </p>
              <p className="text-xs text-muted-foreground">{unit}</p>
            </div>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2 text-center">{label}</p>
    </div>
  );
}

function LightCycleIndicator({
  onHours,
  offHours,
  isOnline = true,
}: {
  onHours: number;
  offHours: number;
  isOnline?: boolean;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase">
        Ciclo Luz
      </p>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <Sun
            className={`w-4 h-4 ${
              isOnline ? "text-yellow-400" : "text-gray-400"
            }`}
          />
          <span className="text-sm font-medium">{onHours}h</span>
        </div>
        <div className="text-xs text-muted-foreground">/</div>
        <div className="flex items-center gap-1.5">
          <Moon
            className={`w-4 h-4 ${
              isOnline ? "text-blue-400" : "text-gray-400"
            }`}
          />
          <span className="text-sm font-medium">{offHours}h</span>
        </div>
      </div>
    </div>
  );
}

function OptimizationBadge({ optimizedFor }: { optimizedFor?: string }) {
  if (!optimizedFor) return null;

  const labels: Record<string, string> = {
    crecimiento: "Optimizado para Crecimiento",
    floracion: "Optimizado para Floración",
    clonacion: "Optimizado para Clonación",
  };

  const colors: Record<string, string> = {
    crecimiento: "bg-green-500/20 text-green-400 border-green-500/30",
    floracion: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    clonacion: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  };

  return (
    <div
      className={`px-2 py-1 rounded text-xs font-semibold border ${
        colors[optimizedFor] || ""
      }`}
    >
      {labels[optimizedFor] || optimizedFor}
    </div>
  );
}

function CropProgressBar({ device }: { device: Device }) {
  if (!device.startDate || !device.phaseDurations) return null;

  const phases = [
    {
      name: "Clonación",
      durationDays: device.phaseDurations.clonacion,
      color: "bg-blue-500",
    },
    {
      name: "Vegetación",
      durationDays: device.phaseDurations.vegetacion,
      color: "bg-green-500",
    },
    {
      name: "Floración",
      durationDays: device.phaseDurations.floracion,
      color: "bg-orange-500",
    },
  ];

  const totalDays = phases.reduce((sum, phase) => sum + phase.durationDays, 0);
  if (totalDays === 0) return null;

  const daysElapsed = Math.floor(
    (Date.now() - device.startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const progressPercentage = Math.min((daysElapsed / totalDays) * 100, 100);

  let cumulativeDays = 0;
  const phaseBoundaries = phases.map((phase) => {
    const start = (cumulativeDays / totalDays) * 100;
    cumulativeDays += phase.durationDays;
    const end = (cumulativeDays / totalDays) * 100;
    return { phase: phase.name, start, end, color: phase.color };
  });

  return (
    <div className="space-y-2">
      {/* Progress Bar */}
      <div className="h-2 bg-muted/30 rounded-full overflow-hidden border border-border/30">
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-green-500 to-orange-500 transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Phase Markers */}
      <div className="relative h-6">
        <div className="absolute inset-x-0 top-0 h-full flex">
          {phaseBoundaries.map((boundary) => (
            <div
              key={boundary.phase}
              className="flex flex-col items-center justify-start flex-1"
              style={{ width: `${boundary.end - boundary.start}%` }}
            >
              <div className={`w-0.5 h-3 ${boundary.color}`} />
              <p className="text-xs font-semibold text-muted-foreground mt-0.5 text-center whitespace-nowrap text-[9px]">
                {boundary.phase}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface DeviceOverviewGridProps {
  devices: any[];
}

// Helper function to check if device is a growth device based on widgets
function isGrowthDevice(widgets: any[]): boolean {
  if (!widgets || widgets.length === 0) return false;

  // Check for indicators (sensors) typical of growth devices
  const hasTemperature = widgets.some(
    (w) =>
      w.widgetType === "Indicator" &&
      (w.variableFullName?.toLowerCase().includes("temp") ||
        w.name?.toLowerCase().includes("temp"))
  );
  const hasHumidity = widgets.some(
    (w) =>
      w.widgetType === "Indicator" &&
      (w.variableFullName?.toLowerCase().includes("hum") ||
        w.name?.toLowerCase().includes("hum"))
  );

  // Growth devices typically have both temperature and humidity
  return hasTemperature && hasHumidity;
}

// Helper function to extract sensor data from widgets
function extractSensors(widgets: any[]): Sensor[] {
  if (!widgets) return [];

  return widgets
    .filter((w) => w.widgetType === "Indicator" && w.sensor === true)
    .map((w) => ({
      name: w.variableFullName || w.name || "Sensor",
      value: "0",
      unit: w.unidad || w.unit || "",
      variable: w.variable,
    }));
}

// Helper function to extract control data from widgets
function extractControls(widgets: any[]): Array<{
  name: string;
  status: "on" | "off";
  modes: string[];
  variable: string;
  slave?: string;
  initialName?: string;
  mode?: string;
  isOn?: boolean;
}> {
  if (!widgets) return [];

  return widgets
    .filter((w) => w.widgetType === "Indicator" && w.sensor !== true)
    .map((w) => ({
      name: w.variableFullName || w.name || "Control",
      status: "off" as "on" | "off",
      modes: Array.isArray(w.mode) ? w.mode : w.mode ? [w.mode] : ["Manual"],
      variable: w.variable,
      initialName: w.initialName || w.variableFullName,
      mode: "off",
      isOn: false,
    }));
}

// Helper function to calculate light cycle from timers
function getLightCycle(device: any): { on: number; off: number } | undefined {
  if (!device.timers || device.timers.length === 0) return undefined;
  if (!device.template?.widgets) return undefined;

  // Find first Switch widget (usually Luces/Lights)
  const firstSwitch = device.template.widgets.find(
    (w: any) => w.widgetType === "Switch"
  );

  if (!firstSwitch) return undefined;

  // Find timer for this switch
  const timer = device.timers.find(
    (t: any) => t.variable === firstSwitch.variable
  );

  if (!timer) return undefined;

  // Convert milliseconds to hours (absolute times in a 24h period)
  const onTimeHours = timer.encendido / (1000 * 60 * 60);
  const offTimeHours = timer.apagado / (1000 * 60 * 60);

  let hoursOn: number;
  let hoursOff: number;

  if (offTimeHours > onTimeHours) {
    // Normal case: encendido < apagado (e.g., 4 AM to 8 AM)
    // Device is ON from onTime to offTime
    hoursOn = offTimeHours - onTimeHours;
    hoursOff = 24 - hoursOn;
  } else {
    // Cross-midnight case: encendido > apagado (e.g., 8 PM to 8 AM next day)
    // Device is ON from onTime to midnight, then midnight to offTime
    hoursOn = 24 - onTimeHours + offTimeHours;
    hoursOff = 24 - hoursOn;
  }

  return { on: Math.round(hoursOn), off: Math.round(hoursOff) };
}

export default function DeviceOverviewGrid({
  devices,
}: DeviceOverviewGridProps) {
  const [isAddDeviceDialogOpen, setIsAddDeviceDialogOpen] =
    React.useState(false);

  if (!devices || devices.length === 0) {
    return (
      <div className="space-y-4">
        {/* Header with title and button */}
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Dispositivos
          </h2>
          <Button
            variant="default"
            size="sm"
            className="shrink-0"
            onClick={() => setIsAddDeviceDialogOpen(true)}
            data-tour="add-device-btn"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Agregar dispositivo</span>
            <span className="sm:hidden">Agregar</span>
          </Button>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          No hay dispositivos disponibles
        </div>
        <AddDeviceDialog
          open={isAddDeviceDialogOpen}
          onOpenChange={setIsAddDeviceDialogOpen}
        />
      </div>
    );
  }

  // Transform devices from API format to component format
  const transformedDevices: Device[] = devices.map((device) => {
    const widgets = device.template?.widgets || [];
    const isGrowth = isGrowthDevice(widgets);
    const lightCycle = getLightCycle(device);

    return {
      id: device.dId,
      name: device.name,
      type: device.templateName || device.template?.name || "Dispositivo",
      status: "on" as "on" | "off",
      sensors: extractSensors(widgets),
      controls: extractControls(widgets),
      isGrowthDevice: isGrowth,
      lightCycle: lightCycle,
      // Note: optimizedFor, startDate, phaseDurations would need to come from device data
      // These are disabled for now as per user request
    };
  });

  return (
    <div className="space-y-4">
      {/* Header with title and button */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Dispositivos
        </h2>
        <Button
          variant="default"
          size="sm"
          data-tour="add-device-btn"
          className="shrink-0"
          onClick={() => setIsAddDeviceDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Agregar dispositivo</span>
          <span className="sm:hidden">Agregar</span>
        </Button>
      </div>

      {/* Grid responsive: 1 column mobile, 2 tablet, 3 desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {transformedDevices.map((device) => (
          <DeviceCardWithMqtt key={device.id} device={device} />
        ))}
      </div>

      <AddDeviceDialog
        open={isAddDeviceDialogOpen}
        onOpenChange={setIsAddDeviceDialogOpen}
      />
    </div>
  );
}

// Component interno que maneja el estado MQTT de cada dispositivo
function DeviceCardWithMqtt({ device }: { device: Device }) {
  const { recived } = useMqtt();
  const { auth } = useAuth();
  const navigate = useNavigate();
  const { callEndpoint } = useFetchAndLoad();
  const { setReload, setIsSwitchingDevice } = useDevices();

  // Estado local para sensores y controles
  const [sensors, setSensors] = React.useState(device.sensors);
  const [controls, setControls] = React.useState(device.controls);
  const [isOnline, setIsOnline] = React.useState(false);
  const [lastMessageTime, setLastMessageTime] = React.useState<number>(
    Date.now()
  );

  // Función para seleccionar dispositivo y navegar
  const handleDeviceClick = async () => {
    // No permitir navegación si el dispositivo está offline
    if (!isOnline) {
      return;
    }

    setIsSwitchingDevice(true);
    const startTime = Date.now();

    const data = await callEndpoint(selectDevice(device.id));

    if (data?.data?.status === "success") {
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(1000 - elapsed, 0);

      setTimeout(() => {
        setReload(true);
        navigate("/device");
      }, remainingTime);
    } else {
      console.log("Error al seleccionar dispositivo");
      setIsSwitchingDevice(false);
    }
  };

  // Actualizar valores cuando llegan datos por MQTT
  React.useEffect(() => {
    if (recived && recived.length > 0) {
      recived.forEach((item) => {
        if (item.dId === device.id) {
          // Marcar como online y actualizar timestamp
          setIsOnline(true);
          setLastMessageTime(Date.now());

          // Actualizar sensores
          setSensors((prevSensors) =>
            prevSensors.map((sensor) =>
              sensor.variable === item.variable
                ? { ...sensor, value: item.value?.toString() || "0" }
                : sensor
            )
          );

          // Actualizar controles con mapeo de modos MQTT
          setControls((prevControls) =>
            prevControls.map((control) => {
              if (control.variable === item.variable) {
                const mappedMode = mqttValueToMode(item.value);
                const isOn =
                  item.value === true || item.value === 1 || item.value === 3;

                return {
                  ...control,
                  mode: mappedMode || "off",
                  isOn: isOn,
                  status: isOn ? "on" : "off",
                };
              }
              return control;
            })
          );
        }
      });
    }
  }, [recived, device.id]);

  // Verificar si el dispositivo sigue online (último mensaje hace menos de 30 segundos)
  React.useEffect(() => {
    const interval = setInterval(() => {
      const timeSinceLastMessage = Date.now() - lastMessageTime;
      // Si han pasado más de 30 segundos sin mensajes, marcar como offline
      if (timeSinceLastMessage > 30000) {
        setIsOnline(false);
      }
    }, 5000); // Verificar cada 5 segundos

    return () => clearInterval(interval);
  }, [lastMessageTime]);

  return (
    <Card
      className={`border-border/50 bg-card/50 backdrop-blur-sm transition-colors ${
        isOnline
          ? "hover:bg-card/70 cursor-pointer"
          : "cursor-not-allowed opacity-75"
      }`}
      onClick={handleDeviceClick}
      data-tour="device-card"
      data-tour-config="device-config"
    >
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-base">{device.name}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">{device.type}</p>
          </div>
          <div
            data-tour="device-status"
            className={`w-3 h-3 rounded-full flex-shrink-0 transition-colors ${
              isOnline ? "bg-green-500" : "bg-red-500/50"
            }`}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {device.isGrowthDevice && <CropProgressBar device={device} />}

        {device.isGrowthDevice ? (
          <>
            {/* Radial Gauges for Sensors */}
            <div className="grid grid-cols-3 gap-3" data-tour="device-sensors">
              {sensors.map((sensor) => {
                const value = parseFloat(sensor.value) || 0;
                const max =
                  sensor.unit === "°C" || sensor.unit === "C" ? 35 : 100;
                return (
                  <RadialGauge
                    key={sensor.variable}
                    value={value}
                    max={max}
                    label={sensor.name.split(" ")[0]}
                    unit={sensor.unit}
                    min={sensor.unit === "°C" || sensor.unit === "C" ? 10 : 0}
                    isOnline={isOnline}
                  />
                );
              })}
            </div>

            {/* Optimization & Light Cycle */}
            {(device.optimizedFor || device.lightCycle) && (
              <div className="space-y-3 pt-2 border-t border-border/20">
                {/* OptimizationBadge disabled for future feature */}
                {/* <OptimizationBadge optimizedFor={device.optimizedFor} /> */}
                {device.lightCycle && (
                  <LightCycleIndicator
                    onHours={device.lightCycle.on}
                    offHours={device.lightCycle.off}
                    isOnline={isOnline}
                  />
                )}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Text format for non-growth devices */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase">
                Sensores
              </p>
              <div className="space-y-1.5">
                {sensors.map((sensor) => (
                  <div
                    key={sensor.variable}
                    className="p-2 rounded-lg bg-muted/40"
                  >
                    <p className="text-xs text-muted-foreground">
                      {sensor.name}
                    </p>
                    <p className="text-sm font-semibold">
                      {sensor.value}
                      <span className="text-xs text-muted-foreground ml-1">
                        {sensor.unit}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Controls */}
        {controls.length > 0 && (
          <div
            className="space-y-2 pt-2 border-t border-border/20"
            data-tour="device-controls"
          >
            <p className="text-xs font-semibold text-muted-foreground uppercase">
              Controles
            </p>
            <div className="space-y-1.5">
              {controls.map((control) => {
                const mode = control.mode || "off";
                const showStatus =
                  mode === "on" || mode === "off" || mode === "timers";

                return (
                  <div
                    key={control.variable}
                    className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/30"
                  >
                    <div className="flex flex-col items-start min-w-0">
                      <p className="text-xs font-medium truncate">
                        {control.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase text-left">
                        {mode}
                      </p>
                    </div>
                    <div
                      className="flex-shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {showStatus && (
                        <Button
                          size="sm"
                          variant={control.isOn ? "default" : "outline"}
                          className="h-6 px-2 text-xs pointer-events-none"
                        >
                          {control.isOn ? (
                            <Power className="w-3 h-3" />
                          ) : (
                            <PowerOff className="w-3 h-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
