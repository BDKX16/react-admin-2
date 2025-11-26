import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Leaf, CloudRain, ChevronDown } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, ReferenceLine } from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import { getChartsData } from "../services/private";
import useFetchAndLoad from "@/hooks/useFetchAndLoad";
import { createChartDateTimeAdapter } from "@/adapters/chart-data";
import { Skeleton } from "./ui/skeleton";

const chartConfig = {
  value: {
    label: "VPD",
    color: "hsl(var(--chart-3))",
  },
};

export const FusionCard = ({
  type,
  vpd,
  dewPoint,
  dId,
  tempVariable,
  humVariable,
}) => {
  const [selectedPhase, setSelectedPhase] = useState("vegetacion");
  const [chartData, setChartData] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const { loading, callEndpoint } = useFetchAndLoad();

  // Detectar tamaño de pantalla
  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 640); // sm breakpoint
    };
    checkIsDesktop();
    window.addEventListener("resize", checkIsDesktop);
    return () => window.removeEventListener("resize", checkIsDesktop);
  }, []);

  const vpdPhases = {
    clonacion: { min: 0.4, max: 0.8, label: "Clonación" },
    vegetacion: { min: 0.8, max: 1.2, label: "Vegetación" },
    floracionTemprana: { min: 1.0, max: 1.2, label: "Floración temprana" },
    floracionTardia: { min: 1.2, max: 1.6, label: "Floración tardía" },
  };

  // Obtener fase actual y determinar estado
  const currentPhase = vpdPhases[selectedPhase];

  // Calcular VPD a partir de temp y humedad
  const calculateVPD = (temp, humidity) => {
    const svp = 0.61078 * Math.exp((17.27 * temp) / (temp + 237.3));
    const avp = svp * (humidity / 100);
    const vpd = svp - avp;
    return Number(vpd.toFixed(2));
  };

  // Fetch y calcular datos históricos de VPD
  useEffect(() => {
    if (type !== "vpd" || !dId || !tempVariable || !humVariable) return;

    const fetchData = async () => {
      const timeAgo = 2000;

      // Obtener datos de temperatura y humedad
      const [tempData, humData] = await Promise.all([
        callEndpoint(getChartsData(dId, tempVariable, timeAgo)),
        callEndpoint(getChartsData(dId, humVariable, timeAgo)),
      ]);

      if (tempData?.data?.data && humData?.data?.data) {
        // Convertir datos usando el adapter
        const tempArray = tempData.data.data.map((item) =>
          createChartDateTimeAdapter(item)
        );
        const humArray = humData.data.data.map((item) =>
          createChartDateTimeAdapter(item)
        );

        // Combinar datos por timestamp y calcular VPD
        const combined = combineAndCalculateVPD(tempArray, humArray);

        setChartData(
          combined.map((item) => ({
            ...item,
            time: new Date(item.time).toLocaleString("es-ES", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
          }))
        );
      }
    };

    fetchData();
  }, [dId, tempVariable, humVariable, type]);

  // Combinar arrays de temp y humedad por timestamp y calcular VPD
  const combineAndCalculateVPD = (tempArray, humArray, threshold = 3000000) => {
    const combined = {};

    // Agregar temperaturas
    tempArray.forEach((item) => {
      const time = item.time.getTime();
      combined[time] = { time: item.time, temp: item.value };
    });

    // Agregar humedades
    humArray.forEach((item) => {
      const time = item.time.getTime();
      let found = false;

      for (const key in combined) {
        if (Math.abs(key - time) <= threshold) {
          combined[key].hum = item.value;
          found = true;
          break;
        }
      }

      if (!found) {
        combined[time] = { time: item.time, hum: item.value };
      }
    });

    // Calcular VPD solo para registros con ambos valores
    return Object.values(combined)
      .filter((item) => item.temp !== undefined && item.hum !== undefined)
      .map((item) => ({
        time: item.time,
        value: calculateVPD(item.temp, item.hum),
      }));
  };

  const getVpdStatusForPhase = (value, phase) => {
    if (value < phase.min) {
      return {
        text: "Bajo",
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
        barColor: "bg-blue-500",
      };
    }
    if (value > phase.max) {
      return {
        text: "Alto",
        color: "text-orange-500",
        bgColor: "bg-orange-500/10",
        barColor: "bg-orange-500",
      };
    }
    return {
      text: "Óptimo",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      barColor: "bg-green-500",
    };
  };

  const vpdStatus =
    type === "vpd" ? getVpdStatusForPhase(vpd, currentPhase) : null;

  const config = {
    vpd: {
      icon: Leaf,
      title: "VPD",
      description: "",
      value: vpd,
      unit: "kPa",
      color: vpdStatus?.color || "text-green-500",
      bgColor: vpdStatus?.bgColor || "bg-green-500/10",
      range: { min: currentPhase.min, max: currentPhase.max },
    },
    dewpoint: {
      icon: CloudRain,
      title: "Punto de Rocío",
      description: "Temperatura de Condensación",
      value: dewPoint,
      unit: "°C",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      range: { label: "Monitoreo de condensación" },
    },
  };

  const data = config[type];
  const Icon = data.icon;
  const status = vpdStatus || (type === "dewpoint" ? null : null);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow border-0 sm:border">
      {/* Mobile: Versión compacta con chevron */}
      <div className="sm:hidden">
        <CardHeader
          className={`${type === "vpd" ? "pb-3 cursor-pointer" : "pb-3"}`}
          onClick={() => type === "vpd" && setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Icon className={`h-5 w-5 ${data.color}`} />
              <CardTitle className="text-lg font-semibold">
                {data.title}
              </CardTitle>
              {status && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${status.bgColor} ${status.color}`}
                >
                  {status.text}
                </span>
              )}
            </div>

            {/* VPD: Chevron expandible + DP */}
            {type === "vpd" && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <CloudRain className="h-4 w-4 text-blue-500" />
                  <span className="text-muted-foreground font-medium text-xs">
                    DP:
                  </span>
                  <span className="font-bold text-lg">
                    {typeof dewPoint === "number"
                      ? dewPoint.toFixed(1)
                      : dewPoint}
                  </span>
                  <span className="text-muted-foreground text-xs">°C</span>
                </div>
                <ChevronDown
                  className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </div>
            )}

            {/* Dew Point: Valor a la derecha */}
            {type === "dewpoint" && (
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">{data.value}</span>
                <span className="text-sm text-muted-foreground">
                  {data.unit}
                </span>
              </div>
            )}
          </div>
        </CardHeader>

        {/* Contenido expandible para VPD con animación */}
        {type === "vpd" && isExpanded && (
          <div className="overflow-hidden animate-in slide-in-from-top-2 duration-300">
            <CardContent className="pb-4 pt-0">
              {/* Valor y Select en la misma línea */}
              <div className="flex items-center justify-between gap-4 mb-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{data.value}</span>
                  <span className="text-base text-muted-foreground">
                    {data.unit}
                  </span>
                </div>
                <Select value={selectedPhase} onValueChange={setSelectedPhase}>
                  <SelectTrigger className="w-[140px] h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clonacion">Clonación</SelectItem>
                    <SelectItem value="vegetacion">Vegetación</SelectItem>
                    <SelectItem value="floracionTemprana">
                      Floración temp.
                    </SelectItem>
                    <SelectItem value="floracionTardia">
                      Floración tard.
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Gráfico */}
              {isExpanded && (
                <div className="pt-3 border-t">
                  {loading || !chartData ? (
                    <Skeleton className="h-[80px] w-full rounded-lg" />
                  ) : (
                    <ChartContainer
                      config={chartConfig}
                      className="h-[80px] w-full"
                    >
                      <AreaChart data={chartData} aspect={4}>
                        <defs>
                          <linearGradient
                            id="fillVpdMobile"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor={
                                vpdStatus?.barColor?.replace("bg-", "") ===
                                "green-500"
                                  ? "hsl(var(--chart-2))"
                                  : vpdStatus?.barColor?.replace("bg-", "") ===
                                    "blue-500"
                                  ? "hsl(var(--chart-1))"
                                  : "hsl(var(--chart-5))"
                              }
                              stopOpacity={0.6}
                            />
                            <stop
                              offset="95%"
                              stopColor={
                                vpdStatus?.barColor?.replace("bg-", "") ===
                                "green-500"
                                  ? "hsl(var(--chart-2))"
                                  : vpdStatus?.barColor?.replace("bg-", "") ===
                                    "blue-500"
                                  ? "hsl(var(--chart-1))"
                                  : "hsl(var(--chart-5))"
                              }
                              stopOpacity={0.05}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          vertical={false}
                          strokeDasharray="3 3"
                          opacity={0.2}
                        />
                        <XAxis
                          dataKey="time"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          hide
                        />
                        <ReferenceLine
                          y={0.4}
                          stroke="hsl(var(--chart-1))"
                          strokeDasharray="2 2"
                          strokeWidth={1}
                          strokeOpacity={0.4}
                        />
                        <ReferenceLine
                          y={0.8}
                          stroke="hsl(var(--chart-1))"
                          strokeDasharray="2 2"
                          strokeWidth={1}
                          strokeOpacity={0.6}
                          label={{
                            value: "0.8",
                            position: "insideTopRight",
                            fill: "hsl(var(--muted-foreground))",
                            fontSize: 9,
                            offset: 5,
                          }}
                        />
                        <ReferenceLine
                          y={1.2}
                          stroke="hsl(var(--chart-2))"
                          strokeDasharray="2 2"
                          strokeWidth={1}
                          strokeOpacity={0.6}
                          label={{
                            value: "1.2",
                            position: "insideTopRight",
                            fill: "hsl(var(--muted-foreground))",
                            fontSize: 9,
                            offset: 5,
                          }}
                        />
                        <ReferenceLine
                          y={1.6}
                          stroke="hsl(var(--chart-5))"
                          strokeDasharray="2 2"
                          strokeWidth={1}
                          strokeOpacity={0.4}
                          label={{
                            value: "1.6",
                            position: "insideTopRight",
                            fill: "hsl(var(--muted-foreground))",
                            fontSize: 9,
                            offset: 5,
                          }}
                        />
                        <ReferenceLine
                          y={data.range.max}
                          stroke={
                            vpdStatus?.barColor?.replace("bg-", "") ===
                            "green-500"
                              ? "hsl(var(--chart-2))"
                              : vpdStatus?.barColor?.replace("bg-", "") ===
                                "blue-500"
                              ? "hsl(var(--chart-1))"
                              : "hsl(var(--chart-5))"
                          }
                          strokeDasharray="4 2"
                          strokeWidth={1.5}
                        />
                        <ReferenceLine
                          y={data.range.min}
                          stroke={
                            vpdStatus?.barColor?.replace("bg-", "") ===
                            "green-500"
                              ? "hsl(var(--chart-2))"
                              : vpdStatus?.barColor?.replace("bg-", "") ===
                                "blue-500"
                              ? "hsl(var(--chart-1))"
                              : "hsl(var(--chart-5))"
                          }
                          strokeDasharray="4 2"
                          strokeWidth={1.5}
                        />
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent hideLabel />}
                        />
                        <Area
                          dataKey="value"
                          type="monotone"
                          fill="url(#fillVpdMobile)"
                          fillOpacity={0.25}
                          stroke={
                            vpdStatus?.barColor?.replace("bg-", "") ===
                            "green-500"
                              ? "hsl(var(--chart-2))"
                              : vpdStatus?.barColor?.replace("bg-", "") ===
                                "blue-500"
                              ? "hsl(var(--chart-1))"
                              : "hsl(var(--chart-5))"
                          }
                          strokeWidth={1.2}
                        />
                      </AreaChart>
                    </ChartContainer>
                  )}
                </div>
              )}
            </CardContent>
          </div>
        )}
      </div>

      {/* Desktop: Versión completa */}
      {isDesktop && (
        <div>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${data.color}`} />
                    {data.title}
                  </CardTitle>
                  {/* Estado del VPD - badge pequeño al lado del título */}
                  {status && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${status.bgColor} ${status.color}`}
                    >
                      {status.text}
                    </span>
                  )}
                </div>
                {data.description && (
                  <CardDescription className="text-xs">
                    {data.description}
                  </CardDescription>
                )}
              </div>

              {/* Select de fase solo para VPD - arriba a la derecha */}
              {type === "vpd" && (
                <Select value={selectedPhase} onValueChange={setSelectedPhase}>
                  <SelectTrigger className="w-[180px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clonacion">Clonación</SelectItem>
                    <SelectItem value="vegetacion">Vegetación</SelectItem>
                    <SelectItem value="floracionTemprana">
                      Floración temprana
                    </SelectItem>
                    <SelectItem value="floracionTardia">
                      Floración tardía
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}

              {type === "dewpoint" && (
                <div className={`p-3 rounded-full ${data.bgColor}`}>
                  <Icon className={`h-6 w-6 ${data.color}`} />
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="pb-4">
            <div className="space-y-3">
              {/* Valor principal */}
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{data.value}</span>
                <span className="text-lg text-muted-foreground">
                  {data.unit}
                </span>
              </div>

              {/* Gráfico histórico para VPD */}
              {type === "vpd" && (
                <div className="pt-2">
                  {loading || !chartData ? (
                    <Skeleton className="h-[80px] w-full rounded-lg" />
                  ) : isDesktop ? (
                    <ChartContainer
                      config={chartConfig}
                      className="h-[80px] w-full"
                    >
                      <AreaChart data={chartData} aspect={4}>
                        <defs>
                          <linearGradient
                            id="fillVpd"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor={
                                vpdStatus?.barColor?.replace("bg-", "") ===
                                "green-500"
                                  ? "hsl(var(--chart-2))"
                                  : vpdStatus?.barColor?.replace("bg-", "") ===
                                    "blue-500"
                                  ? "hsl(var(--chart-1))"
                                  : "hsl(var(--chart-5))"
                              }
                              stopOpacity={0.6}
                            />
                            <stop
                              offset="95%"
                              stopColor={
                                vpdStatus?.barColor?.replace("bg-", "") ===
                                "green-500"
                                  ? "hsl(var(--chart-2))"
                                  : vpdStatus?.barColor?.replace("bg-", "") ===
                                    "blue-500"
                                  ? "hsl(var(--chart-1))"
                                  : "hsl(var(--chart-5))"
                              }
                              stopOpacity={0.05}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          vertical={false}
                          strokeDasharray="3 3"
                          opacity={0.2}
                        />
                        <XAxis
                          dataKey="time"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          hide
                        />

                        {/* Líneas horizontales para todas las fases */}
                        {/* Clonación - 0.4 a 0.8 */}
                        <ReferenceLine
                          y={0.4}
                          stroke="hsl(var(--chart-1))"
                          strokeDasharray="2 2"
                          strokeWidth={1}
                          strokeOpacity={0.4}
                        />
                        <ReferenceLine
                          y={0.8}
                          stroke="hsl(var(--chart-1))"
                          strokeDasharray="2 2"
                          strokeWidth={1}
                          strokeOpacity={0.6}
                          label={{
                            value: "0.8",
                            position: "insideTopRight",
                            fill: "hsl(var(--muted-foreground))",
                            fontSize: 9,
                            offset: 5,
                          }}
                        />

                        {/* Vegetación - 0.8 a 1.2 */}
                        <ReferenceLine
                          y={1.2}
                          stroke="hsl(var(--chart-2))"
                          strokeDasharray="2 2"
                          strokeWidth={1}
                          strokeOpacity={0.6}
                          label={{
                            value: "1.2",
                            position: "insideTopRight",
                            fill: "hsl(var(--muted-foreground))",
                            fontSize: 9,
                            offset: 5,
                          }}
                        />

                        {/* Floración tardía - 1.2 a 1.6 */}
                        <ReferenceLine
                          y={1.6}
                          stroke="hsl(var(--chart-5))"
                          strokeDasharray="2 2"
                          strokeWidth={1}
                          strokeOpacity={0.4}
                          label={{
                            value: "1.6",
                            position: "insideTopRight",
                            fill: "hsl(var(--muted-foreground))",
                            fontSize: 9,
                            offset: 5,
                          }}
                        />

                        {/* Líneas de la fase actual (más destacadas) */}
                        <ReferenceLine
                          y={data.range.max}
                          stroke={
                            vpdStatus?.barColor?.replace("bg-", "") ===
                            "green-500"
                              ? "hsl(var(--chart-2))"
                              : vpdStatus?.barColor?.replace("bg-", "") ===
                                "blue-500"
                              ? "hsl(var(--chart-1))"
                              : "hsl(var(--chart-5))"
                          }
                          strokeDasharray="4 2"
                          strokeWidth={1.5}
                        />
                        <ReferenceLine
                          y={data.range.min}
                          stroke={
                            vpdStatus?.barColor?.replace("bg-", "") ===
                            "green-500"
                              ? "hsl(var(--chart-2))"
                              : vpdStatus?.barColor?.replace("bg-", "") ===
                                "blue-500"
                              ? "hsl(var(--chart-1))"
                              : "hsl(var(--chart-5))"
                          }
                          strokeDasharray="4 2"
                          strokeWidth={1.5}
                        />

                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent hideLabel />}
                        />
                        <Area
                          dataKey="value"
                          type="monotone"
                          fill="url(#fillVpd)"
                          fillOpacity={0.25}
                          stroke={
                            vpdStatus?.barColor?.replace("bg-", "") ===
                            "green-500"
                              ? "hsl(var(--chart-2))"
                              : vpdStatus?.barColor?.replace("bg-", "") ===
                                "blue-500"
                              ? "hsl(var(--chart-1))"
                              : "hsl(var(--chart-5))"
                          }
                          strokeWidth={1.2}
                        />
                      </AreaChart>
                    </ChartContainer>
                  ) : null}
                </div>
              )}
            </div>
          </CardContent>
        </div>
      )}
    </Card>
  );
};
