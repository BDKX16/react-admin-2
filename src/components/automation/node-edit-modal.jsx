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
import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import useDevices from "@/hooks/useDevices";

export function NodeEditModal({ node, open, onClose, onSave, nodes, edges }) {
  const { selectedDevice } = useDevices();
  const [formData, setFormData] = useState({});
  const [detectedInputs, setDetectedInputs] = useState({
    top: null,
    bottom: null,
  });

  // Función para extraer la variable de un nodo según su tipo
  const getVariableFromNode = useCallback(
    (sourceNode) => {
      if (!sourceNode) return null;

      switch (sourceNode.type) {
        case "trigger": {
          // Para nodos trigger, distinguir entre sensores y estado de actuador
          if (sourceNode.data?.sensorType === "actuatorState") {
            // Es un trigger de estado de actuador
            let actuatorModes = sourceNode.data?.actuatorModes || [];

            // Si no hay modos, intentar obtenerlos del widget
            if (
              (!actuatorModes || actuatorModes.length === 0) &&
              selectedDevice?.template?.widgets
            ) {
              const widget = selectedDevice.template.widgets.find(
                (w) => w.variable === sourceNode.data?.targetActuator
              );
              if (widget && widget.mode) {
                actuatorModes = widget.mode;
              }
            }

            return {
              variable: sourceNode.data?.targetActuator || "actuador",
              variableFullName:
                sourceNode.data?.targetActuatorFullName ||
                sourceNode.data?.label ||
                "Actuador",
              nodeType: "actuatorState",
              modes: actuatorModes,
            };
          } else {
            // Es un trigger de sensor normal
            return {
              variable:
                sourceNode.data?.variable ||
                sourceNode.data?.sensorType ||
                "sensor",
              variableFullName:
                sourceNode.data?.variableFullName ||
                sourceNode.data?.label ||
                "Sensor",
              nodeType: "trigger",
              modes: null,
            };
          }
        }
        case "action": {
          // Para nodos action, usar el actuador y sus modos disponibles
          // Buscar el widget en el dispositivo para obtener sus modos
          let availableModes = sourceNode.data?.availableModes || [];

          // Si no hay modos disponibles, intentar obtenerlos del selectedDevice
          if (
            (!availableModes || availableModes.length === 0) &&
            selectedDevice?.template?.widgets
          ) {
            const widget = selectedDevice.template.widgets.find(
              (w) =>
                w.variable ===
                (sourceNode.data?.actuator || sourceNode.data?.targetWidget)
            );
            if (widget && widget.mode) {
              availableModes = widget.mode;
            }
          }

          return {
            variable:
              sourceNode.data?.actuator ||
              sourceNode.data?.targetWidget ||
              sourceNode.data?.variable ||
              "actuador",
            variableFullName:
              sourceNode.data?.actuatorFullName ||
              sourceNode.data?.label ||
              "Actuador",
            nodeType: "action",
            modes: availableModes,
          };
        }
        case "condition":
          // Para nodos condition, usar la variable de comparación
          return {
            variable:
              sourceNode.data?.variable ||
              sourceNode.data?.comparisonVariable ||
              "condicion",
            variableFullName:
              sourceNode.data?.variableFullName ||
              sourceNode.data?.label ||
              "Condición",
            nodeType: "condition",
            modes: null,
          };
        case "join":
          // Para nodos join anidados, indicar que es un join
          return {
            variable: "resultado_join",
            variableFullName: "Resultado Join",
            nodeType: "join",
            modes: null,
          };
        case "delay":
          // Para nodos delay, indicar que es un delay
          return {
            variable: "delay",
            variableFullName: sourceNode.data?.label || "Delay",
            nodeType: "delay",
            modes: null,
          };
        default:
          return {
            variable: sourceNode.data?.label || "entrada",
            variableFullName: sourceNode.data?.label || "Entrada",
            nodeType: "unknown",
            modes: null,
          };
      }
    },
    [selectedDevice]
  );

  // Función para obtener widgets compatibles con el actionType del nodo
  const getCompatibleWidgets = (actionType) => {
    if (!selectedDevice?.template?.widgets || !actionType) {
      return [];
    }

    return selectedDevice.template.widgets.filter(
      (widget) =>
        widget.widgetType === "Switch" &&
        widget.variable && // Asegurar que el widget tenga variable
        widget.variable.trim() !== "" && // Y que no sea string vacío
        widget.mode &&
        Array.isArray(widget.mode) &&
        widget.mode.some(
          (mode) => mode.toLowerCase() === actionType.toLowerCase()
        )
    );
  };

  // Función para obtener widgets de actuadores (no sensores)
  const getActuatorWidgets = () => {
    if (!selectedDevice?.template?.widgets) {
      return [];
    }

    // Filtrar widgets tipo Indicator que NO sean sensores (sensor undefined, null o false)
    return selectedDevice.template.widgets.filter(
      (widget) =>
        widget.widgetType === "Indicator" &&
        !widget.sensor && // sensor es falsy (undefined, null, false)
        widget.variable && // Asegurar que el widget tenga variable
        widget.variable.trim() !== "" // Y que no sea string vacío
    );
  };

  useEffect(() => {
    if (node) {
      let initialFormData = node.data || {};

      // Detectar y establecer la variable para nodos condition
      if (node.type === "condition" && edges && nodes) {
        const incomingEdge = edges.find((edge) => edge.target === node.id);
        if (incomingEdge) {
          const sourceNode = nodes.find((n) => n.id === incomingEdge.source);
          if (sourceNode) {
            const sourceInfo = getVariableFromNode(sourceNode);
            if (sourceInfo) {
              // Solo establecer si no existe o si está undefined
              if (!initialFormData.variable) {
                initialFormData = {
                  ...initialFormData,
                  variable: sourceInfo.variable,
                  variableFullName: sourceInfo.variableFullName,
                };
              }
            }
          }
        }
      }

      setFormData(initialFormData);

      // Detectar inputs conectados para nodos join
      if (node.type === "join" && edges && nodes) {
        const topInput = edges.find(
          (edge) => edge.target === node.id && edge.targetHandle === "input-top"
        );
        const bottomInput = edges.find(
          (edge) =>
            edge.target === node.id && edge.targetHandle === "input-bottom"
        );

        const detectedTop = topInput
          ? getVariableFromNode(nodes.find((n) => n.id === topInput.source))
          : null;
        const detectedBottom = bottomInput
          ? getVariableFromNode(nodes.find((n) => n.id === bottomInput.source))
          : null;

        setDetectedInputs({
          top: detectedTop,
          bottom: detectedBottom,
        });
      }
    }
  }, [node, edges, nodes, getVariableFromNode]);

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
        } else if (formData.sensorType === "actuatorState") {
          // Para triggers de estado de actuador
          const actuatorName =
            formData.targetActuatorFullName ||
            formData.targetActuator ||
            "actuador";

          if (formData.hasCondition && formData.actuatorConditionMode) {
            // Con condición inicial
            const comp = formData.actuatorComparison || "==";
            const val = formData.actuatorComparisonValue || "";
            updatedFormData.condition = `${comp} ${val}`;
            updatedFormData.label = `${actuatorName} ${comp} ${val}`;
          } else {
            // Sin condición, solo escucha cambios
            updatedFormData.condition = "onChange";
            updatedFormData.label = `Cambio en ${actuatorName}`;
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
        // Detectar la variable del nodo trigger conectado
        const incomingEdge = edges.find((edge) => edge.target === node.id);
        if (incomingEdge) {
          const sourceNode = nodes.find((n) => n.id === incomingEdge.source);
          if (sourceNode) {
            const sourceInfo = getVariableFromNode(sourceNode);
            if (sourceInfo) {
              // Guardar la variable del sensor/trigger conectado
              updatedFormData.variable = sourceInfo.variable;
              updatedFormData.variableFullName = sourceInfo.variableFullName;
            }
          }
        }

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

      // Actualizar datos para action nodes
      if (node.type === "action") {
        // Actualizar el label según la configuración
        if (formData.targetWidget) {
          const widget = getCompatibleWidgets(formData.actionType).find(
            (w) => w.variable === formData.targetWidget
          );
          const widgetName =
            widget?.variableFullName || widget?.name || formData.targetWidget;

          switch (formData.actionType) {
            case "pwm":
              updatedFormData.label = `PWM ${widgetName} (${
                formData.pwmValue || "0"
              })`;
              break;
            case "timer":
              updatedFormData.label = `Timer ${widgetName} (${
                formData.timerDuration || "0"
              }s)`;
              break;
            case "cycles":
              updatedFormData.label = `Ciclos ${widgetName} (${
                formData.cycleRepeat || "1"
              }x)`;
              break;
            case "on":
              updatedFormData.label = `Encender ${widgetName}`;
              break;
            case "off":
              updatedFormData.label = `Apagar ${widgetName}`;
              break;
            default:
              updatedFormData.label = `${formData.actionType} ${widgetName}`;
          }
        }

        // Asegurar que el deviceId esté presente
        if (selectedDevice?.dId) {
          updatedFormData.deviceId = selectedDevice.dId;
        }
      }

      // Actualizar datos para delay nodes
      if (node.type === "delay") {
        const duration = formData.delayDuration || 5;
        const unit = formData.delayUnit || "seconds";
        const unitLabels = {
          seconds: "segundos",
          minutes: "minutos",
          hours: "horas",
        };
        updatedFormData.label = `Esperar ${duration} ${
          unitLabels[unit] || "segundos"
        }`;
      }

      // Actualizar datos para join nodes
      if (node.type === "join") {
        const mode = formData.joinMode || "and";
        // Usar variables detectadas automáticamente
        const topVar = detectedInputs.top?.variable || "?";
        const topVarFull = detectedInputs.top?.variableFullName || "?";
        const topComp = formData.topComparison || ">";
        const topVal = formData.topComparisonValue || "?";
        const bottomVar = detectedInputs.bottom?.variable || "?";
        const bottomVarFull = detectedInputs.bottom?.variableFullName || "?";
        const bottomComp = formData.bottomComparison || "==";
        const bottomVal = formData.bottomComparisonValue || "?";

        const modeLabel = mode === "and" ? "Y" : "O";

        // Guardar las variables detectadas en el formData
        updatedFormData.topInputVariable = topVar;
        updatedFormData.topInputVariableFullName = topVarFull;
        updatedFormData.bottomInputVariable = bottomVar;
        updatedFormData.bottomInputVariableFullName = bottomVarFull;

        // Crear label descriptivo usando variableFullName
        updatedFormData.label = `${topVarFull} ${topComp} ${topVal} ${modeLabel} ${bottomVarFull} ${bottomComp} ${bottomVal}`;

        // Asegurar que timeout sea 10 segundos por defecto
        if (!updatedFormData.timeout) {
          updatedFormData.timeout = 10;
          updatedFormData.timeoutUnit = "seconds";
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
              ) : formData.sensorType === "actuatorState" ? (
                /* Trigger de estado de actuador */
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="actuator">Actuador a Escuchar</Label>
                    <Select
                      value={formData.targetActuator || ""}
                      onValueChange={(value) => {
                        const widget = getActuatorWidgets().find(
                          (w) => w.variable === value
                        );
                        setFormData({
                          ...formData,
                          targetActuator: value,
                          targetActuatorFullName:
                            widget?.variableFullName || widget?.name || value,
                          actuatorModes: widget?.mode || [],
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un actuador" />
                      </SelectTrigger>
                      <SelectContent>
                        {getActuatorWidgets().map((widget) => (
                          <SelectItem
                            key={widget.variable}
                            value={widget.variable}
                          >
                            {widget.variableFullName || widget.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Condición opcional */}
                  {formData.targetActuator && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="hasCondition"
                          checked={formData.hasCondition || false}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              hasCondition: e.target.checked,
                            })
                          }
                          className="w-4 h-4"
                        />
                        <Label
                          htmlFor="hasCondition"
                          className="cursor-pointer"
                        >
                          Agregar condición inicial
                        </Label>
                      </div>

                      {formData.hasCondition && (
                        <div className="border rounded-lg p-4 space-y-3 bg-blue-50 dark:bg-blue-950/20">
                          <div className="space-y-2">
                            <Label>Estado/Modo del Actuador</Label>
                            <Select
                              value={formData.actuatorConditionMode || ""}
                              onValueChange={(value) =>
                                setFormData({
                                  ...formData,
                                  actuatorConditionMode: value,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona estado" />
                              </SelectTrigger>
                              <SelectContent>
                                {formData.actuatorModes?.map((mode) => (
                                  <SelectItem key={mode} value={mode}>
                                    {mode}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label>Comparación</Label>
                              <Select
                                value={formData.actuatorComparison || "=="}
                                onValueChange={(value) =>
                                  setFormData({
                                    ...formData,
                                    actuatorComparison: value,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="==">Igual (=)</SelectItem>
                                  <SelectItem value="!=">
                                    Diferente (≠)
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>Valor</Label>
                              <Input
                                placeholder="Ej: on, off, true, false"
                                value={formData.actuatorComparisonValue || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    actuatorComparisonValue: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
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
            <div className="space-y-4">
              {/* Selector de widget/actuador */}
              <div className="space-y-2">
                <Label>Actuador a controlar</Label>
                <Select
                  value={formData.targetWidget || ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, targetWidget: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el actuador" />
                  </SelectTrigger>
                  <SelectContent>
                    {getCompatibleWidgets(formData.actionType).map((widget) => (
                      <SelectItem key={widget.variable} value={widget.variable}>
                        {widget.variableFullName || widget.name}
                      </SelectItem>
                    ))}
                    {getCompatibleWidgets(formData.actionType).length === 0 && (
                      <SelectItem value="no-widgets" disabled>
                        No hay actuadores compatibles con {formData.actionType}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Configuración específica según el tipo de acción */}
              {formData.actionType === "pwm" && (
                <div className="space-y-2">
                  <Label>Valor PWM (0-255)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="255"
                    placeholder="Ej: 128"
                    value={formData.pwmValue || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, pwmValue: e.target.value })
                    }
                  />
                  <div className="text-sm text-muted-foreground">
                    0 = Apagado, 255 = Máxima potencia
                  </div>
                </div>
              )}

              {formData.actionType === "timer" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Duración (segundos)</Label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="Ej: 30"
                      value={formData.timerDuration || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          timerDuration: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Estado durante timer</Label>
                    <Select
                      value={formData.timerState || ""}
                      onValueChange={(value) =>
                        setFormData({ ...formData, timerState: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="on">Encendido</SelectItem>
                        <SelectItem value="off">Apagado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {formData.actionType === "cycles" && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Tiempo ON (seg)</Label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="Ej: 10"
                      value={formData.cycleOnTime || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cycleOnTime: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tiempo OFF (seg)</Label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="Ej: 5"
                      value={formData.cycleOffTime || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cycleOffTime: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Repeticiones</Label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="Ej: 3"
                      value={formData.cycleRepeat || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cycleRepeat: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Delay Configuration */}
          {node.type === "delay" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duración</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Ej: 5"
                    value={formData.delayDuration || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        delayDuration: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unidad</Label>
                  <Select
                    value={formData.delayUnit || "seconds"}
                    onValueChange={(value) =>
                      setFormData({ ...formData, delayUnit: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona unidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="seconds">Segundos</SelectItem>
                      <SelectItem value="minutes">Minutos</SelectItem>
                      <SelectItem value="hours">Horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                El workflow esperará{" "}
                <strong>
                  {formData.delayDuration || 5}{" "}
                  {formData.delayUnit === "minutes"
                    ? "minutos"
                    : formData.delayUnit === "hours"
                    ? "horas"
                    : "segundos"}
                </strong>{" "}
                antes de continuar con el siguiente nodo.
              </div>
            </div>
          )}

          {/* Join Configuration */}
          {node.type === "join" && (
            <div className="space-y-6">
              {/* Modo Lógico */}
              <div className="space-y-2">
                <Label>Modo Lógico</Label>
                <Select
                  value={formData.joinMode || "and"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, joinMode: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona modo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="and">
                      Y (AND) - Ambas condiciones deben cumplirse
                    </SelectItem>
                    <SelectItem value="or">
                      O (OR) - Al menos una condición debe cumplirse
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Entrada Superior */}
              <div className="border rounded-lg p-4 space-y-3 bg-blue-50 dark:bg-blue-950/20">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                  Entrada Superior
                </h4>

                <div className="space-y-2">
                  <Label>
                    {detectedInputs.top?.nodeType === "action" ||
                    detectedInputs.top?.nodeType === "actuatorState"
                      ? "Actuador detectado"
                      : "Variable/Sensor detectada"}
                  </Label>
                  <Input
                    placeholder={
                      detectedInputs.top?.variableFullName || "No conectada"
                    }
                    value={detectedInputs.top?.variableFullName || ""}
                    disabled
                    className="bg-muted"
                  />
                  {!detectedInputs.top && (
                    <p className="text-xs text-amber-600">
                      ⚠️ Conecta un nodo a la entrada superior
                    </p>
                  )}
                </div>

                {/* Solo mostrar configuración si viene de un trigger node */}
                {detectedInputs.top?.nodeType === "trigger" ||
                detectedInputs.top?.nodeType === "action" ||
                detectedInputs.top?.nodeType === "actuatorState" ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>
                          {detectedInputs.top?.nodeType === "action" ||
                          detectedInputs.top?.nodeType === "actuatorState"
                            ? "Modo"
                            : "Comparación"}
                        </Label>
                        {(detectedInputs.top?.nodeType === "action" ||
                          detectedInputs.top?.nodeType === "actuatorState") &&
                        detectedInputs.top?.modes?.length > 0 ? (
                          <Select
                            value={formData.topComparison || ""}
                            onValueChange={(value) =>
                              setFormData({ ...formData, topComparison: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona modo" />
                            </SelectTrigger>
                            <SelectContent>
                              {detectedInputs.top.modes.map((mode) => (
                                <SelectItem key={mode} value={mode}>
                                  {mode}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Select
                            value={formData.topComparison || ">"}
                            onValueChange={(value) =>
                              setFormData({ ...formData, topComparison: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value=">">
                                Mayor que (&gt;)
                              </SelectItem>
                              <SelectItem value="<">
                                Menor que (&lt;)
                              </SelectItem>
                              <SelectItem value=">=">
                                Mayor o igual (≥)
                              </SelectItem>
                              <SelectItem value="<=">
                                Menor o igual (≤)
                              </SelectItem>
                              <SelectItem value="==">Igual (=)</SelectItem>
                              <SelectItem value="!=">Diferente (≠)</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Valor</Label>
                        <Input
                          type={
                            detectedInputs.top?.nodeType === "action" ||
                            detectedInputs.top?.nodeType === "actuatorState"
                              ? "text"
                              : "number"
                          }
                          placeholder={
                            detectedInputs.top?.nodeType === "action" ||
                            detectedInputs.top?.nodeType === "actuatorState"
                              ? "Estado"
                              : "Ej: 22"
                          }
                          value={formData.topComparisonValue || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              topComparisonValue: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Ejemplo:{" "}
                      <strong>
                        {detectedInputs.top?.variableFullName || "variable"}
                      </strong>{" "}
                      {formData.topComparison || ">"}{" "}
                      <strong>{formData.topComparisonValue || "22"}</strong>
                    </div>
                  </>
                ) : (
                  detectedInputs.top && (
                    <div className="text-sm text-muted-foreground border-l-4 border-green-500 pl-3 py-2 bg-green-50 dark:bg-green-950/20">
                      <strong>Activador de rama:</strong> Este nodo se ejecuta
                      cuando la señal llega por esta rama.
                    </div>
                  )
                )}
              </div>

              {/* Entrada Inferior */}
              <div className="border rounded-lg p-4 space-y-3 bg-blue-50 dark:bg-blue-950/20">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                  Entrada Inferior
                </h4>

                <div className="space-y-2">
                  <Label>
                    {detectedInputs.bottom?.nodeType === "action" ||
                    detectedInputs.bottom?.nodeType === "actuatorState"
                      ? "Actuador detectado"
                      : "Variable/Sensor detectada"}
                  </Label>
                  <Input
                    placeholder={
                      detectedInputs.bottom?.variableFullName || "No conectada"
                    }
                    value={detectedInputs.bottom?.variableFullName || ""}
                    disabled
                    className="bg-muted"
                  />
                  {!detectedInputs.bottom && (
                    <p className="text-xs text-amber-600">
                      ⚠️ Conecta un nodo a la entrada inferior
                    </p>
                  )}
                </div>

                {/* Solo mostrar configuración si viene de un trigger node */}
                {detectedInputs.bottom?.nodeType === "trigger" ||
                detectedInputs.bottom?.nodeType === "action" ||
                detectedInputs.bottom?.nodeType === "actuatorState" ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>
                          {detectedInputs.bottom?.nodeType === "action" ||
                          detectedInputs.bottom?.nodeType === "actuatorState"
                            ? "Modo"
                            : "Comparación"}
                        </Label>
                        {(detectedInputs.bottom?.nodeType === "action" ||
                          detectedInputs.bottom?.nodeType ===
                            "actuatorState") &&
                        detectedInputs.bottom?.modes?.length > 0 ? (
                          <Select
                            value={formData.bottomComparison || ""}
                            onValueChange={(value) =>
                              setFormData({
                                ...formData,
                                bottomComparison: value,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona modo" />
                            </SelectTrigger>
                            <SelectContent>
                              {detectedInputs.bottom.modes.map((mode) => (
                                <SelectItem key={mode} value={mode}>
                                  {mode}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Select
                            value={formData.bottomComparison || "=="}
                            onValueChange={(value) =>
                              setFormData({
                                ...formData,
                                bottomComparison: value,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="==">Igual (=)</SelectItem>
                              <SelectItem value="!=">Diferente (≠)</SelectItem>
                              <SelectItem value=">">
                                Mayor que (&gt;)
                              </SelectItem>
                              <SelectItem value="<">
                                Menor que (&lt;)
                              </SelectItem>
                              <SelectItem value=">=">
                                Mayor o igual (≥)
                              </SelectItem>
                              <SelectItem value="<=">
                                Menor o igual (≤)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Valor</Label>
                        <Input
                          type={
                            detectedInputs.bottom?.nodeType === "action" ||
                            detectedInputs.bottom?.nodeType === "actuatorState"
                              ? "text"
                              : "number"
                          }
                          placeholder={
                            detectedInputs.bottom?.nodeType === "action" ||
                            detectedInputs.bottom?.nodeType === "actuatorState"
                              ? "Estado"
                              : "Ej: valor"
                          }
                          value={formData.bottomComparisonValue || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              bottomComparisonValue: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Ejemplo:{" "}
                      <strong>
                        {detectedInputs.bottom?.variableFullName || "variable"}
                      </strong>{" "}
                      {formData.bottomComparison || "=="}{" "}
                      <strong>
                        {formData.bottomComparisonValue || "valor"}
                      </strong>
                    </div>
                  </>
                ) : (
                  detectedInputs.bottom && (
                    <div className="text-sm text-muted-foreground border-l-4 border-green-500 pl-3 py-2 bg-green-50 dark:bg-green-950/20">
                      <strong>Activador de rama:</strong> Este nodo se ejecuta
                      cuando la señal llega por esta rama.
                    </div>
                  )
                )}
              </div>

              {/* Información */}
              <div className="text-sm text-muted-foreground border-l-4 border-amber-500 pl-3 py-2 bg-amber-50 dark:bg-amber-950/20">
                <strong>💡 Cómo funciona:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>
                    <strong>2 Entradas:</strong> Una conexión por cada entrada
                    (superior e inferior)
                  </li>
                  <li>
                    <strong>2 Salidas:</strong> Superior para resultado{" "}
                    <strong>true</strong>, inferior para <strong>false</strong>
                  </li>
                  <li>El nodo espera recibir valores de ambas entradas</li>
                  <li>
                    Evalúa ambas condiciones y aplica la lógica{" "}
                    {formData.joinMode === "and" ? "AND" : "OR"}
                  </li>
                </ul>
              </div>
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
  nodes: PropTypes.array,
  edges: PropTypes.array,
};
