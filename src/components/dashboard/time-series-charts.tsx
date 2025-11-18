'use client'

import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

interface TimeSeriesChartsProps {
  timeRange: '24h' | '7d' | '30d' | '90d'
}

export default function TimeSeriesCharts({ timeRange }: TimeSeriesChartsProps) {
  // Mock data for temperature and humidity
  const temperatureData = [
    { time: '00:00', temp: 21.2, target: 22.5 },
    { time: '04:00', temp: 20.8, target: 22.5 },
    { time: '08:00', temp: 22.1, target: 22.5 },
    { time: '12:00', temp: 24.3, target: 22.5 },
    { time: '16:00', temp: 23.8, target: 22.5 },
    { time: '20:00', temp: 22.4, target: 22.5 },
    { time: '23:59', temp: 21.9, target: 22.5 },
  ]

  const humidityData = [
    { time: '00:00', humidity: 62, co2: 580 },
    { time: '04:00', humidity: 58, co2: 520 },
    { time: '08:00', humidity: 64, co2: 650 },
    { time: '12:00', humidity: 68, co2: 720 },
    { time: '16:00', humidity: 66, co2: 710 },
    { time: '20:00', humidity: 64, co2: 680 },
    { time: '23:59', humidity: 60, co2: 600 },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Gráficos de Series de Tiempo</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature Chart */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Temperatura en Tiempo Real</CardTitle>
            <CardDescription>Comparación con valor objetivo</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                temp: {
                  label: 'Temperatura Real',
                  color: 'hsl(var(--color-chart-1))',
                },
                target: {
                  label: 'Objetivo',
                  color: 'hsl(var(--color-chart-4))',
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={temperatureData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="time" stroke="var(--color-muted-foreground)" style={{ fontSize: '12px' }} />
                  <YAxis stroke="var(--color-muted-foreground)" style={{ fontSize: '12px' }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="temp"
                    stroke="var(--color-chart-1)"
                    dot={false}
                    strokeWidth={2}
                    name="Real"
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="var(--color-chart-4)"
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

        {/* Humidity & CO2 Chart */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Humedad y CO₂</CardTitle>
            <CardDescription>Niveles históricos del últimas horas</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                humidity: {
                  label: 'Humedad (%)',
                  color: 'hsl(var(--color-chart-2))',
                },
                co2: {
                  label: 'CO₂ (ppm)',
                  color: 'hsl(var(--color-chart-3))',
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={humidityData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="time" stroke="var(--color-muted-foreground)" style={{ fontSize: '12px' }} />
                  <YAxis stroke="var(--color-muted-foreground)" style={{ fontSize: '12px' }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="humidity"
                    stackId="1"
                    stroke="var(--color-chart-2)"
                    fill="var(--color-chart-2)"
                    fillOpacity={0.3}
                    name="Humedad (%)"
                  />
                  <Area
                    type="monotone"
                    dataKey="co2"
                    stackId="2"
                    stroke="var(--color-chart-3)"
                    fill="var(--color-chart-3)"
                    fillOpacity={0.3}
                    name="CO₂ (ppm)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Soil Moisture Trend */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Humedad del Suelo por Dispositivo</CardTitle>
          <CardDescription>Tendencia a lo largo del período seleccionado ({timeRange})</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              device1: { label: 'Maceta 1', color: 'hsl(var(--color-chart-1))' },
              device2: { label: 'Maceta 2', color: 'hsl(var(--color-chart-2))' },
              device3: { label: 'Maceta 3', color: 'hsl(var(--color-chart-3))' },
              device4: { label: 'Maceta 4', color: 'hsl(var(--color-chart-4))' },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={[
                  { time: 'Lun', device1: 55, device2: 48, device3: 62, device4: 51 },
                  { time: 'Mar', device1: 53, device2: 52, device3: 60, device4: 54 },
                  { time: 'Mié', device1: 48, device2: 58, device3: 58, device4: 49 },
                  { time: 'Jue', device1: 52, device2: 55, device3: 64, device4: 53 },
                  { time: 'Vie', device1: 58, device2: 60, device3: 67, device4: 59 },
                  { time: 'Sab', device1: 62, device2: 64, device3: 65, device4: 62 },
                  { time: 'Dom', device1: 58, device2: 59, device3: 60, device4: 57 },
                ]}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="time" stroke="var(--color-muted-foreground)" style={{ fontSize: '12px' }} />
                <YAxis stroke="var(--color-muted-foreground)" style={{ fontSize: '12px' }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line type="monotone" dataKey="device1" stroke="var(--color-chart-1)" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="device2" stroke="var(--color-chart-2)" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="device3" stroke="var(--color-chart-3)" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="device4" stroke="var(--color-chart-4)" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
