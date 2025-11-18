import { type LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface TelemetryCardProps {
  label: string
  value: string
  unit: string
  range: string
  icon: LucideIcon
  trend: 'up' | 'down' | 'stable'
  color: string
  devices: number
}

export default function TelemetryCard({
  label,
  value,
  unit,
  range,
  icon: Icon,
  trend,
  devices,
}: TelemetryCardProps) {
  const trendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor = trend === 'up' ? 'text-chart-1' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground'

  return (
    <div className="p-4 rounded-lg border border-border bg-card hover:bg-card/80 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <Icon className="w-5 h-5 text-muted-foreground" />
        <div className={`flex items-center gap-1 ${trendColor}`}>
          {trend !== 'stable' && (
            <>
              {trend === 'up' ? '+2.1%' : '-1.3%'}
              {trendIcon && <trendIcon className="w-4 h-4" />}
            </>
          )}
          {trend === 'stable' && <Minus className="w-4 h-4" />}
        </div>
      </div>

      <div className="mb-2">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-2xl font-bold text-foreground">
          {value}<span className="text-sm text-muted-foreground ml-1">{unit}</span>
        </p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <span className="text-xs text-muted-foreground">Rango: {range}</span>
        <span className="text-xs font-medium text-foreground">{devices} dispositivos</span>
      </div>
    </div>
  )
}
