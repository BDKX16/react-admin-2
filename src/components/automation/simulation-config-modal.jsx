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
import { useState, useEffect, useCallback } from "react";

export function SimulationConfigModal({
  open,
  onClose,
  onStart,
  currentConfig,
  selectedDevice,
}) {
  // Inicializar config basado en el template del dispositivo
  const initializeConfig = useCallback(() => {
    const config = {};

    // Obtener widgets de tipo Indicator (sensores)
    if (selectedDevice?.template?.widgets) {
      selectedDevice.template.widgets
        .filter(
          (widget) =>
            widget.widgetType === "Indicator" && widget.sensor === true
        )
        .forEach((widget) => {
          // Usar el ID del widget como clave
          const widgetId = widget.variable;

          // Si existe en currentConfig, usar ese valor, sino valor por defecto
          const existingValue = currentConfig?.[widgetId]?.value;

          config[widgetId] = {
            id: widgetId,
            name: widget.name || widget.variableFullName,
            value: existingValue !== undefined ? existingValue : 50,
            unit: widget.unidad || "",
          };
        });
    }

    return config;
  }, [selectedDevice, currentConfig]);

  const [config, setConfig] = useState(initializeConfig);

  // Reinicializar cuando cambia el dispositivo o se abre el modal
  useEffect(() => {
    if (open) {
      setConfig(initializeConfig());
    }
  }, [open, initializeConfig]);

  const handleStart = () => {
    onStart(config);
    onClose();
  };

  const updateValue = (widgetId, value) => {
    setConfig((prev) => {
      // Asegurar que se preserve toda la información del widget
      const currentWidget = prev[widgetId];
      if (!currentWidget) {
        return prev;
      }

      return {
        ...prev,
        [widgetId]: {
          id: currentWidget.id,
          name: currentWidget.name,
          value: value,
          unit: currentWidget.unit,
        },
      };
    });
  };

  // Obtener los widgets de sensores del dispositivo
  const sensorWidgets =
    selectedDevice?.template?.widgets?.filter(
      (widget) => widget.widgetType === "Indicator" && widget.sensor === true
    ) || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configuración de Simulación</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Configura los valores de los sensores para la simulación
          </p>
        </DialogHeader>
        <div className="space-y-4">
          {sensorWidgets.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No hay sensores configurados en este dispositivo
            </p>
          ) : (
            sensorWidgets.map((widget) => {
              const widgetConfig = config[widget.variable] || {
                id: widget.variable,
                name: widget.name || widget.variableFullName,
                value: 50,
                unit: widget.unidad || "",
              };

              return (
                <div key={widget.variable}>
                  <Label>
                    {widgetConfig.name}: {widgetConfig.value}
                    {widgetConfig.unit}
                  </Label>
                  <Slider
                    value={[widgetConfig.value]}
                    onValueChange={([value]) =>
                      updateValue(widget.variable, value)
                    }
                    min={0}
                    max={100}
                    step={1}
                  />
                </div>
              );
            })
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleStart} disabled={sensorWidgets.length === 0}>
            Iniciar Simulación
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
