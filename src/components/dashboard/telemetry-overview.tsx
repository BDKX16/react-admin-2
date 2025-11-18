'use client'

import { TrendingUp, Droplets, Wind, Zap } from 'lucide-react'
import TelemetryCard from './telemetry-card'

export default function TelemetryOverview() {
  const telemetryData = [
    {
      label: 'Temperatura Promedio',
      value: '22.8',
      unit: '°C',
      range: '20-25°C',
      icon: Zap,
      trend: 'up',
      color: 'chart-1',
      devices: 4,
    },
    {
      label: 'Humedad Ambiente',
      value: '65',
      unit: '%',
      range: '50-70%',
      icon: Droplets,
      trend: 'stable',
      color: 'chart-2',
      devices: 4,
    },
    {
      label: 'Humedad Suelo',
      value: '58',
      unit: '%',
      range: '40-60%',
      icon: Droplets,
      trend: 'down',
      color: 'chart-3',
      devices: 4,
    },
    {
      label: 'Ventilación',
      value: '72',
      unit: '%',
      range: 'Activada',
      icon: Wind,
      trend: 'up',
      color: 'chart-4',
      devices: 2,
    },
  ]

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-4">Resumen de Telemetría</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {telemetryData.map((item) => (
          <TelemetryCard key={item.label} {...item} />
        ))}
      </div>
    </div>
  )
}
