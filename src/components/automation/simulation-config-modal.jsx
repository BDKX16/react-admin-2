import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

export function SimulationConfigModal({
  open,
  onClose,
  onStart,
  currentConfig,
}) {
  const [config, setConfig] = useState(
    currentConfig || {
      temperature: 25,
      humidity: 60,
      soilMoisture: 50,
      co2: 400,
      ph: 7.0,
      hour: 14,
      minute: 30,
      season: "spring",
    }
  );

  const handleStart = () => {
    onStart(config);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configuración de Simulación</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Temperatura: {config.temperature}°C</Label>
            <Slider
              value={[config.temperature]}
              onValueChange={([value]) =>
                setConfig({ ...config, temperature: value })
              }
              min={0}
              max={50}
              step={1}
            />
          </div>
          <div>
            <Label>Humedad: {config.humidity}%</Label>
            <Slider
              value={[config.humidity]}
              onValueChange={([value]) =>
                setConfig({ ...config, humidity: value })
              }
              min={0}
              max={100}
              step={1}
            />
          </div>
          <div>
            <Label>Humedad del Suelo: {config.soilMoisture}%</Label>
            <Slider
              value={[config.soilMoisture]}
              onValueChange={([value]) =>
                setConfig({ ...config, soilMoisture: value })
              }
              min={0}
              max={100}
              step={1}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Hora</Label>
              <Input
                type="number"
                value={config.hour}
                onChange={(e) =>
                  setConfig({ ...config, hour: parseInt(e.target.value) || 0 })
                }
                min={0}
                max={23}
              />
            </div>
            <div>
              <Label>Minuto</Label>
              <Input
                type="number"
                value={config.minute}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    minute: parseInt(e.target.value) || 0,
                  })
                }
                min={0}
                max={59}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleStart}>Iniciar Simulación</Button>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
