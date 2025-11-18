'use client'

import { Power, PowerOff, Clock, Zap, Cpu, Gauge } from 'lucide-react'
import DeviceCard from './device-card'

export default function DeviceStatusGrid() {
  const devices = [
    {
      name: 'Luces LED',
      status: 'on',
      mode: 'Timer',
      power: 450,
      controlOptions: ['On', 'Off', 'Timer', 'Ciclo', 'PWM', 'PID', 'PI', 'P'],
    },
    {
      name: 'Extractor',
      status: 'on',
      mode: 'PID',
      power: 120,
      controlOptions: ['On', 'Off', 'Timer', 'Ciclo', 'PWM', 'PID', 'PI', 'P'],
    },
    {
      name: 'Humidificador',
      status: 'off',
      mode: 'PI',
      power: 0,
      controlOptions: ['On', 'Off', 'Timer', 'Ciclo', 'PWM', 'PID', 'PI', 'P'],
    },
    {
      name: 'Calefactor',
      status: 'on',
      mode: 'PID',
      power: 800,
      controlOptions: ['On', 'Off', 'Timer', 'Ciclo', 'PWM', 'PID', 'PI', 'P'],
    },
  ]

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-4">Estado de Dispositivos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {devices.map((device) => (
          <DeviceCard key={device.name} {...device} />
        ))}
      </div>
    </div>
  )
}
