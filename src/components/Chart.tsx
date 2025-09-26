import React from "react";
import {
  CartesianGrid,
  Line,
  XAxis,
  YAxis,
  Area,
  ComposedChart,
  ReferenceLine,
  Scatter,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import useFetchAndLoad from "@/hooks/useFetchAndLoad";
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { getChartData } from "../services/private";
import useCalendar from "@/hooks/useCalendar";
import useSubscription from "@/hooks/useSubscription";
import { Calendar } from "lucide-react";

// Configuración dinámica de variables - Mapeo por variable (identificador único)
const variableTypeMapping = {
  // Mapeo por variable (identificador único del widget)
  temp: {
    label: "Temperatura",
    color: "hsl(var(--chart-5))",
    unit: "°C",
    type: "natural",
  },
  hum: {
    label: "Humedad relativa",
    color: "hsl(var(--chart-1))",
    unit: "%",
    type: "natural",
  },
  soilhum: {
    label: "Humedad del suelo",
    color: "hsl(var(--chart-2))",
    unit: "%",
    type: "natural",
  },
  light: {
    label: "Luces",
    color: "hsl(var(--chart-3))",
    unit: "",
    type: "area",
    fillColor: "rgba(255, 235, 59, 0.3)",
  },

  extractor: {
    label: "Extractor",
    color: "hsl(var(--chart-4))",
    unit: "",
    type: "area",
    fillColor: "rgba(59, 130, 246, 0.3)",
  },
  caloventor: {
    label: "Caloventor",
    color: "hsl(var(--chart-6))",
    unit: "",
    type: "area",
    fillColor: "rgba(239, 68, 68, 0.3)",
  },
  ventilacion: {
    label: "Ventilación",
    color: "hsl(var(--chart-7))",
    unit: "",
    type: "area",
    fillColor: "rgba(34, 197, 94, 0.3)",
  },

  // Mapeos adicionales para compatibilidad
  temperature: {
    label: "Temperatura",
    color: "hsl(var(--chart-5))",
    unit: "°C",
    type: "natural",
  },
  humidity: {
    label: "Humedad relativa",
    color: "hsl(var(--chart-1))",
    unit: "%",
    type: "natural",
  },
  pressure: {
    label: "Presión",
    color: "hsl(var(--chart-8))",
    unit: "hPa",
    type: "natural",
  },
  co2: {
    label: "CO2",
    color: "hsl(var(--chart-9))",
    unit: "ppm",
    type: "natural",
  },
};

// Configuración de eventos para usuarios Pro
const eventConfig = {
  device_turn_on: {
    label: "Dispositivo Encendido",
    color: "#f97316",
    description: "El dispositivo se encendió correctamente",
  },
  first_boot: {
    label: "Primer Arranque",
    color: "#06b6d4",
    description: "Dispositivo iniciado por primera vez",
  },
  setpoint_change: {
    label: "Cambio de Setpoint",
    color: "#dc2626",
    description: "Se modificó el punto de referencia del control",
  },
  control_correction: {
    label: "Corrección del Control",
    color: "#f59e0b",
    description: "El sistema realizó una corrección automática",
  },
  sensor_spike: {
    label: "Pico de sensor",
    color: "#b91c1c",
    description: "Se detectó un cambio brusco en las lecturas del sensor",
  },
  connection_restored: {
    label: "Conexión Restaurada",
    color: "#16a34a",
    description: "Se restableció la conexión con el servidor",
  },
};

// Componente de tooltip personalizado para parsear valores de actuadores
const CustomTooltipContent = ({ active, payload, label, config }) => {
  if (!active || !payload?.length) return null;

  // Debug: verificar qué está llegando
  console.log("Tooltip data:", {
    active,
    label,
    payloadLength: payload?.length,
  });

  // Verificar si hay evento en este punto
  const eventData = payload[0]?.payload;
  const hasEvent = eventData?.eventType;
  const eventConf = hasEvent ? eventConfig[eventData.eventType] : null;

  // Debug: mostrar datos del evento
  if (hasEvent) {
    console.log("Event data in tooltip:", {
      eventType: eventData.eventType,
      hasEventDetails: !!eventData.eventDetails,
      eventDetails: eventData.eventDetails,
    });
  }

  return (
    <div className="rounded-lg border bg-background p-2 shadow-md">
      <div className="grid gap-2">
        {!hasEvent && (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground mb-1">
              <Calendar className="inline-block mr-1 w-4 h-4 mb-1" />{" "}
              {label || eventData?.time || "Tiempo no disponible"}
            </span>
          </div>
        )}
        {/* Mostrar información del evento si existe */}
        {hasEvent && eventConf && (
          <div className="border-b pb-2 mb-2">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: eventConf.color }}
              />
              <span className="font-semibold text-sm">{eventConf.label}</span>
              <span className="text-xs font-medium text-gray-500 ml-1 flex justify-center items-center">
                {eventData?.originalTime || label || eventData?.time}
              </span>
            </div>
            <div className="flex flex-col">
              <div className="text-xs text-gray-600 mt-1 text-left">
                {eventConf.description}
              </div>
            </div>
            {/* Información adicional del evento si está disponible */}
            {eventData.eventDetails && (
              <div className="space-y-1 pt-2 mt-2">
                <div className="text-xs font-medium text-foreground mb-1">
                  Detalles del Evento:
                </div>

                {eventData.eventDetails.sensor_value !== undefined && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Valor Sensor:</span>
                    <span className="font-mono text-foreground">
                      {Number(eventData.eventDetails.sensor_value).toFixed(2)}
                    </span>
                  </div>
                )}
                {eventData.eventDetails.setpoint !== undefined && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Setpoint:</span>
                    <span className="font-mono text-foreground">
                      {Number(eventData.eventDetails.setpoint).toFixed(2)}
                    </span>
                  </div>
                )}
                {eventData.eventDetails.output !== undefined && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      Salida Control:
                    </span>
                    <span className="font-mono text-foreground">
                      {Number(eventData.eventDetails.output).toFixed(1)}%
                    </span>
                  </div>
                )}
                {/* Mostrar el actuador relacionado si está disponible */}
                {eventData.eventDetails.actuatorName && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Actuador:</span>
                    <span className="font-mono text-foreground font-semibold">
                      {eventData.eventDetails.actuatorName}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {payload.map((entry, index) => {
          const configKey = entry.dataKey;

          // Filtrar elementos que no queremos mostrar
          if (configKey === "_backgroundArea" || configKey === "eventY")
            return null;

          const itemConfig = config?.[configKey];

          if (!itemConfig) return null;
          let displayValue = entry.value;

          // Para actuadores (excepto luces), convertir valores numéricos a ON/OFF
          if (itemConfig.type === "area") {
            const variableName = itemConfig.label?.toLowerCase() || "";
            if (
              variableName.includes("luz") ||
              variableName.includes("light") ||
              variableName.includes("luces")
            ) {
              // Para luces, mostrar ON/OFF basado en si es 100 o 0
              displayValue = entry.value === 100 ? "ON" : "OFF";
            } else {
              // Para otros actuadores (valores negativos), ON si el valor absoluto mod 5 es 0, OFF si mod 5 es 1
              const absValue = Math.abs(entry.value);
              displayValue = absValue % 5 === 0 ? "ON" : "OFF";
            }
          } else {
            // Para sensores, mostrar el valor con unidad si existe
            displayValue = `${entry.value}${itemConfig.unit || ""}`;
          }

          return (
            <div key={index} className="flex items-center gap-2">
              <div
                className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                style={{
                  backgroundColor: itemConfig.color,
                }}
              />
              <div className="flex items-center justify-between w-full min-w-[120px]">
                <span className="text-sm text-muted-foreground">
                  {itemConfig.label}
                </span>
                <span className="font-mono text-sm font-bold ml-2">
                  {displayValue}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function Chart({ device }) {
  const { selectedDate } = useCalendar();
  const { loading, callEndpoint } = useFetchAndLoad();
  const { isPro, isPlus } = useSubscription();
  const [data, setData] = useState([]);
  const [events, setEvents] = useState([]);
  const [availableVariables, setAvailableVariables] = useState([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState("1day");
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isEmpty, setIsEmpty] = useState(false);
  const fetchingRef = useRef(false);
  const lastFetchParamsRef = useRef(null);

  // Generar configuración dinámica del gráfico
  const chartConfig = useMemo(() => {
    const config = {};
    const colorIndex = [
      "hsl(var(--chart-1))",
      "hsl(var(--chart-2))",
      "hsl(var(--chart-3))",
      "hsl(var(--chart-4))",
      "hsl(var(--chart-5))",
      "hsl(220, 70%, 50%)", // Azul directo
      "hsl(0, 70%, 50%)", // Rojo directo
      "hsl(120, 70%, 40%)", // Verde directo
      "hsl(45, 90%, 50%)", // Amarillo directo
      "hsl(280, 70%, 50%)", // Morado directo
      "hsl(20, 90%, 50%)", // Naranja directo
    ];
    const areaColors = [
      "rgba(59, 130, 246, 0.3)",
      "rgba(239, 68, 68, 0.3)",
      "rgba(34, 197, 94, 0.3)",
      "rgba(255, 235, 59, 0.3)",
      "rgba(168, 85, 247, 0.3)",
      "rgba(249, 115, 22, 0.3)",
      "rgba(14, 165, 233, 0.3)",
      "rgba(34, 197, 94, 0.3)",
      "rgba(168, 85, 247, 0.3)",
    ];

    availableVariables.forEach((widget, index) => {
      const variableKey = widget.variable; // ID único para usar como dataKey

      // Determinar si es actuador o sensor
      const isActuator = widget.isActuator;
      const chartType = isActuator ? "area" : "natural";

      // Colores específicos para ciertos tipos de variables
      let color = colorIndex[index % colorIndex.length];
      let fillColor = isActuator ? "rgba(255, 235, 59, 0)" : undefined;

      // Asignar color amarillo específico para luces
      const variableName =
        widget.variableFullName?.toLowerCase() ||
        widget.variable?.toLowerCase() ||
        "";
      if (
        variableName.includes("luz") ||
        variableName.includes("light") ||
        widget.variableFullName === "light" ||
        widget.variableFullName.toLowerCase() === "luces"
      ) {
        color = "rgba(255, 235, 59, 0.2)"; // Amarillo directo para luces
        fillColor = isActuator ? "rgba(255, 235, 59, 0.1)" : undefined; // Amarillo transparente para área
      }

      config[variableKey] = {
        label: widget.variableFullName,
        color: color,
        type: chartType,
        fillColor: fillColor,
      };
    });

    return config;
  }, [availableVariables]);

  // Datos hardcodeados para pruebas - 3 días con datos cada hora
  const mockData = useMemo(() => {
    if (!availableVariables.length) return [];

    const data = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 3); // Comenzar hace 3 días
    startDate.setHours(0, 0, 0, 0); // Comenzar a medianoche

    // Generar 72 horas de datos (3 días × 24 horas)
    for (let hour = 0; hour < 72; hour++) {
      const currentTime = new Date(startDate);
      currentTime.setHours(startDate.getHours() + hour);

      // Sistema de luces: 6hs encendido (6:00-12:00), 18hs apagado (12:00-6:00)
      const hourOfDay = currentTime.getHours();
      // Generar valores 0-3: 0,2 = apagado (mostrar 0), 1,3 = encendido (mostrar 100)
      const baseStatus = hourOfDay >= 6 && hourOfDay < 12 ? 1 : 0; // 1 encendido, 0 apagado
      const lightStatus = baseStatus + (Math.random() > 0.5 ? 2 : 0); // Agregar 0 o 2 aleatoriamente

      // Simular variaciones realistas de temperatura (más alta en el día)
      const baseTemp = 22;
      const tempVariation = Math.sin(((hourOfDay - 6) * Math.PI) / 12) * 4; // Variación de día/noche
      const randomTemp = baseTemp + tempVariation + (Math.random() - 0.5) * 2;

      // Humedad inversa a la temperatura (más alta en la noche)
      const baseHum = 65;
      const humVariation = -tempVariation * 0.8;
      const randomHum = baseHum + humVariation + (Math.random() - 0.5) * 5;

      // Humedad del suelo más estable, con pequeñas variaciones
      const baseSoilHum = 45;
      const soilVariation = Math.sin((hour * Math.PI) / 24) * 3; // Variación más lenta
      const randomSoilHum =
        baseSoilHum + soilVariation + (Math.random() - 0.5) * 2;

      const dataPoint = {
        time: currentTime.toLocaleString("es-ES", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
        timestamp: currentTime.getTime(),
        // Área de fondo para zona negativa (siempre -15 para crear el fondo azulado)
        _backgroundArea: -15,
      };

      // Generar datos basados en si es actuador o sensor
      let actuatorIndex = 0; // Contador para escalonar actuadores
      availableVariables.forEach((widget) => {
        if (widget.isActuator) {
          const name = widget.variableFullName?.toLowerCase() || "";
          let rawValue = 0;

          // Generar valores base 0 o 1 según lógica específica
          if (
            name.includes("luz") ||
            name.includes("light") ||
            name.includes("luces")
          ) {
            // Para luces: 0 o 2 = 0, 1 o 3 = 100 (sin escalonar)
            const lightRawValue = lightStatus;
            dataPoint[widget.variable] =
              lightRawValue === 1 || lightRawValue === 3 ? 100 : 0;
            return; // Salir temprano para las luces
          } else if (name.includes("caloventor") || name.includes("calef")) {
            rawValue = hourOfDay >= 18 || hourOfDay < 8 ? 1 : 0; // Caloventor en la noche
          } else if (name.includes("ventilac") || name.includes("extractor")) {
            rawValue = randomTemp > 25 ? 1 : 0; // Ventilación cuando hace calor
          } else {
            // Actuador genérico - random on/off con 30% probabilidad
            rawValue = Math.random() > 0.7 ? 1 : 0;
          }

          // Escalonar actuadores en zona negativa: primer actuador -1 a -5, segundo -6 a -10, etc.
          const baseValue = -(actuatorIndex * 5 + 1); // Empezar en -1, -6, -11, etc.
          dataPoint[widget.variable] =
            rawValue === 1 ? baseValue - 4 : baseValue; // ON: -5, -10, -15, OFF: -1, -6, -11
          actuatorIndex++;
        } else {
          // Para sensores, generar valores analógicos realistas
          const name = widget.variableFullName?.toLowerCase() || "";
          if (name.includes("temp")) {
            dataPoint[widget.variable] = Math.round(randomTemp * 10) / 10;
          } else if (name.includes("hum") && name.includes("suelo")) {
            dataPoint[widget.variable] =
              Math.round(Math.max(20, Math.min(80, randomSoilHum)) * 10) / 10;
          } else if (name.includes("hum")) {
            dataPoint[widget.variable] =
              Math.round(Math.max(30, Math.min(90, randomHum)) * 10) / 10;
          } else {
            // Sensor genérico - valor aleatorio entre 0-100
            dataPoint[widget.variable] =
              Math.round(Math.random() * 100 * 10) / 10;
          }
        }
      });

      data.push(dataPoint);
    }
    return data;
  }, [availableVariables]);

  // Eventos hardcodeados para usuarios Pro - distribuidos en los 3 días
  const mockEvents = useMemo(() => {
    const events = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 3);

    // Eventos día 1
    events.push({
      time: new Date(startDate.getTime() + 6 * 60 * 60 * 1000).toLocaleString(
        "es-ES",
        {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }
      ),
      type: "device_turn_on",
      payload: { type: "device_turn_on" },
    });

    events.push({
      time: new Date(startDate.getTime() + 14 * 60 * 60 * 1000).toLocaleString(
        "es-ES",
        {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }
      ),
      type: "pid_adjustment",
      payload: { type: "pid_adjustment", params: { kp: 1.2, ki: 0.5 } },
    });

    // Eventos día 2
    events.push({
      time: new Date(startDate.getTime() + 30 * 60 * 60 * 1000).toLocaleString(
        "es-ES",
        {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }
      ),
      type: "device_turn_on",
      payload: { type: "device_turn_on" },
    });

    events.push({
      time: new Date(startDate.getTime() + 38 * 60 * 60 * 1000).toLocaleString(
        "es-ES",
        {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }
      ),
      type: "connection_lost",
      payload: { type: "connection_lost" },
    });

    events.push({
      time: new Date(startDate.getTime() + 39 * 60 * 60 * 1000).toLocaleString(
        "es-ES",
        {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }
      ),
      type: "connection_restored",
      payload: { type: "connection_restored" },
    });

    // Eventos día 3
    events.push({
      time: new Date(startDate.getTime() + 54 * 60 * 60 * 1000).toLocaleString(
        "es-ES",
        {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }
      ),
      type: "device_turn_on",
      payload: { type: "device_turn_on" },
    });

    events.push({
      time: new Date(startDate.getTime() + 66 * 60 * 60 * 1000).toLocaleString(
        "es-ES",
        {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }
      ),
      type: "pid_adjustment",
      payload: { type: "pid_adjustment", params: { kp: 1.5, ki: 0.3 } },
    });

    return events;
  }, []);

  // Opciones de período de tiempo
  const timeRangeOptions = [
    { value: "1hour", label: "Última hora", hours: 1 },
    { value: "6hours", label: "Últimas 6 horas", hours: 6 },
    { value: "1day", label: "Último día", hours: 24 },
    { value: "1week", label: "Última semana", hours: 24 * 7 },
    { value: "1month", label: "Último mes", hours: 24 * 30 },
  ];

  // Filtrar datos según el período seleccionado
  const filteredData = useMemo(() => {
    const selectedOption = timeRangeOptions.find(
      (option) => option.value === selectedTimeRange
    );
    if (!selectedOption) return mockData;

    const now = new Date();
    const cutoffTime = now.getTime() - selectedOption.hours * 60 * 60 * 1000;

    return mockData.filter((item) => item.timestamp >= cutoffTime);
  }, [mockData, selectedTimeRange]);

  // Filtrar eventos según el período seleccionado
  const filteredEvents = useMemo(() => {
    if (!isPro && !isPlus) return [];

    const selectedOption = timeRangeOptions.find(
      (option) => option.value === selectedTimeRange
    );
    if (!selectedOption) return mockEvents;

    const now = new Date();
    const cutoffTime = now.getTime() - selectedOption.hours * 60 * 60 * 1000;

    return mockEvents.filter((event) => {
      // Convertir el tiempo del evento a timestamp para comparar
      const eventDate = new Date(event.time.split(" ").reverse().join(" "));
      return eventDate.getTime() >= cutoffTime;
    });
  }, [mockEvents, selectedTimeRange, isPro, isPlus]);

  // Función para refrescar datos manualmente
  const refreshData = useCallback(() => {
    setHasError(false);
    setErrorMessage("");
    setIsEmpty(false);
    fetchingRef.current = false;
    lastFetchParamsRef.current = null;
    // Forzar re-ejecución del useEffect
    setSelectedTimeRange((prev) => prev); // Esto dispara el useEffect
  }, []);

  // Detectar variables disponibles dinámicamente
  useEffect(() => {
    if (device?.template?.widgets) {
      // Filtrar widgets que SOLO son de tipo "Indicator" y eliminar duplicados
      const indicatorWidgets = device.template.widgets.filter((widget) => {
        return widget.widgetType === "Indicator";
      });

      // Eliminar duplicados basándose en variable (ID único)
      const uniqueWidgets = indicatorWidgets.filter((widget, index, array) => {
        return index === array.findIndex((w) => w.variable === widget.variable);
      });

      // Detectar qué indicators tienen un switch asociado para determinar si son actuadores
      const allWidgets = device.template.widgets;
      const enrichedWidgets = uniqueWidgets.map((indicator) => {
        // Buscar si hay un widget Switch que tenga la misma variable slave
        const hasAssociatedSwitch = allWidgets.some(
          (widget) =>
            widget.widgetType === "Switch" &&
            widget.slave === indicator.variable
        );

        return {
          ...indicator,
          isActuator: hasAssociatedSwitch, // Agregar flag para saber si es actuador
        };
      });

      setAvailableVariables(enrichedWidgets);
    } else {
      // Para pruebas, crear variables mock cuando no hay device.template
      const mockVariables = [
        {
          variable: "temp",
          variableFullName: "Temperatura",
          widgetType: "Indicator",
        },
        {
          variable: "hum",
          variableFullName: "Humedad relativa",
          widgetType: "Indicator",
        },
        {
          variable: "soilhum",
          variableFullName: "Humedad del suelo",
          widgetType: "Indicator",
        },
        {
          variable: "light",
          variableFullName: "Luces",
          widgetType: "Indicator",
        },
        {
          variable: "extractor",
          variableFullName: "Extractor",
          widgetType: "Indicator",
        },
        {
          variable: "caloventor",
          variableFullName: "Caloventor",
          widgetType: "Indicator",
        },
        {
          variable: "ventilacion",
          variableFullName: "Ventilación",
          widgetType: "Indicator",
        },
      ];
      setAvailableVariables(mockVariables);
    }
  }, [device]);

  // Actualizar datos cuando cambie el período seleccionado o las variables disponibles
  useEffect(() => {
    const fetchChartData = async () => {
      // Evitar múltiples llamadas simultáneas
      if (fetchingRef.current) {
        return;
      }

      if (!device?.dId || !availableVariables.length) {
        // Si no hay device o variables, usar datos mock para desarrollo
        setData(filteredData);
        if (isPro || isPlus) {
          setEvents(filteredEvents);
        }
        return;
      }

      // Crear parámetros de la llamada actual
      const currentParams = {
        dId: device.dId,
        timeRange: selectedTimeRange,
        variables: availableVariables
          .map((w) => w.variable)
          .sort()
          .join(","),
      };

      // Evitar llamadas duplicadas
      if (
        lastFetchParamsRef.current &&
        JSON.stringify(lastFetchParamsRef.current) ===
          JSON.stringify(currentParams)
      ) {
        return;
      }

      fetchingRef.current = true;
      lastFetchParamsRef.current = currentParams;

      try {
        // Resetear estados de error
        setHasError(false);
        setErrorMessage("");
        setIsEmpty(false);

        // Obtener variables para el endpoint
        const variables = availableVariables.map((widget) => widget.variable);

        // Llamar al endpoint
        const response = await callEndpoint(
          getChartData(device.dId, selectedTimeRange, variables)
        );

        if (response && !response.error && response.data) {
          const chartData = response.data.data || [];

          // Verificar si no hay datos
          if (chartData.length === 0) {
            setIsEmpty(true);
            setData([]);
            if (isPro || isPlus) {
              setEvents([]);
            }
            return;
          }
          // Aplicar transformaciones necesarias para actuadores
          const transformedData = chartData.map((dataPoint) => {
            const newDataPoint = { ...dataPoint };

            // Aplicar lógica de escalonado para actuadores (excepto luces)
            let actuatorIndex = 0;
            availableVariables.forEach((widget) => {
              if (
                widget.isActuator &&
                newDataPoint[widget.variable] !== undefined
              ) {
                const name = widget.variableFullName?.toLowerCase() || "";
                const rawValue = newDataPoint[widget.variable];

                if (
                  name.includes("luz") ||
                  name.includes("light") ||
                  name.includes("luces")
                ) {
                  // Para luces: convertir a 0 o 100
                  newDataPoint[widget.variable] =
                    rawValue === 1 || rawValue === 3 ? 100 : 0;
                } else {
                  // Para otros actuadores: escalonar en zona negativa
                  const baseValue = -(actuatorIndex * 5 + 1);
                  newDataPoint[widget.variable] =
                    rawValue === 1 ? baseValue - 4 : baseValue;
                  actuatorIndex++;
                }
              }
            });

            return newDataPoint;
          });

          setData(transformedData);

          if (isPro) {
            // Procesar eventos del backend si están disponibles
            if (response && response.data && response.data.events) {
              console.log("Raw events from backend:", response.data.events);

              const backendEvents = response.data.events.filter((event) => {
                const eventType = event.payload?.event_type;
                const hasConfig = !!eventConfig[eventType];
                console.log(
                  `Event type: ${eventType}, has config: ${hasConfig}`
                );
                return hasConfig;
              });

              console.log("Filtered backend events:", backendEvents);
              // Convertir eventos a puntos scatter
              const eventPoints = backendEvents.map((event) => {
                const maxValue = Math.max(
                  ...transformedData.flatMap(
                    (item) =>
                      Object.entries(item)
                        .filter(
                          ([key]) =>
                            key !== "time" &&
                            key !== "_backgroundArea" &&
                            key !== "timestamp"
                        )
                        .map(([, value]) =>
                          typeof value === "number" ? value : 0
                        )
                        .filter((value) => value < 1000000) // Filtrar timestamps grandes
                  ),
                  50 // Valor por defecto
                );

                console.log("Max value calculated:", maxValue);

                // Buscar el widget/actuador correspondiente a la variable del evento
                const relatedWidget = device.template.widgets.find(
                  (widget) => widget.variable === event.variable
                );

                console.log(
                  "Event variable:",
                  event.variable,
                  "Related widget:",
                  relatedWidget
                );

                // Calcular posición Y del evento
                let eventYPosition;
                const sensorValue = event.payload?.sensor_value;

                if (sensorValue && sensorValue > 0) {
                  // Si hay sensor_value mayor a 0, posicionar a esa altura
                  eventYPosition = sensorValue;
                  console.log(
                    `Event positioned at sensor value: ${sensorValue}`
                  );
                } else {
                  // Posición por defecto cerca del máximo
                  eventYPosition = Math.max(50, maxValue * 0.9);
                }

                const eventPoint = {
                  time: new Date(event.expiracy).toLocaleString("es-ES", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  originalTime: new Date(event.expiracy).toLocaleString(
                    "es-ES",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    }
                  ), // Tiempo original preciso con segundos
                  eventY: eventYPosition,
                  eventType: event.payload?.event_type,
                  eventVariable: event.variable, // Agregar la variable del evento
                  eventDetails: {
                    sensor_value: event.payload?.sensor_value,
                    setpoint: event.payload?.setpoint,
                    output: event.payload?.output,
                    timestamp: event.payload?.timestamp
                      ? new Date(event.payload.timestamp).toLocaleString(
                          "es-ES"
                        )
                      : null,
                    actuatorName: relatedWidget?.variableFullName || null, // Nombre del actuador
                  },
                };

                console.log("Created event point:", eventPoint);
                return eventPoint;
              });

              console.log("Final event points:", eventPoints);

              // Debug: mostrar tiempos de datos transformados
              console.log(
                "Sample transformed data times:",
                transformedData.slice(0, 5).map((d) => d.time)
              );

              // Función para encontrar el punto de datos más cercano al evento
              const findClosestDataPoint = (eventTime, dataPoints) => {
                // Convertir tiempo de evento a Date para comparación
                const eventDate = new Date(
                  eventTime.replace(
                    /(\d{1,2})\/(\d{1,2}), (\d{1,2}):(\d{2})/,
                    "2025-$2-$1 $3:$4"
                  )
                );

                let closestPoint = null;
                let minDiff = Infinity;

                dataPoints.forEach((point, index) => {
                  // Convertir tiempo de data point a Date
                  const pointDate = new Date(
                    point.time.replace(
                      /(\d{1,2})\/(\d{1,2}), (\d{1,2}):(\d{2})/,
                      "2025-$2-$1 $3:$4"
                    )
                  );
                  const timeDiff = Math.abs(
                    eventDate.getTime() - pointDate.getTime()
                  );

                  if (timeDiff < minDiff) {
                    minDiff = timeDiff;
                    closestPoint = index;
                  }
                });

                return closestPoint;
              };

              // Mezclar eventos con datos principales del gráfico
              const dataWithEvents = [...transformedData];

              eventPoints.forEach((event, eventIndex) => {
                const closestIndex = findClosestDataPoint(
                  event.time,
                  transformedData
                );
                if (closestIndex !== null) {
                  console.log("MATCHED EVENT:", {
                    dataTime: transformedData[closestIndex].time,
                    eventTime: event.time,
                    eventType: event.eventType,
                    closestIndex,
                  });

                  dataWithEvents[closestIndex] = {
                    ...dataWithEvents[closestIndex],
                    eventY: event.eventY,
                    eventType: event.eventType,
                    eventVariable: event.eventVariable,
                    originalTime: event.originalTime, // Tiempo original preciso
                    eventDetails: event.eventDetails,
                  };
                }
              });

              console.log(
                "Data with events sample:",
                dataWithEvents.filter((d) => d.eventType).slice(0, 3)
              );

              // Actualizar datos principales con eventos mezclados
              setData(dataWithEvents);
              setEvents(eventPoints);
            } else {
              // Usar eventos mock si no hay eventos del backend
              setEvents(filteredEvents);
            }
          }
        } else {
          // Error en la respuesta del API
          setHasError(true);
          setErrorMessage(
            response?.error?.message || "Error al obtener los datos del gráfico"
          );
          setData([]);
          if (isPro || isPlus) {
            setEvents([]);
          }
        }
      } catch (error) {
        console.error("Error fetching chart data:", error);
        // Error de red o conexión
        setHasError(true);
        setErrorMessage("Error de conexión. Verifica tu conexión a internet.");
        setData([]);
        if (isPro || isPlus) {
          setEvents([]);
        }
      } finally {
        fetchingRef.current = false;
      }
    };

    fetchChartData();
  }, [selectedTimeRange, availableVariables, device?.dId]);

  // Generar líneas y áreas dinámicamente
  const renderLines = useMemo(() => {
    return availableVariables
      .map((widget) => {
        const variableKey = widget.variable;
        const config = chartConfig[variableKey];

        if (!config) return null;

        // Si es un actuador (area), renderizar como área
        if (config.type === "area") {
          return (
            <Area
              key={variableKey}
              dataKey={variableKey}
              type="step"
              stroke={config.color}
              strokeWidth={2}
              fill={config.fillColor}
              dot={false}
            />
          );
        }

        return (
          <Line
            key={variableKey}
            dataKey={variableKey}
            type="monotone"
            stroke={config.color}
            strokeWidth={2}
            dot={false}
          />
        );
      })
      .filter(Boolean);
  }, [availableVariables, chartConfig]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{device.name}</CardTitle>
            <CardDescription>
              {
                timeRangeOptions.find(
                  (option) => option.value === selectedTimeRange
                )?.label
              }
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Período:</span>
            <Select
              value={selectedTimeRange}
              onValueChange={setSelectedTimeRange}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Seleccionar período" />
              </SelectTrigger>
              <SelectContent>
                {timeRangeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Estado de error */}
        {hasError && (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-600 mb-2">
                Error al cargar los datos
              </h3>
              <p className="text-gray-600 mb-4">{errorMessage}</p>
              <Button onClick={refreshData} variant="outline">
                🔄 Intentar nuevamente
              </Button>
            </div>
          </div>
        )}

        {/* Estado de datos vacíos */}
        {!hasError && isEmpty && (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No hay datos disponibles
              </h3>
              <p className="text-gray-500 mb-4">
                No se encontraron datos para el período seleccionado.
              </p>
              <Button onClick={refreshData} variant="outline">
                🔄 Refrescar
              </Button>
            </div>
          </div>
        )}

        {/* Gráfico normal */}
        {!hasError && !isEmpty && (
          <ChartContainer
            config={chartConfig}
            className="max-h-[78dvh] w-[100%]"
          >
            <ComposedChart
              accessibilityLayer
              data={data}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                allowDataOverflow={false}
                dataKey="time"
                interval="preserveStartEnd"
                tickLine={false}
                axisLine={true}
                tickMargin={8}
              />
              <YAxis
                domain={[-15, "dataMax"]}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => (value >= 0 ? value : "")}
              />
              <ChartTooltip
                cursor={false}
                content={({ active, payload, label }) => (
                  <CustomTooltipContent
                    active={active}
                    payload={payload}
                    config={chartConfig}
                  />
                )}
              />
              <ChartLegend content={<ChartLegendContent />} />

              {/* Área de fondo azulado para zona negativa */}
              <Area
                dataKey="_backgroundArea"
                type="monotone"
                stroke="transparent"
                fill="rgba(59, 130, 246, 0.1)"
                fillOpacity={1}
                dot={false}
                connectNulls={false}
                isAnimationActive={false}
                legendType="none"
                hide={false}
              />

              {/* Línea de referencia en 0 */}
              <ReferenceLine
                y={0}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="2 2"
                strokeOpacity={0.8}
              />

              {/* Líneas y áreas dinámicas generadas automáticamente */}
              {renderLines}

              {/* Puntos de eventos para usuarios Pro/Plus */}
              {(isPro || isPlus) && (
                <Scatter
                  dataKey="eventY"
                  fill="#dc2626"
                  shape={(props) => {
                    const { cx, cy, payload } = props;

                    // Solo renderizar si hay evento en este punto
                    if (!payload?.eventType) return null;

                    const eventConf = eventConfig[payload.eventType];
                    if (!eventConf) return null;

                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={5}
                        fill={eventConf.color}
                        stroke="#fff"
                        strokeWidth={2}
                        style={{ cursor: "pointer" }}
                      />
                    );
                  }}
                />
              )}
            </ComposedChart>
          </ChartContainer>
        )}

        {/* Panel de eventos para usuarios Pro/Plus */}
        {(isPro || isPlus) && events.length > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border">
            <h4 className="font-medium text-sm mb-2 text-foreground flex items-center gap-2">
              Eventos del Sistema (Solo Pro)
              <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-2 py-1 rounded">
                {events.length} eventos
              </span>
            </h4>
            <div className="space-y-2">
              {isPro &&
                events.slice(0, 4).map((event, index) => {
                  const eventConf = eventConfig[event.eventType];
                  if (eventConf) {
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-3 text-xs p-2 bg-card border border-border rounded border-l-4 hover:bg-muted/50 transition-colors"
                        style={{ borderLeftColor: eventConf.color }}
                      >
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: eventConf.color }}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-card-foreground">
                            {eventConf.label}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {eventConf.description}
                          </div>
                        </div>
                        <span className="text-muted-foreground text-xs">
                          {event.time}
                        </span>
                      </div>
                    );
                  }
                  return null;
                })}
              {events.length > 4 && (
                <div className="text-xs text-muted-foreground text-center pt-1">
                  ... y {events.length - 4} eventos más
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
