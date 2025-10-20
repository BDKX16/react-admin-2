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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { LocationButton } from "./LocationButton";

export function ConditionNodeModal({
  node,
  open,
  onClose,
  onSave,
  deviceLocation,
  onLocationUpdate,
}) {
  // Nodos que requieren ubicación para funciones climáticas
  const locationRequiredTypes = [
    "solar",
    "dayNight",
    "season",
    "rainForecast",
    "frostRisk",
    "heatIndex",
    "dewPoint",
    "daylightHours",
    "waterDeficit",
  ];

  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (node) {
      setFormData({
        ...node.data,
        comparison: node.data.comparison || ">=",
        value: node.data.value || "",
        condition: node.data.condition || "",
      });
    }
  }, [node]);

  const handleSave = () => {
    if (!node) return;

    let updatedFormData = { ...formData };

    // Configurar la condición según el tipo
    if (node.data?.conditionType) {
      switch (node.data.conditionType) {
        case "solar":
          // Amanecer/Atardecer
          updatedFormData.condition = formData.solarEvent || "amanecer";
          break;
        case "dayNight":
          // Día/Noche
          updatedFormData.condition = formData.dayNightCycle || "día";
          break;
        case "season":
          // Estación
          updatedFormData.condition = formData.season || "primavera";
          break;
        case "rainForecast":
          // Pronóstico de lluvia - necesita comparación y valor
          if (formData.comparison && formData.value) {
            updatedFormData.condition = `${formData.comparison} ${formData.value}%`;
          }
          break;
        case "frostRisk":
          // Riesgo de helada - temperatura mínima
          if (formData.comparison && formData.value) {
            updatedFormData.condition = `${formData.comparison} ${formData.value}°C`;
          }
          break;
        case "heatIndex":
          // Índice de calor
          if (formData.comparison && formData.value) {
            updatedFormData.condition = `${formData.comparison} ${formData.value}°C`;
          }
          break;
        case "dewPoint":
          // Punto de rocío
          if (formData.comparison && formData.value) {
            updatedFormData.condition = `${formData.comparison} ${formData.value}°C`;
          }
          break;
        case "daylightHours":
          // Horas de luz
          if (formData.comparison && formData.value) {
            updatedFormData.condition = `${formData.comparison} ${formData.value}h`;
          }
          break;
        case "waterDeficit":
          // Déficit hídrico
          if (formData.comparison && formData.value) {
            updatedFormData.condition = `${formData.comparison} ${formData.value}mm`;
          }
          break;
        case "comparison":
          // Nodo de comparación
          if (formData.comparison && formData.comparisonValue) {
            updatedFormData.condition = `${formData.comparison} ${formData.comparisonValue}`;
            updatedFormData.label = `Comparar ${formData.comparison} ${formData.comparisonValue}`;
          }
          break;
        case "range":
          // Nodo de rango
          if (formData.minValue && formData.maxValue) {
            updatedFormData.condition = `${formData.minValue}-${formData.maxValue}`;
            updatedFormData.label = `Rango ${formData.minValue}-${formData.maxValue}`;
            updatedFormData.minValue = formData.minValue;
            updatedFormData.maxValue = formData.maxValue;
          }
          break;
        case "timeRange":
          // Rango horario
          if (formData.startTime && formData.endTime) {
            updatedFormData.condition = `${formData.startTime}-${formData.endTime}`;
            updatedFormData.label = `Horario ${formData.startTime}-${formData.endTime}`;
            updatedFormData.startTime = formData.startTime;
            updatedFormData.endTime = formData.endTime;
          }
          break;
        default:
          // Para otros tipos de condiciones
          break;
      }
    }

    onSave({
      ...node,
      data: updatedFormData,
    });
  };

  const renderConditionInputs = () => {
    if (!node?.data?.conditionType) return null;

    switch (node.data.conditionType) {
      case "solar":
        return (
          <div className="space-y-2">
            <Label>Evento Solar</Label>
            <Select
              value={formData.solarEvent || ""}
              onValueChange={(value) =>
                setFormData({ ...formData, solarEvent: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="amanecer">Amanecer</SelectItem>
                <SelectItem value="atardecer">Atardecer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case "dayNight":
        return (
          <div className="space-y-2">
            <Label>Ciclo</Label>
            <Select
              value={formData.dayNightCycle || ""}
              onValueChange={(value) =>
                setFormData({ ...formData, dayNightCycle: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar ciclo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="día">Día</SelectItem>
                <SelectItem value="noche">Noche</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case "season":
        return (
          <div className="space-y-2">
            <Label>Estación</Label>
            <Select
              value={formData.season || ""}
              onValueChange={(value) =>
                setFormData({ ...formData, season: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primavera">Primavera</SelectItem>
                <SelectItem value="verano">Verano</SelectItem>
                <SelectItem value="otoño">Otoño</SelectItem>
                <SelectItem value="invierno">Invierno</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case "rainForecast":
      case "frostRisk":
      case "heatIndex":
      case "dewPoint":
      case "daylightHours":
      case "waterDeficit":
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Comparación</Label>
              <Select
                value={formData.comparison || ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, comparison: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=">">Mayor que (&gt;)</SelectItem>
                  <SelectItem value=">=">Mayor o igual (&gt;=)</SelectItem>
                  <SelectItem value="<">Menor que (&lt;)</SelectItem>
                  <SelectItem value="<=">Menor o igual (&lt;=)</SelectItem>
                  <SelectItem value="=">Igual (=)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Valor {getUnitLabel(node.data.conditionType)}</Label>
              <Input
                type="number"
                value={formData.value || ""}
                onChange={(e) =>
                  setFormData({ ...formData, value: e.target.value })
                }
                placeholder="Ingrese valor"
              />
            </div>
          </div>
        );

      case "comparison":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="comparison">Comparador</Label>
              <Select
                value={formData.comparison || ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, comparison: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona comparador" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=">">&gt; Mayor que</SelectItem>
                  <SelectItem value="<">&lt; Menor que</SelectItem>
                  <SelectItem value="=">= Igual a</SelectItem>
                  <SelectItem value=">=">&gt;= Mayor o igual</SelectItem>
                  <SelectItem value="<=">&lt;= Menor o igual</SelectItem>
                  <SelectItem value="!=">&ne; Diferente de</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="comparisonValue">Valor de comparación</Label>
              <Input
                type="number"
                placeholder="Ingresa el valor"
                value={formData.comparisonValue || ""}
                onChange={(e) =>
                  setFormData({ ...formData, comparisonValue: e.target.value })
                }
              />
            </div>
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
              <strong>Condición:</strong> Valor del sensor {formData.comparison}{" "}
              {formData.comparisonValue || "___"}
            </div>
          </div>
        );

      case "range":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minValue">Valor mínimo</Label>
                <Input
                  type="number"
                  placeholder="Ej: 20"
                  value={formData.minValue || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, minValue: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxValue">Valor máximo</Label>
                <Input
                  type="number"
                  placeholder="Ej: 30"
                  value={formData.maxValue || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, maxValue: e.target.value })
                  }
                />
              </div>
            </div>
            {/* Visualización mejorada del rango - siempre visible */}
            <div className="space-y-4">
              <Label>Comportamiento del Nodo de Rango</Label>
              <div className="bg-muted p-5 rounded-lg border-2 border-dashed">
                {/* Escala visual del rango */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span className="font-mono">0</span>
                    <span className="font-bold text-foreground">
                      Rango Objetivo
                    </span>
                    <span className="font-mono">100</span>
                  </div>

                  <div className="relative h-6 bg-background rounded-lg overflow-hidden border-2">
                    {/* Zona fuera del rango (izquierda) */}
                    <div
                      className="absolute left-0 top-0 bg-red-200 h-full"
                      style={{ width: "25%" }}
                    ></div>

                    {/* Zona dentro del rango */}
                    <div
                      className="absolute bg-green-400 h-full flex items-center justify-center"
                      style={{ left: "25%", width: "50%" }}
                    >
                      <span className="text-xs font-bold text-white">
                        DENTRO
                      </span>
                    </div>

                    {/* Zona fuera del rango (derecha) */}
                    <div
                      className="absolute right-0 top-0 bg-red-200 h-full"
                      style={{ width: "25%" }}
                    ></div>

                    {/* Marcadores de los valores */}
                    <div className="absolute left-[25%] top-0 w-0.5 h-full bg-green-600"></div>
                    <div className="absolute right-[25%] top-0 w-0.5 h-full bg-green-600"></div>
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-mono text-green-600">
                      ↑ {formData.minValue}
                    </span>
                    <span className="text-xs font-mono text-green-600">
                      ↑ {formData.maxValue}
                    </span>
                  </div>
                </div>

                {/* Explicación de las salidas */}
                <div className="grid grid-cols-1 gap-3">
                  <div className="text-sm text-center font-medium text-muted-foreground mb-2">
                    🔄 Salidas del Nodo
                  </div>

                  {/* Salida TRUE */}
                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="font-medium text-green-700 dark:text-green-300">
                        Salida Superior (Verdadero)
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-400">
                        Si {formData.minValue} ≤ valor ≤ {formData.maxValue}
                      </div>
                    </div>
                  </div>

                  {/* Salida FALSE */}
                  <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="font-medium text-red-700 dark:text-red-300">
                        Salida Inferior (Falso)
                      </div>
                      <div className="text-sm text-red-600 dark:text-red-400">
                        Si valor &lt; {formData.minValue} o valor &gt;{" "}
                        {formData.maxValue}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ejemplo práctico */}
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                    💡 Ejemplo Práctico:
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">
                    • Sensor envía temperatura = 25°C
                    <br />• Rango configurado: {formData.minValue} -{" "}
                    {formData.maxValue}
                    <br />• Resultado:{" "}
                    {25 >= formData.minValue && 25 <= formData.maxValue
                      ? "✅ Salida Superior (dentro del rango)"
                      : "❌ Salida Inferior (fuera del rango)"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "timeRange":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Hora de inicio</Label>
                <Input
                  type="time"
                  value={formData.startTime || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">Hora de fin</Label>
                <Input
                  type="time"
                  value={formData.endTime || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Visualización del rango horario */}
            {formData.startTime && formData.endTime && (
              <div className="space-y-4">
                <Label>Comportamiento del Rango Horario</Label>
                <div className="bg-muted p-5 rounded-lg border-2 border-dashed">
                  {/* Reloj visual */}
                  <div className="mb-4 text-center">
                    <div className="inline-block relative w-32 h-32 border-4 border-blue-300 rounded-full bg-blue-50 dark:bg-blue-900/20">
                      <div className="absolute inset-2 border-2 border-blue-200 rounded-full">
                        <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-0.5 h-3 bg-blue-600"></div>
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-0.5 h-3 bg-blue-600"></div>
                        <div className="absolute left-1 top-1/2 transform -translate-y-1/2 w-3 h-0.5 bg-blue-600"></div>
                        <div className="absolute right-1 top-1/2 transform -translate-y-1/2 w-3 h-0.5 bg-blue-600"></div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-xs font-bold text-blue-700 dark:text-blue-300">
                          {formData.startTime}
                          <br />-<br />
                          {formData.endTime}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Explicación de las salidas */}
                  <div className="grid grid-cols-1 gap-3">
                    <div className="text-sm text-center font-medium text-muted-foreground mb-2">
                      🔄 Salidas del Nodo
                    </div>

                    {/* Salida TRUE */}
                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="font-medium text-green-700 dark:text-green-300">
                          Salida Superior (Verdadero)
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-400">
                          Si la hora actual está entre {formData.startTime} y{" "}
                          {formData.endTime}
                        </div>
                      </div>
                    </div>

                    {/* Salida FALSE */}
                    <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="font-medium text-red-700 dark:text-red-300">
                          Salida Inferior (Falso)
                        </div>
                        <div className="text-sm text-red-600 dark:text-red-400">
                          Si la hora actual está fuera del rango{" "}
                          {formData.startTime} - {formData.endTime}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ejemplo práctico */}
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                      💡 Ejemplo Práctico:
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">
                      • Hora actual:{" "}
                      {new Date().toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      <br />• Rango configurado: {formData.startTime} -{" "}
                      {formData.endTime}
                      <br />• Resultado:{" "}
                      {(() => {
                        const now = new Date();
                        const current = now.getHours() * 60 + now.getMinutes();
                        const [startHour, startMin] = formData.startTime
                          .split(":")
                          .map(Number);
                        const [endHour, endMin] = formData.endTime
                          .split(":")
                          .map(Number);
                        const start = startHour * 60 + startMin;
                        const end = endHour * 60 + endMin;

                        const isInRange =
                          start <= end
                            ? current >= start && current <= end
                            : current >= start || current <= end;

                        return isInRange
                          ? "✅ Salida Superior (dentro del horario)"
                          : "❌ Salida Inferior (fuera del horario)";
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="space-y-2">
            <Label>Condición</Label>
            <Input
              value={formData.condition || ""}
              onChange={(e) =>
                setFormData({ ...formData, condition: e.target.value })
              }
              placeholder="Configurar condición"
            />
          </div>
        );
    }
  };

  const getUnitLabel = (conditionType) => {
    switch (conditionType) {
      case "rainForecast":
        return "(%)";
      case "frostRisk":
      case "heatIndex":
      case "dewPoint":
        return "(°C)";
      case "daylightHours":
        return "(horas)";
      case "waterDeficit":
        return "(mm)";
      default:
        return "";
    }
  };

  const isValidForm = () => {
    if (!node?.data?.conditionType) return false;

    switch (node.data.conditionType) {
      case "solar":
        return !!formData.solarEvent;
      case "dayNight":
        return !!formData.dayNightCycle;
      case "season":
        return !!formData.season;
      case "rainForecast":
      case "frostRisk":
      case "heatIndex":
      case "dewPoint":
      case "daylightHours":
      case "waterDeficit":
        return !!(formData.comparison && formData.value);
      default:
        return !!formData.condition;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Configurar {node?.data?.label || "Condición"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="label">Etiqueta del Nodo</Label>
            <Input
              id="label"
              value={formData.label || ""}
              onChange={(e) =>
                setFormData({ ...formData, label: e.target.value })
              }
              placeholder="Nombre del nodo"
            />
          </div>

          {renderConditionInputs()}

          {formData.condition && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Condición configurada:</p>
              <p className="text-sm text-muted-foreground">
                {formData.condition}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            {/* Botón de ubicación a la izquierda para nodos que la requieren */}
            {node?.data?.conditionType &&
              locationRequiredTypes.includes(node.data.conditionType) && (
                <LocationButton
                  location={deviceLocation}
                  onClick={onLocationUpdate}
                  className=""
                />
              )}

            {/* Botones de acción a la derecha */}
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={!isValidForm()}>
                Guardar
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

ConditionNodeModal.propTypes = {
  node: PropTypes.object,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  deviceLocation: PropTypes.object,
  onLocationUpdate: PropTypes.func.isRequired,
};
