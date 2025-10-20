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

export function NodeEditModal({ node, open, onClose, onSave }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (node) {
      setFormData(node.data || {});
    }
  }, [node]);

  const handleSave = () => {
    if (node) {
      let updatedFormData = { ...formData };

      // Actualizar la condición según el tipo de trigger
      if (node.type === "trigger") {
        if (formData.sensorType === "schedule") {
          // Para triggers de horario
          if (formData.hour && formData.minute) {
            updatedFormData.condition = `${formData.hour.padStart(
              2,
              "0"
            )}:${formData.minute.padStart(2, "0")}`;
          }
        } else {
          // Para triggers de sensores
          if (formData.comparison && formData.value) {
            updatedFormData.condition = `${formData.comparison} ${formData.value}`;
          }
        }
      }

      // Actualizar la condición según el tipo de condition node
      if (node.type === "condition") {
        if (formData.conditionType === "comparison") {
          // Para nodos de comparación
          if (formData.comparison && formData.comparisonValue) {
            updatedFormData.condition = `${formData.comparison} ${formData.comparisonValue}`;
            updatedFormData.label = `Comparar ${formData.comparison} ${formData.comparisonValue}`;
          }
        } else if (formData.conditionType === "range") {
          // Para nodos de rango
          if (formData.minValue && formData.maxValue) {
            updatedFormData.condition = `${formData.minValue}-${formData.maxValue}`;
            updatedFormData.label = `Rango ${formData.minValue}-${formData.maxValue}`;
            updatedFormData.minValue = formData.minValue;
            updatedFormData.maxValue = formData.maxValue;
          }
        } else if (formData.conditionType === "timeRange") {
          // Para rango horario
          if (formData.startTime && formData.endTime) {
            updatedFormData.condition = `${formData.startTime}-${formData.endTime}`;
            updatedFormData.label = `Horario ${formData.startTime}-${formData.endTime}`;
            updatedFormData.startTime = formData.startTime;
            updatedFormData.endTime = formData.endTime;
          }
        }
      }

      onSave(node.id, updatedFormData);
      onClose();
    }
  };

  if (!node) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Nodo: {node.data?.label}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Etiqueta</Label>
            <Input
              value={formData.label || ""}
              onChange={(e) =>
                setFormData({ ...formData, label: e.target.value })
              }
            />
          </div>
          {node.type === "trigger" && (
            <>
              {/* Trigger de horario */}
              {formData.sensorType === "schedule" ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hour">Hora</Label>
                    <Select
                      value={formData.hour?.toString() || ""}
                      onValueChange={(value) =>
                        setFormData({ ...formData, hour: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="00" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            {i.toString().padStart(2, "0")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minute">Minuto</Label>
                    <Select
                      value={formData.minute?.toString() || ""}
                      onValueChange={(value) =>
                        setFormData({ ...formData, minute: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="00" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 60 }, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            {i.toString().padStart(2, "0")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                /* Trigger de sensor */
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="comparison">Comparación</Label>
                    <Select
                      value={formData.comparison || ""}
                      onValueChange={(value) =>
                        setFormData({ ...formData, comparison: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona comparación" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value=">">&gt; Mayor que</SelectItem>
                        <SelectItem value="<">&lt; Menor que</SelectItem>
                        <SelectItem value="=">= Igual a</SelectItem>
                        <SelectItem value=">=">&gt;= Mayor o igual</SelectItem>
                        <SelectItem value="<=">&lt;= Menor o igual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="value">
                      Valor {formData.unidad && `(${formData.unidad})`}
                    </Label>
                    <Input
                      id="value"
                      type="number"
                      placeholder="Ingresa el valor"
                      value={formData.value || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, value: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}
            </>
          )}
          {node.type === "condition" && (
            <>
              {/* Nodo de Comparación */}
              {formData.conditionType === "comparison" && (
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
                    <Label htmlFor="value">Valor de comparación</Label>
                    <Input
                      type="number"
                      placeholder="Ingresa el valor"
                      value={formData.comparisonValue || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          comparisonValue: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                    <strong>Condición:</strong> Valor del sensor{" "}
                    {formData.comparison} {formData.comparisonValue || "___"}
                  </div>
                </div>
              )}

              {/* Nodo de Rango */}
              {formData.conditionType === "range" && (
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
                              Si {formData.minValue} ≤ valor ≤{" "}
                              {formData.maxValue}
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
                  )}
                </div>
              )}

              {/* Nodo de Rango Horario */}
              {formData.conditionType === "timeRange" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Hora de inicio</Label>
                      <Input
                        type="time"
                        value={formData.startTime || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            startTime: e.target.value,
                          })
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

                  {/* Visualización del rango horario - siempre visible */}
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
                              {formData.startTime || "08:00"}
                              <br />-<br />
                              {formData.endTime || "18:00"}
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
                              Si la hora actual está entre{" "}
                              {formData.startTime || "08:00"} y{" "}
                              {formData.endTime || "18:00"}
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
                              {formData.startTime || "08:00"} -{" "}
                              {formData.endTime || "18:00"}
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
                          <br />• Rango configurado:{" "}
                          {formData.startTime || "08:00"} -{" "}
                          {formData.endTime || "18:00"}
                          <br />• Resultado:{" "}
                          {(() => {
                            const now = new Date();
                            const current =
                              now.getHours() * 60 + now.getMinutes();
                            const startTime = formData.startTime || "08:00";
                            const endTime = formData.endTime || "18:00";
                            const [startHour, startMin] = startTime
                              .split(":")
                              .map(Number);
                            const [endHour, endMin] = endTime
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
                </div>
              )}

              {/* Condición genérica para otros tipos */}
              {!formData.conditionType && (
                <div>
                  <Label>Condición</Label>
                  <Input
                    value={formData.condition || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, condition: e.target.value })
                    }
                  />
                </div>
              )}
            </>
          )}
          {node.type === "action" && (
            <div>
              <Label>Acción</Label>
              <Select
                value={formData.action || ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, action: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una acción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Encender">Encender</SelectItem>
                  <SelectItem value="Apagar">Apagar</SelectItem>
                  <SelectItem value="Toggle">Alternar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Guardar</Button>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

NodeEditModal.propTypes = {
  node: PropTypes.shape({
    id: PropTypes.string,
    type: PropTypes.string,
    data: PropTypes.object,
  }),
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};
