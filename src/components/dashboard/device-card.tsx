'use client'

import { useState } from 'react'
import { Power, PowerOff, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface DeviceCardProps {
  name: string
  status: 'on' | 'off'
  mode: string
  power: number
  controlOptions: string[]
}

export default function DeviceCard({ name, status, mode, power, controlOptions }: DeviceCardProps) {
  const [currentStatus, setCurrentStatus] = useState(status)
  const [currentMode, setCurrentMode] = useState(mode)

  return (
    <div className="p-4 rounded-lg border border-border bg-card hover:bg-card/80 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">{name}</h3>
          <p className={`text-xs font-medium mt-1 ${currentStatus === 'on' ? 'text-chart-1' : 'text-muted-foreground'}`}>
            {currentStatus === 'on' ? 'Activo' : 'Inactivo'}
          </p>
        </div>
        <div className={`p-2 rounded-lg ${currentStatus === 'on' ? 'bg-chart-1/10 text-chart-1' : 'bg-muted text-muted-foreground'}`}>
          {currentStatus === 'on' ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
        </div>
      </div>

      {/* Power Consumption */}
      <div className="mb-4 pb-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground flex items-center gap-2">
            <Zap className="w-3 h-3" />
            Consumo
          </span>
          <span className="text-sm font-semibold text-foreground">{power}W</span>
        </div>
      </div>

      {/* Mode & Controls */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Modo</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs h-7">
                {currentMode}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>Seleccionar Modo</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {controlOptions.map((option) => (
                <DropdownMenuItem
                  key={option}
                  onClick={() => setCurrentMode(option)}
                  className={currentMode === option ? 'bg-primary/10' : ''}
                >
                  {option}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* On/Off Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant={currentStatus === 'on' ? 'default' : 'outline'}
            onClick={() => setCurrentStatus('on')}
            className="h-8 text-xs"
          >
            On
          </Button>
          <Button
            size="sm"
            variant={currentStatus === 'off' ? 'destructive' : 'outline'}
            onClick={() => setCurrentStatus('off')}
            className="h-8 text-xs"
          >
            Off
          </Button>
        </div>
      </div>
    </div>
  )
}
