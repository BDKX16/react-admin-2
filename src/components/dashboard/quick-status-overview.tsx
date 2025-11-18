'use client'

import { TrendingUp, TrendingDown, Minus, Thermometer, Droplets, Leaf } from 'lucide-react'
import { Card } from '@/components/ui/card'

export default function QuickStatusOverview() {
  // Mock data - In production, this would come from your API
  const sensors = [
    {
      name: 'Temperatura',
      value: '22.8',
      unit: '°C',
      range: '20-25°C',
      icon: Thermometer,
      trend: 'up',
      trendValue: '+1.2°C',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
    },
    {
      name: 'Humedad Ambiente',
      value: '65',
      unit: '%',
      range: '50-70%',
      icon: Droplets,
      trend: 'stable',
      trendValue: '±0%',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      name: 'Humedad Suelo',
      value: '58',
      unit: '%',
      range: '40-60%',
      icon: Leaf,
      trend: 'down',
      trendValue: '-2.1%',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    // CO2 would be conditionally rendered based on available sensors
    // {
    //   name: 'CO₂',
    //   value: '650',
    //   unit: 'ppm',
    //   range: '600-800 ppm',
    //   icon: Wind,
    //   trend: 'up',
    //   trendValue: '+45 ppm',
    //   color: 'text-purple-400',
    //   bgColor: 'bg-purple-500/10',
    // }
  ]

  const TrendIcon = ({ trend }: { trend: string }) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-400" />
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-400" />
    return <Minus className="w-4 h-4 text-yellow-400" />
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Estado de Sensores</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sensors.map((sensor) => {
          const Icon = sensor.icon
          return (
            <Card key={sensor.name} className="p-4 border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1 truncate">{sensor.name}</p>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className={`text-2xl sm:text-xl font-bold ${sensor.color}`}>
                      {sensor.value}
                    </span>
                    <span className="text-xs text-muted-foreground">{sensor.unit}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{sensor.range}</p>
                </div>
                <div className={`p-2.5 rounded-lg ${sensor.bgColor} flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${sensor.color}`} />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/20">
                <TrendIcon trend={sensor.trend} />
                <span className="text-xs text-muted-foreground">{sensor.trendValue}</span>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
