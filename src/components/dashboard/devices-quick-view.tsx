'use client'

import { Power, PowerOff, Clock, Zap } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function DevicesQuickView() {
  const devices = [
    {
      id: 1,
      name: 'Luces LED',
      status: 'on',
      mode: 'Timer',
      power: 450,
      temp: '22.8°C',
    },
    {
      id: 2,
      name: 'Extractor',
      status: 'on',
      mode: 'PID',
      power: 120,
      temp: '22.8°C',
    },
    {
      id: 3,
      name: 'Humidificador',
      status: 'off',
      mode: 'PI',
      power: 0,
      temp: '22.8°C',
    },
    {
      id: 4,
      name: 'Calefactor',
      status: 'on',
      mode: 'PID',
      power: 800,
      temp: '22.8°C',
    },
  ]

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Dispositivos</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-max">
        {devices.map((device) => (
          <Card key={device.id} className="p-3 border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-semibold truncate">{device.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{device.temp}</p>
              </div>
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${device.status === 'on' ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>

            <div className="space-y-2">
              {/* Status Badge */}
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-foreground text-xs">
                {device.status === 'on' ? (
                  <Power className="w-3 h-3" />
                ) : (
                  <PowerOff className="w-3 h-3" />
                )}
                <span className="capitalize">{device.status}</span>
              </div>

              {/* Mode Badge */}
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-xs ml-1">
                <Clock className="w-3 h-3" />
                <span className="text-xs">{device.mode}</span>
              </div>

              {/* Power Indicator */}
              {device.power > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                  <Zap className="w-3 h-3" />
                  <span>{device.power}W</span>
                </div>
              )}
            </div>

            {/* Quick Control */}
            <Button
              size="sm"
              variant={device.status === 'on' ? 'default' : 'outline'}
              className="w-full mt-3 h-7 text-xs"
            >
              {device.status === 'on' ? 'Apagar' : 'Encender'}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}
