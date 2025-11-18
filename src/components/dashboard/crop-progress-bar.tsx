'use client'

import { Card, CardContent } from '@/components/ui/card'

interface CropProgressPhase {
  name: string
  durationDays: number
  color: string
}

interface Device {
  name: string
  startDate: Date
  currentPhase: 'clonacion' | 'vegetacion' | 'floracion'
  phaseDurations: {
    clonacion: number
    vegetacion: number
    floracion: number
  }
}

function CropProgressTracker({ device }: { device: Device }) {
  const phases: CropProgressPhase[] = [
    { name: 'Clonación', durationDays: device.phaseDurations.clonacion, color: 'bg-blue-500' },
    { name: 'Vegetación', durationDays: device.phaseDurations.vegetacion, color: 'bg-green-500' },
    { name: 'Floración', durationDays: device.phaseDurations.floracion, color: 'bg-orange-500' },
  ]

  const totalDays = phases.reduce((sum, phase) => sum + phase.durationDays, 0)
  
  // Calculate days elapsed since start
  const daysElapsed = Math.floor((Date.now() - device.startDate.getTime()) / (1000 * 60 * 60 * 24))
  const progressPercentage = Math.min((daysElapsed / totalDays) * 100, 100)

  // Calculate phase boundaries
  let cumulativeDays = 0
  const phaseBoundaries = phases.map((phase) => {
    const start = (cumulativeDays / totalDays) * 100
    cumulativeDays += phase.durationDays
    const end = (cumulativeDays / totalDays) * 100
    return { phase: phase.name, start, end, color: phase.color }
  })

  // Get remaining days for current phase
  let remainingDays = totalDays - daysElapsed
  const currentPhaseIndex = phases.findIndex(p => {
    const phaseStart = phases.slice(0, phases.indexOf(p)).reduce((sum, ph) => sum + ph.durationDays, 0)
    const phaseEnd = phaseStart + p.durationDays
    return daysElapsed >= phaseStart && daysElapsed < phaseEnd
  })

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Progreso del Cultivo</p>
              <p className="text-2xl font-bold text-foreground mt-1">{device.name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">{daysElapsed} días</p>
              <p className="text-xs text-muted-foreground">{remainingDays > 0 ? `${remainingDays} restantes` : 'Completado'}</p>
            </div>
          </div>

          {/* Progress Bar with Phase Markers */}
          <div className="space-y-2">
            <div className="h-3 bg-muted/30 rounded-full overflow-hidden border border-border/30">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-green-500 to-orange-500 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* Phase Markers */}
            <div className="relative h-8">
              <div className="absolute inset-x-0 top-0 h-full flex">
                {phaseBoundaries.map((boundary, idx) => (
                  <div
                    key={boundary.phase}
                    className="flex flex-col items-center justify-start flex-1"
                    style={{ width: `${boundary.end - boundary.start}%` }}
                  >
                    {/* Marker line */}
                    <div className={`w-0.5 h-4 ${boundary.color}`} />
                    {/* Phase label */}
                    <p className="text-xs font-semibold text-muted-foreground mt-1 text-center whitespace-nowrap text-[10px]">
                      {boundary.phase}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Phase Info Cards */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            {phases.map((phase, idx) => {
              const isActive = currentPhaseIndex === idx
              const isCompleted = idx < currentPhaseIndex
              return (
                <div
                  key={phase.name}
                  className={`p-2.5 rounded-lg border transition-colors ${
                    isActive
                      ? `${phase.color} border-opacity-100 bg-opacity-20`
                      : isCompleted
                      ? 'border-green-500 border-opacity-50 bg-green-500 bg-opacity-10'
                      : 'border-border/30 bg-muted/20'
                  }`}
                >
                  <p className="text-xs font-semibold text-foreground">{phase.name}</p>
                  <p className="text-xs text-muted-foreground">{phase.durationDays}d</p>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function CropProgressBar() {
  const devicesWithProgress: Device[] = [
    {
      name: 'Indoor 1',
      startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      currentPhase: 'vegetacion',
      phaseDurations: {
        clonacion: 7,
        vegetacion: 21,
        floracion: 56,
      },
    },
    {
      name: 'Sala Clones',
      startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      currentPhase: 'clonacion',
      phaseDurations: {
        clonacion: 14,
        vegetacion: 0,
        floracion: 0,
      },
    },
  ]

  // Filter only devices with crop telemetry (clonacion has progress)
  const devicesInProgress = devicesWithProgress.filter(d => d.phaseDurations.clonacion > 0)

  if (devicesInProgress.length === 0) return null

  return (
    <div className="space-y-3">
      {devicesInProgress.map((device) => (
        <CropProgressTracker key={device.name} device={device} />
      ))}
    </div>
  )
}
