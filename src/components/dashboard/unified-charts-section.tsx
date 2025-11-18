"use client";

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

interface UnifiedChartsSectionProps {
  timeRange: "24h" | "7d" | "30d" | "90d";
}

export default function UnifiedChartsSection({
  timeRange,
}: UnifiedChartsSectionProps) {
  const temperatureData = [
    { time: "00:00", temp: 21.2, target: 22.5 },
    { time: "04:00", temp: 20.8, target: 22.5 },
    { time: "08:00", temp: 22.1, target: 22.5 },
    { time: "12:00", temp: 24.3, target: 22.5 },
    { time: "16:00", temp: 23.8, target: 22.5 },
    { time: "20:00", temp: 22.4, target: 22.5 },
    { time: "23:59", temp: 21.9, target: 22.5 },
  ];

  const humidityData = [
    { time: "00:00", humidity: 62, soil: 55 },
    { time: "04:00", humidity: 58, soil: 52 },
    { time: "08:00", humidity: 64, soil: 48 },
    { time: "12:00", humidity: 68, soil: 52 },
    { time: "16:00", humidity: 66, soil: 58 },
    { time: "20:00", humidity: 64, soil: 62 },
    { time: "23:59", humidity: 60, soil: 58 },
  ];

  return (
    <div className="space-y-4">
      {/* Header aligned to left */}
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Tendencias Históricas
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Temperature Chart */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-sm sm:text-base">Temperatura</CardTitle>
            <CardDescription className="text-xs">
              Real vs Objetivo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                temp: {
                  label: "Actual",
                  color: "#10b981",
                },
                target: {
                  label: "Objetivo",
                  color: "#34d399",
                },
              }}
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
                  <Line
                    type="monotone"
                    dataKey="temp"
                    stroke="#10b981"
                    dot={false}
                    strokeWidth={2}
                    name="Actual"
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#34d399"
                    strokeDasharray="5 5"
                    dot={false}
                    strokeWidth={2}
                    name="Objetivo"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Humidity & Soil Moisture Chart */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-sm sm:text-base">Humedad</CardTitle>
            <CardDescription className="text-xs">
              Ambiente vs Suelo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                humidity: {
                  label: "Ambiente",
                  color: "#10b981",
                },
                soil: {
                  label: "Suelo",
                  color: "#059669",
                },
              }}
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
                  <Area
                    type="monotone"
                    dataKey="humidity"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                    name="Ambiente"
                  />
                  <Area
                    type="monotone"
                    dataKey="soil"
                    stroke="#059669"
                    fill="#059669"
                    fillOpacity={0.3}
                    name="Suelo"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Multi-Device Comparison */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="text-sm sm:text-base">
            Temperatura por Dispositivo
          </CardTitle>
          <CardDescription className="text-xs">
            Comparativa en período {timeRange}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <ChartContainer
            config={{
              device1: { label: "Dispositivo 1", color: "#10b981" },
              device2: { label: "Dispositivo 2", color: "#34d399" },
              device3: { label: "Dispositivo 3", color: "#6ee7b7" },
              device4: { label: "Dispositivo 4", color: "#059669" },
            }}
            className="w-full h-[200px] sm:h-[250px] aspect-auto"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={[
                  {
                    time: "Lun",
                    device1: 22,
                    device2: 20,
                    device3: 24,
                    device4: 21,
                  },
                  {
                    time: "Mar",
                    device1: 23,
                    device2: 21,
                    device3: 25,
                    device4: 22,
                  },
                  {
                    time: "Mié",
                    device1: 21,
                    device2: 22,
                    device3: 23,
                    device4: 24,
                  },
                  {
                    time: "Jue",
                    device1: 22,
                    device2: 23,
                    device3: 24,
                    device4: 22,
                  },
                  {
                    time: "Vie",
                    device1: 24,
                    device2: 22,
                    device3: 26,
                    device4: 23,
                  },
                  {
                    time: "Sab",
                    device1: 23,
                    device2: 24,
                    device3: 25,
                    device4: 25,
                  },
                  {
                    time: "Dom",
                    device1: 22,
                    device2: 23,
                    device3: 24,
                    device4: 24,
                  },
                ]}
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
                <Line
                  type="monotone"
                  dataKey="device1"
                  stroke="#10b981"
                  dot={false}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="device2"
                  stroke="#34d399"
                  dot={false}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="device3"
                  stroke="#6ee7b7"
                  dot={false}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="device4"
                  stroke="#059669"
                  dot={false}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
