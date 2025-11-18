"use client";

import * as React from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
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
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  Sun,
  Activity,
  Info,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import useFetchAndLoad from "@/hooks/useFetchAndLoad";
import {
  getMultiDeviceChartData,
  getRecentEvents,
  getNotifications,
} from "@/services/private";
import useDevices from "@/hooks/useDevices";

interface UnifiedChartsSectionProps {
  timeRange: "24h" | "7d" | "30d" | "90d";
}

interface ChartDataPoint {
  time: string;
  [key: string]: any;
}

export default function UnifiedChartsSection({
  timeRange,
}: UnifiedChartsSectionProps) {
  const { devicesArr } = useDevices();
  const { loading, callEndpoint } = useFetchAndLoad();
  const [temperatureData, setTemperatureData] = React.useState<
    ChartDataPoint[]
  >([]);
  const [humidityData, setHumidityData] = React.useState<ChartDataPoint[]>([]);
  const [soilHumidityData, setSoilHumidityData] = React.useState<
    ChartDataPoint[]
  >([]);
  const [eventsData, setEventsData] = React.useState<any[]>([]);
  const [alertsData, setAlertsData] = React.useState<any[]>([]);

  // Cargar selección desde localStorage
  const [selectedCharts, setSelectedCharts] = React.useState(() => {
    const saved = localStorage.getItem("selectedCharts");
    return saved
      ? JSON.parse(saved)
      : {
          temperatura: true,
          humedad: true,
          humedadSuelo: false,
          luz: false,
          eventos: false,
          alertas: false,
        };
  });

  // Función para extraer variables de un tipo específico de todos los dispositivos
  const getVariablesForType = React.useCallback(
    (type: "temp" | "hum" | "soilhum") => {
      const variables = new Set<string>();

      devicesArr.forEach((device) => {
        const widgets = device.template?.widgets || [];
        widgets.forEach((widget: any) => {
          const name = widget.name;

          if (type === "temp" && name === "Temperatura") {
            variables.add(widget.variable);
          } else if (type === "hum" && name === "Humedad Ambiente") {
            variables.add(widget.variable);
          } else if (type === "soilhum" && name === "Humedad del Suelo") {
            variables.add(widget.variable);
          }
        });
      });

      return Array.from(variables);
    },
    [devicesArr]
  );

  // Cargar datos cuando cambia el timeRange
  React.useEffect(() => {
    const fetchChartData = async () => {
      try {
        // Fetch temperature data
        if (selectedCharts.temperatura) {
          const tempVariables = getVariablesForType("temp");
          if (tempVariables.length > 0) {
            const tempResponse = await callEndpoint(
              getMultiDeviceChartData(tempVariables, timeRange)
            );
            if (!tempResponse.error && tempResponse.data) {
              setTemperatureData(processChartData(tempResponse.data));
            }
          }
        }

        // Fetch humidity data
        if (selectedCharts.humedad) {
          const humVariables = getVariablesForType("hum");
          if (humVariables.length > 0) {
            const humResponse = await callEndpoint(
              getMultiDeviceChartData(humVariables, timeRange)
            );
            if (!humResponse.error && humResponse.data) {
              setHumidityData(processChartData(humResponse.data));
            }
          }
        }

        // Fetch soil humidity data
        if (selectedCharts.humedadSuelo) {
          const soilVariables = getVariablesForType("soilhum");
          if (soilVariables.length > 0) {
            const soilResponse = await callEndpoint(
              getMultiDeviceChartData(soilVariables, timeRange)
            );
            if (!soilResponse.error && soilResponse.data) {
              setSoilHumidityData(processChartData(soilResponse.data));
            }
          }
        }

        // Fetch events
        if (selectedCharts.eventos) {
          const eventsResponse = await callEndpoint(getRecentEvents(10));
          if (!eventsResponse.error && eventsResponse.data) {
            setEventsData(eventsResponse.data.events || []);
          }
        }

        // Fetch notifications (alertas)
        if (selectedCharts.alertas) {
          const notificationsResponse = await callEndpoint(getNotifications());
          if (!notificationsResponse.error && notificationsResponse.data) {
            setAlertsData(notificationsResponse.data.data || []);
          }
        }
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    };

    if (devicesArr && devicesArr.length > 0) {
      fetchChartData();
    }
  }, [timeRange, selectedCharts, devicesArr, getVariablesForType]);

  // Procesar datos del backend
  const processChartData = (data: any): ChartDataPoint[] => {
    if (!data || !data.devices) return [];

    // Agrupar datos por timestamp
    const groupedData: { [key: string]: ChartDataPoint } = {};

    data.devices.forEach((device: any, index: number) => {
      if (device.data && Array.isArray(device.data)) {
        device.data.forEach((point: any) => {
          const timeKey = formatTime(point.time, timeRange);
          if (!groupedData[timeKey]) {
            groupedData[timeKey] = { time: timeKey };
          }
          groupedData[timeKey][`device${index + 1}`] = point.value;
        });
      }
    });

    return Object.values(groupedData).sort((a, b) =>
      a.time.localeCompare(b.time)
    );
  };

  // Formatear tiempo según el rango
  const formatTime = (timestamp: string, range: string): string => {
    const date = new Date(timestamp);
    switch (range) {
      case "24h":
        return date.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        });
      case "7d":
        return date.toLocaleDateString("es-ES", {
          weekday: "short",
          hour: "2-digit",
        });
      case "30d":
      case "90d":
        return date.toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "short",
        });
      default:
        return date.toLocaleString("es-ES");
    }
  };

  // Generar configuración de colores para dispositivos
  const generateDeviceConfig = (deviceCount: number) => {
    const colors = ["#4CB649", "#248A49", "#0A5F3C", "#DDFAB6"];
    const config: any = {};

    for (let i = 0; i < Math.min(deviceCount, 4); i++) {
      const deviceKey = `device${i + 1}`;
      config[deviceKey] = {
        label: devicesArr[i]?.name || `Dispositivo ${i + 1}`,
        color: colors[i],
      };
    }

    return config;
  };

  // Verificar si existen sensores de un tipo específico
  const hasSensorType = React.useMemo(() => {
    return {
      temperatura: getVariablesForType("temp").length > 0,
      humedad: getVariablesForType("hum").length > 0,
      humedadSuelo: getVariablesForType("soilhum").length > 0,
    };
  }, [getVariablesForType]);

  // Opciones de gráficos disponibles según los sensores del usuario
  const chartOptions = React.useMemo(() => {
    const options = [];

    if (hasSensorType.temperatura) {
      options.push({ id: "temperatura", label: "Temperatura" });
    }
    if (hasSensorType.humedad) {
      options.push({ id: "humedad", label: "Humedad Ambiente" });
    }
    if (hasSensorType.humedadSuelo) {
      options.push({ id: "humedadSuelo", label: "Humedad del Suelo" });
    }

    // Eventos y alertas siempre disponibles
    options.push(
      { id: "eventos", label: "Últimos Eventos" },
      { id: "alertas", label: "Últimas Alertas" }
    );

    return options;
  }, [hasSensorType]);

  // Guardar en localStorage cuando cambie la selección
  React.useEffect(() => {
    localStorage.setItem("selectedCharts", JSON.stringify(selectedCharts));
  }, [selectedCharts]);

  const handleChartToggle = (chartId: string) => {
    setSelectedCharts((prev) => ({
      ...prev,
      [chartId]: !prev[chartId],
    }));
  };

  // Formatear eventos para mostrar
  const formatEventTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Formatear notificaciones para mostrar
  const formatAlertSeverity = (notif: any) => {
    if (
      notif.emqxRuleTopic?.includes("high") ||
      notif.emqxRuleTopic?.includes("low")
    ) {
      return "warning";
    }
    return "info";
  };

  // Gráficos que ocupan 2 columnas (span completo)
  const fullWidthCharts = ["temperatura"];

  // Gráficos que ocupan 1 columna
  const singleColumnCharts = [
    "humedad",
    "humedadSuelo",
    "luz",
    "eventos",
    "alertas",
  ];

  return (
    <div className="space-y-4">
      {/* Header with title and dropdown */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Tendencias Históricas
        </h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="shrink-0">
              <span className="text-xs">Gráficos</span>
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-xs">
              Seleccionar gráficos
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {chartOptions.map((option) => (
              <DropdownMenuItem
                key={option.id}
                className="flex items-center gap-2 cursor-pointer"
                onSelect={(e) => {
                  e.preventDefault();
                  handleChartToggle(option.id);
                }}
              >
                <Checkbox
                  checked={selectedCharts[option.id]}
                  className="pointer-events-none"
                />
                <span className="text-sm flex-1">{option.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Gráficos de ancho completo (2 columnas) */}
        {selectedCharts.temperatura && hasSensorType.temperatura && (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm lg:col-span-2 h-[380px]">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-sm sm:text-base">
                Temperatura por Dispositivo
              </CardTitle>
              <CardDescription className="text-xs">
                Comparativa en período {timeRange}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              {loading ? (
                <Skeleton className="w-full h-[200px] sm:h-[250px]" />
              ) : temperatureData.length > 0 ? (
                <ChartContainer
                  config={generateDeviceConfig(devicesArr.length)}
                  className="w-full h-[200px] sm:h-[250px] aspect-auto"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={temperatureData}
                      margin={{ top: 5, right: 45, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis
                        dataKey="time"
                        stroke="#9ca3af"
                        style={{ fontSize: "11px" }}
                      />
                      <YAxis stroke="#9ca3af" style={{ fontSize: "11px" }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend
                        wrapperStyle={{
                          fontSize: "12px",
                          paddingTop: "10px",
                          color: "#d1d5db",
                        }}
                      />
                      {devicesArr.slice(0, 4).map((device, index) => (
                        <Line
                          key={device.dId}
                          type="monotone"
                          dataKey={`device${index + 1}`}
                          stroke={
                            ["#4CB649", "#248A49", "#0A5F3C", "#DDFAB6"][index]
                          }
                          dot={false}
                          strokeWidth={2}
                          name={device.name}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-[200px] sm:h-[250px] text-muted-foreground text-sm">
                  No hay datos disponibles
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Humidity Chart */}
        {selectedCharts.humedad && hasSensorType.humedad && (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-[380px]">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-sm sm:text-base">
                Humedad Ambiente
              </CardTitle>
              <CardDescription className="text-xs">
                Comparativa por dispositivo
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              {loading ? (
                <Skeleton className="w-full h-[200px] sm:h-[250px]" />
              ) : humidityData.length > 0 ? (
                <ChartContainer
                  config={generateDeviceConfig(devicesArr.length)}
                  className="w-full h-[200px] sm:h-[250px] aspect-auto"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={humidityData}
                      margin={{ top: 5, right: 45, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis
                        dataKey="time"
                        stroke="#9ca3af"
                        style={{ fontSize: "11px" }}
                      />
                      <YAxis stroke="#9ca3af" style={{ fontSize: "11px" }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend
                        wrapperStyle={{
                          fontSize: "12px",
                          paddingTop: "10px",
                          color: "#d1d5db",
                        }}
                      />
                      {devicesArr.slice(0, 4).map((device, index) => (
                        <Area
                          key={device.dId}
                          type="monotone"
                          dataKey={`device${index + 1}`}
                          stroke={
                            ["#4CB649", "#248A49", "#0A5F3C", "#DDFAB6"][index]
                          }
                          fill={
                            ["#4CB649", "#248A49", "#0A5F3C", "#DDFAB6"][index]
                          }
                          fillOpacity={0.3}
                          name={device.name}
                        />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-[200px] sm:h-[250px] text-muted-foreground text-sm">
                  No hay datos disponibles
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Soil Humidity Chart */}
        {selectedCharts.humedadSuelo && hasSensorType.humedadSuelo && (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-[380px]">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-sm sm:text-base">
                Humedad del Suelo
              </CardTitle>
              <CardDescription className="text-xs">
                Comparativa por dispositivo
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              {loading ? (
                <Skeleton className="w-full h-[200px] sm:h-[250px]" />
              ) : soilHumidityData.length > 0 ? (
                <ChartContainer
                  config={generateDeviceConfig(devicesArr.length)}
                  className="w-full h-[200px] sm:h-[250px] aspect-auto"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={soilHumidityData}
                      margin={{ top: 5, right: 45, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis
                        dataKey="time"
                        stroke="#9ca3af"
                        style={{ fontSize: "11px" }}
                      />
                      <YAxis stroke="#9ca3af" style={{ fontSize: "11px" }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend
                        wrapperStyle={{
                          fontSize: "12px",
                          paddingTop: "10px",
                          color: "#d1d5db",
                        }}
                      />
                      {devicesArr.slice(0, 4).map((device, index) => (
                        <Area
                          key={device.dId}
                          type="monotone"
                          dataKey={`device${index + 1}`}
                          stroke={
                            ["#4CB649", "#248A49", "#0A5F3C", "#DDFAB6"][index]
                          }
                          fill={
                            ["#4CB649", "#248A49", "#0A5F3C", "#DDFAB6"][index]
                          }
                          fillOpacity={0.3}
                          name={device.name}
                        />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-[200px] sm:h-[250px] text-muted-foreground text-sm">
                  No hay datos disponibles
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Últimos Eventos Card */}
        {selectedCharts.eventos && (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-[380px] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 flex-shrink-0">
              <CardTitle className="text-base font-medium">
                Últimos Eventos
              </CardTitle>
              <Activity className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto relative">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : eventsData.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {eventsData.map((event, index) => (
                      <div
                        key={index}
                        className="flex gap-3 p-3 rounded-lg bg-background/50 border border-border/50"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <Activity className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground text-left">
                                {event.payload?.type || "Evento del sistema"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {event.deviceName}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatEventTime(event.expiracy)}
                            </p>
                          </div>
                          {event.payload?.description && (
                            <p className="text-xs text-muted-foreground leading-relaxed text-left">
                              {event.payload.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent pointer-events-none"></div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  No hay eventos recientes
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Últimas Alertas Card */}
        {selectedCharts.alertas && (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-[380px] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 flex-shrink-0">
              <CardTitle className="text-base font-medium">
                Últimas Alertas
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto relative">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : alertsData.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {alertsData.slice(0, 10).map((alert, index) => {
                      const severity = formatAlertSeverity(alert);
                      return (
                        <div
                          key={index}
                          className="flex gap-3 p-3 rounded-lg bg-background/50 border border-border/50"
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            {severity === "warning" ? (
                              <AlertCircle className="h-5 w-5 text-yellow-500" />
                            ) : (
                              <Info className="h-5 w-5 text-blue-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-foreground text-left">
                                  {alert.variableFullName} - {alert.condition}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Dispositivo: {alert.dId}
                                </p>
                              </div>
                              <p className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatEventTime(alert.time)}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed text-left">
                              Valor: {alert.payload?.value} {alert.unidad}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent pointer-events-none"></div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  No hay alertas recientes
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
