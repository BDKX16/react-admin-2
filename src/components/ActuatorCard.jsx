import * as React from "react";
import PropTypes from "prop-types";
import {
  Sparkles,
  Power,
  Clock,
  Repeat,
  Zap,
  Cpu,
  Settings,
  Gauge,
  Droplet,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useMqtt from "../hooks/useMqtt";
import useSubscription from "@/hooks/useSubscription";
import { modeToMqttValue, mqttValueToMode } from "@/utils/mqttModeMapper";
import CiclosForm from "./CiclosForm";
import TimersForm from "./TimersForm";
import PWMForm from "./PWMForm";
import PIDForm from "./PIDForm";
import PIForm from "./PIForm";
import ProportionalForm from "./ProportionalForm";
import axios from "axios";
import { enqueueSnackbar } from "notistack";
import { Input } from "@/components/ui/input";

export const ActuatorCard = ({ widget, dId, userId, timer, ciclo }) => {
  const [currentValue, setCurrentValue] = React.useState(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedName, setEditedName] = React.useState(widget.variableFullName || "");
  const [isSaving, setIsSaving] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  const { recived, setSend } = useMqtt();
  const { isPro } = useSubscription();

  // Reset value when device changes
  React.useEffect(() => {
    setCurrentValue(null);
  }, [dId]);

  // Verificar si el usuario es Pro
  const isProPlan = isPro();

  // Obtener los modos disponibles desde el widget o usar valores por defecto
  const availableModes = React.useMemo(() => {
    let modes = [];

    if (widget.mode && Array.isArray(widget.mode) && widget.mode.length > 0) {
      // Convertir los modos del widget a lowercase para consistencia
      modes = widget.mode.map((mode) => mode.toLowerCase());
    } else {
      // Fallback a modos básicos si no hay modos definidos
      modes = ["on", "off", "timers", "ciclos"];
    }

    // Siempre mostrar todos los modos disponibles
    // La restricción se manejará en la UI (deshabilitar) y en sendValue

    // Si no hay modos, al menos permitir on/off
    if (modes.length === 0) {
      modes = ["on", "off", "timers", "ciclos"];
    }

    // Definir el orden específico para mostrar los modos
    const modeOrder = [
      "on",
      "off",
      "timers",
      "ciclos",
      "cicles",
      "pwm",
      "pid",
      "pi",
      "proportional",
      "p",
      "pump",
    ];

    // Ordenar los modos según el orden definido
    const sortedModes = modes.sort((a, b) => {
      const indexA = modeOrder.indexOf(a);
      const indexB = modeOrder.indexOf(b);

      // Si un modo no está en el orden definido, ponerlo al final
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;

      return indexA - indexB;
    });

    return sortedModes;
  }, [widget.mode]);

  // Memoizar el valor mapeado para evitar recálculos innecesarios
  const mappedValue = React.useMemo(() => {
    return mqttValueToMode(currentValue);
  }, [currentValue]);

  React.useEffect(() => {
    if (recived) {
      recived.map((item) => {
        if (item.dId === dId && item.variable === widget.slave) {
          //setConfig({ ...config, value: item.value });
          setCurrentValue(item.value);
        }
      });
    }
  }, [recived, dId, widget.slave]);

  // Función para obtener información de cada modo
  const getModeInfo = (mode) => {
    switch (mode) {
      case "on":
        return {
          title: "Encendido Manual",
          description:
            "El dispositivo permanece encendido hasta que lo cambies manualmente.",
          userExplanation: "Como un interruptor normal - permanece encendido.",
          professionalExplanation: "Estado digital HIGH constante.",
        };
      case "off":
        return {
          title: "Apagado Manual",
          description:
            "El dispositivo permanece apagado hasta que lo cambies manualmente.",
          userExplanation: "Como un interruptor normal - permanece apagado.",
          professionalExplanation: "Estado digital LOW constante.",
        };
      case "timers":
        return {
          title: "Control por Horario",
          description:
            "Se enciende y apaga automáticamente según horarios programados.",
          userExplanation:
            "Como un timer de luces - se enciende y apaga a horas específicas.",
          professionalExplanation:
            "Control programado por RTC con horarios configurables.",
        };
      case "cicles":
        return {
          title: "Control por Ciclos",
          description:
            "Alterna entre encendido y apagado en intervalos regulares.",
          userExplanation:
            "Como un intermitente - se enciende y apaga automáticamente.",
          professionalExplanation:
            "Control cíclico con tiempos ON/OFF configurables.",
        };
      case "ciclos":
        return {
          title: "Control por Ciclos",
          description:
            "Alterna entre encendido y apagado en intervalos regulares.",
          userExplanation:
            "Como un intermitente - se enciende y apaga automáticamente.",
          professionalExplanation:
            "Control cíclico con tiempos ON/OFF configurables.",
        };
      case "pwm":
        return {
          title: "Control PWM",
          description:
            "Controla la intensidad usando modulación por ancho de pulso.",
          userExplanation:
            "Como un dimmer - controla la potencia de 0% a 100%.",
          professionalExplanation:
            "PWM de 8 bits (0-255) con frecuencia configurable.",
        };
      case "pid":
        return {
          title: "Control PID (Avanzado)",
          description:
            "Control automático inteligente que mantiene un valor deseado.",
          userExplanation:
            "Como termostato inteligente - mantiene automáticamente la temperatura.",
          professionalExplanation:
            "Controlador PID con parámetros Kp, Ki, Kd y anti-windup.",
        };
      case "pi":
        return {
          title: "Control PI (Inteligente)",
          description: "Control automático que corrige errores gradualmente.",
          userExplanation:
            "Control inteligente que aprende y mejora automáticamente.",
          professionalExplanation:
            "Controlador PI (sin derivada) para sistemas con ruido.",
        };
      case "proportional":
        return {
          title: "Control Proporcional",
          description: "Control que responde proporcionalmente al error.",
          userExplanation:
            "Control básico que responde más fuerte a errores más grandes.",
          professionalExplanation:
            "Control proporcional simple con ganancia Kp ajustable.",
        };
      case "p":
        return {
          title: "Control Proporcional",
          description: "Control que responde proporcionalmente al error.",
          userExplanation:
            "Control básico que responde más fuerte a errores más grandes.",
          professionalExplanation:
            "Control proporcional simple con ganancia Kp ajustable.",
        };
      case "pump":
        return {
          title: "Control de Bomba",
          description: "Control específico para bombas de agua.",
          userExplanation:
            "Controla bombas con temporizadores y protecciones especiales.",
          professionalExplanation:
            "Control de bomba con protección por sobrecarga y tiempo mínimo/máximo.",
        };
      default:
        return {
          title: "",
          description: "",
          userExplanation: "",
          professionalExplanation: "",
        };
    }
  };

  const mapName = (variableFullName) => {
    switch (variableFullName) {
      case "Temp":
        return "Temperatura";
      case "Hum":
        return "Humedad ambiente";
      case "Hum suelo":
        return "Humedad del suelo";
      default:
        return variableFullName;
    }
  };

  // Función para obtener el icono de cada modo
  const getModeIcon = (mode) => {
    switch (mode) {
      case "on":
      case "off":
        return <Power className="w-3 h-3" />;
      case "timers":
        return <Clock className="w-3 h-3" />;
      case "ciclos":
      case "cicles":
        return <Repeat className="w-3 h-3" />;
      case "pwm":
        return <Zap className="w-3 h-3" />;
      case "pid":
        return <Cpu className="w-3 h-3" />;
      case "pi":
        return <Settings className="w-3 h-3" />;
      case "proportional":
      case "p":
        return <Gauge className="w-3 h-3" />;
      case "pump":
        return <Droplet className="w-3 h-3" />;
      default:
        return <Settings className="w-3 h-3" />;
    }
  };

  // Función para generar los TabsTrigger dinámicamente
  const renderTabTrigger = (mode) => {
    const modeInfo = getModeInfo(mode);
    const displayName =
      {
        on: "On",
        off: "Off",
        timers: "Timer",
        ciclos: "Ciclo",
        cicles: "Ciclo",
        pwm: "PWM",
        pid: "PID",
        pi: "PI",
        p: "P",
        proportional: "P",
        pump: "Pump",
      }[mode] || mode.toUpperCase();

    // Definir modos que requieren Plan Pro
    const proModes = ["pwm", "pid", "pi", "proportional", "p", "pump"];
    const requiresPro = proModes.includes(mode);

    // Casos especiales que no necesitan tooltip
    if (mode === "on" || mode === "off") {
      return (
        <TabsTrigger
          key={mode}
          disabled={currentValue === null}
          value={mode}
          className="text-xs flex items-center gap-1"
        >
          {displayName}
        </TabsTrigger>
      );
    }

    // Para modos Pro deshabilitados, usar un div con tooltip en lugar de TabsTrigger
    if (requiresPro && !isProPlan) {
      return (
        <Tooltip key={mode}>
          <TooltipTrigger asChild>
            <div className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm opacity-50 cursor-not-allowed bg-muted text-muted-foreground">
              <span className="flex items-center gap-1">
                {displayName}
                <Sparkles className="w-3 h-3 text-blue-500" />
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs bg-white border border-gray-200 shadow-lg">
            <div className="p-1">
              <p className="font-semibold text-sm text-gray-900">
                {modeInfo.title}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {modeInfo.userExplanation}
              </p>
              <p className="text-xs text-blue-600 mt-2 font-medium">
                Disponible en Plan Plus
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      );
    }

    // Casos con tooltip (modos habilitados)
    return (
      <TabsTrigger
        key={mode}
        disabled={currentValue === null}
        value={mode}
        className="text-xs flex items-center gap-1"
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex items-center gap-1">
              {displayName}
              {requiresPro && <Sparkles className="w-3 h-3 text-blue-500" />}
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs bg-white border border-gray-200 shadow-lg">
            <div className="p-1">
              <p className="font-semibold text-sm text-gray-900">
                {modeInfo.title}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {modeInfo.userExplanation}
              </p>
              {modeInfo.professionalExplanation && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-green-600">
                    Avanzado:
                  </p>
                  <p className="text-xs text-gray-600">
                    {modeInfo.professionalExplanation}
                  </p>
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TabsTrigger>
    );
  };

  // Función para renderizar las opciones del Select en mobile
  // Función para renderizar las opciones del Select en mobile
  const renderSelectItem = (mode) => {
    const displayNames = {
      on: "Encendido",
      off: "Apagado",
      timers: "⏰ Control por Horario",
      ciclos: "🔄 Control por Ciclos",
      pwm: "⚡ Control PWM",
      pid: "🎯 Control PID (Avanzado)",
      pi: "📊 Control PI (Inteligente)",
      p: "📈 Control Proporcional",
      pump: "💧 Control de Bomba",
    };

    // Definir modos que requieren Plan Pro
    const proModes = ["pwm", "pid", "pi", "proportional", "p", "pump"];
    const requiresPro = proModes.includes(mode);

    let displayText = displayNames[mode] || mode.toUpperCase();

    // Agregar indicador Pro si es necesario
    if (requiresPro) {
      displayText = `${displayText} ✨`;
    }

    return (
      <SelectItem
        key={mode}
        value={mode}
        disabled={requiresPro && !isProPlan}
        className={
          requiresPro && !isProPlan ? "opacity-50 cursor-not-allowed" : ""
        }
      >
        <div className="flex items-center justify-between w-full">
          <span>{displayText}</span>
          {requiresPro && !isProPlan && (
            <span className="text-xs text-blue-600 ml-2">PRO</span>
          )}
        </div>
      </SelectItem>
    );
  };

  const sendValue = async (originalValue) => {
    if (originalValue === null) {
      return;
    }

    // Verificar permisos para funciones Pro
    const proModes = ["pwm", "pid", "pi", "proportional", "p", "pump"];
    if (proModes.includes(originalValue) && !isProPlan) {
      // Mostrar toast de upgrade requerido
      if (typeof window !== "undefined" && window.toast) {
        window.toast.error(
          "Esta función requiere Plan Pro. ¡Actualiza tu plan para acceder a controles avanzados!",
          {
            duration: 4000,
          }
        );
      }
      return; // No procesar el valor
    }

    // Usar el mqttModeMapper para convertir el modo al valor MQTT correcto
    const value = modeToMqttValue(originalValue);
    const toSend = {
      topic: userId + "/" + dId + "/" + widget.variable + "/actdata",
      msg: {
        value: value,
      },
    };

    setSend({ msg: toSend.msg, topic: toSend.topic });
  };

  // Función para guardar el nombre del actuador
  const handleSaveName = async () => {
    if (!editedName.trim() || editedName === widget.variableFullName) {
      setIsEditing(false);
      setEditedName(widget.variableFullName || "");
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");

      // Encontrar el index del actuador en la configuración del dispositivo
      // Necesitamos actualizar solo este actuador específico
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/device-config`,
        {
          dId: dId,
          configs: [
            {
              variable: widget.variable,
              variableFullName: editedName.trim(),
            },
          ],
        },
        {
          headers: {
            token: token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        // Actualizar el widget con el nuevo nombre
        widget.variableFullName = editedName.trim();
        enqueueSnackbar("Nombre actualizado correctamente", {
          variant: "success",
        });
        setIsEditing(false);
      } else {
        throw new Error("Error al actualizar el nombre");
      }
    } catch (error) {
      console.error("Error updating actuator name:", error);
      enqueueSnackbar("Error al actualizar el nombre", { variant: "error" });
      setEditedName(widget.variableFullName || "");
    } finally {
      setIsSaving(false);
    }
  };

  // Manejar tecla Enter para guardar
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSaveName();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditedName(widget.variableFullName || "");
    }
  };

  return (
    <Card 
      className="text-left p-3 md:p-6 relative group" 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Mobile: Compact 1-column layout */}
      <div className="md:hidden">
        {/* Name at top - editable */}
        <div className="text-xs font-bold text-muted-foreground mb-1">
          {isEditing ? (
            <div className="flex items-center gap-1">
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSaveName}
                disabled={isSaving}
                className="h-[1.2em] text-xs py-0 px-2 w-auto min-w-[120px] max-w-[250px]"
                autoFocus
              />
              {isSaving && (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600"></div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span>{mapName(widget.variableFullName)}</span>
              <button
                onClick={() => setIsEditing(true)}
                className="opacity-70 hover:opacity-100 transition-opacity"
              >
                <Pencil className="h-3 w-3 text-green-400/60 drop-shadow-[0_1px_2px_rgba(74,222,128,0.2)] translate-y-[1px]" />
              </button>
            </div>
          )}
        </div>

        {/* Subtitle for PID/PI/P modes showing setpoint */}
        {["pid", "pi", "p", "proportional"].includes(mappedValue) &&
          widget.setpoint && (
            <div className="text-[10px] text-muted-foreground mb-2">
              Setpoint: {widget.setpoint}°
            </div>
          )}

        {!(
          ["pid", "pi", "p", "proportional"].includes(mappedValue) &&
          widget.setpoint
        ) && <div className="mb-2"></div>}

        {/* Grid with mode badge and quick action - 1 column */}
        <div className="flex flex-col gap-2">
          {/* Mode badge - clickable to open Select with form */}
          <Drawer>
            <DrawerTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 h-9"
                disabled={currentValue === null}
              >
                {getModeIcon(mappedValue)}
                <span className="text-xs truncate">
                  {mappedValue === "on"
                    ? "On"
                    : mappedValue === "off"
                    ? "Off"
                    : mappedValue === "timers"
                    ? "Timer"
                    : mappedValue === "ciclos" || mappedValue === "cicles"
                    ? "Ciclo"
                    : mappedValue === "pwm"
                    ? "PWM"
                    : mappedValue === "pid"
                    ? "PID"
                    : mappedValue === "pi"
                    ? "PI"
                    : mappedValue === "proportional" || mappedValue === "p"
                    ? "Propor."
                    : mappedValue === "pump"
                    ? "Pump"
                    : "Modo"}
                </span>
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Modo de Control</DrawerTitle>
              </DrawerHeader>
              <div className="px-4 pb-4 space-y-4">
                {/* Select para cambiar modo */}
                <div className="space-y-2">
                  <Label>Seleccionar Modo</Label>
                  <Select
                    value={mappedValue || ""}
                    onValueChange={(value) => {
                      sendValue(value);
                    }}
                    disabled={currentValue === null}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar modo" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModes.map((mode) => renderSelectItem(mode))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Formulario del modo actual */}
                {mappedValue === "timers" && (
                  <div className="border-t pt-4">
                    <TimersForm
                      userId={userId}
                      timers={widget.timerConfig || timer}
                      dId={dId}
                    />
                  </div>
                )}
                {(mappedValue === "ciclos" || mappedValue === "cicles") && (
                  <div className="border-t pt-4">
                    <CiclosForm
                      userId={userId}
                      ciclo={widget.cicloConfig || ciclo}
                      dId={dId}
                    />
                  </div>
                )}
                {mappedValue === "pwm" && (
                  <div className="border-t pt-4">
                    <PWMForm userId={userId} dId={dId} widget={widget} />
                  </div>
                )}
                {mappedValue === "pid" && (
                  <div className="border-t pt-4">
                    <PIDForm userId={userId} dId={dId} widget={widget} />
                  </div>
                )}
                {mappedValue === "pi" && (
                  <div className="border-t pt-4">
                    <PIForm userId={userId} dId={dId} widget={widget} />
                  </div>
                )}
                {(mappedValue === "proportional" || mappedValue === "p") && (
                  <div className="border-t pt-4">
                    <ProportionalForm
                      userId={userId}
                      dId={dId}
                      widget={widget}
                    />
                  </div>
                )}
              </div>
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button variant="outline">Cerrar</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>

          {/* Quick action button - send true/false directly */}
          <Button
            size="sm"
            variant={
              currentValue === true || currentValue === 1
                ? "default"
                : "secondary"
            }
            className="w-full h-9"
            disabled={currentValue === null}
            onClick={() => {
              // Alternar entre true/false según el estado actual
              const newValue =
                currentValue === true || currentValue === 1 ? false : true;
              const toSend = {
                topic: userId + "/" + dId + "/" + widget.variable + "/actdata",
                msg: { value: newValue },
              };
              setSend({ msg: toSend.msg, topic: toSend.topic });
            }}
          >
            <Power className="w-4 h-4 mr-1" />
            <span className="text-xs">
              {currentValue === true || currentValue === 1
                ? "Apagar"
                : "Encender"}
            </span>
          </Button>
        </div>

        {/* Pro indicator for mobile */}
        {widget.mode &&
          widget.mode.some((mode) =>
            ["pwm", "pid", "pi", "proportional", "p", "pump"].includes(mode)
          ) && (
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              {isProPlan ? (
                <div className="flex items-center justify-center gap-1 text-[10px] text-green-600 dark:text-green-400">
                  <span className="text-green-500">✓</span>
                  <span>Pro activado</span>
                  <Sparkles className="w-2 h-2 text-blue-500" />
                </div>
              ) : (
                <div className="text-center text-[10px] text-muted-foreground">
                  <Sparkles className="w-2 h-2 inline text-blue-500" />{" "}
                  Funciones Pro disponibles
                </div>
              )}
            </div>
          )}
      </div>

      {/* Desktop: Original layout */}
      <div className="hidden md:block">
        <CardHeader className="p-0 pb-3 pl-1">
          <CardTitle className="text-lg md:text-xl lg:text-2xl xl:text-3xl">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isSaving}
                  className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold h-[1.2em] py-0 px-2 w-auto min-w-[200px] max-w-[400px]"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  disabled={isSaving}
                  className="opacity-70 hover:opacity-100 transition-opacity"
                  title="Guardar"
                >
                  {isSaving ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                  ) : (
                    <Check className="h-5 w-5 text-green-600 drop-shadow-[0_1px_2px_rgba(22,163,74,0.3)]" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedName(widget.variableFullName || "");
                  }}
                  disabled={isSaving}
                  className="opacity-70 hover:opacity-100 transition-opacity"
                  title="Cancelar"
                >
                  <X className="h-5 w-5 text-red-600 drop-shadow-[0_1px_2px_rgba(220,38,38,0.3)]" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>{mapName(widget.variableFullName)}</span>
                <button
                  onClick={() => setIsEditing(true)}
                  className={`
                    opacity-0 group-hover:opacity-70 hover:!opacity-100
                    transition-opacity duration-300
                  `}
                  title="Editar nombre"
                >
                  <Pencil className="h-4 w-4 md:h-5 md:w-5 text-green-400/60 drop-shadow-[0_1px_2px_rgba(74,222,128,0.2)] translate-y-[2px]" />
                </button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className=" flex-1 p-0 ">
          <div className="w-full sm:items-center flex flex-row justify-end md:justify-start">
            <div className="flex flex-col space-y-1.5 w-full">
              {/* Desktop: Tabs */}
              <div className="hidden md:block">
                <TooltipProvider>
                  <Tabs
                    className="w-full flex flex-col items-end justify-end md:items-start"
                    value={mappedValue}
                    onValueChange={(e) => {
                      sendValue(e);
                    }}
                  >
                    <TabsList
                      className={`grid w-full gap-1`}
                      style={{
                        gridTemplateColumns: `repeat(${Math.min(
                          availableModes.length,
                          8
                        )}, minmax(0, 1fr))`,
                      }}
                    >
                      {availableModes.map((mode) => renderTabTrigger(mode))}
                    </TabsList>
                    <TabsContent value="on"></TabsContent>
                    <TabsContent value="off"></TabsContent>
                    <TabsContent value="timers" className="w-full">
                      <div className="hidden md:block w-full">
                        <TimersForm
                          userId={userId}
                          timers={widget.timerConfig || timer}
                          dId={dId}
                        />
                      </div>
                      <div className="block md:hidden">
                        <Drawer>
                          <DrawerTrigger asChild>
                            <Button variant="outline">
                              Editar temporizador
                            </Button>
                          </DrawerTrigger>
                          <DrawerContent>
                            <DrawerHeader>
                              <DrawerTitle>Editar temporizador</DrawerTitle>
                            </DrawerHeader>
                            <TimersForm
                              userId={userId}
                              timers={widget.timerConfig || timer}
                              dId={dId}
                            />
                            <DrawerFooter>
                              <DrawerClose asChild>
                                <Button variant="outline">Cerrar</Button>
                              </DrawerClose>
                            </DrawerFooter>
                          </DrawerContent>
                        </Drawer>
                      </div>
                    </TabsContent>
                    <TabsContent value="ciclos" className="w-full">
                      <div className="hidden md:block w-full">
                        <CiclosForm
                          userId={userId}
                          ciclo={widget.cicloConfig || ciclo}
                          dId={dId}
                        />
                      </div>
                      <div className="block md:hidden">
                        <Drawer>
                          <DrawerTrigger asChild>
                            <Button variant="outline">Editar ciclo</Button>
                          </DrawerTrigger>
                          <DrawerContent>
                            <DrawerHeader>
                              <DrawerTitle>Editar ciclo</DrawerTitle>
                            </DrawerHeader>
                            <CiclosForm
                              userId={userId}
                              ciclo={widget.cicloConfig || ciclo}
                              dId={dId}
                            />
                            <DrawerFooter>
                              <DrawerClose asChild>
                                <Button variant="outline">Cerrar</Button>
                              </DrawerClose>
                            </DrawerFooter>
                          </DrawerContent>
                        </Drawer>
                      </div>
                    </TabsContent>
                    <TabsContent value="pwm" className="w-full">
                      <div className="hidden md:block w-full">
                        <PWMForm userId={userId} dId={dId} widget={widget} />
                      </div>
                      <div className="block md:hidden">
                        <Drawer>
                          <DrawerTrigger asChild>
                            <Button variant="outline">Configurar PWM</Button>
                          </DrawerTrigger>
                          <DrawerContent>
                            <DrawerHeader>
                              <DrawerTitle>Configurar PWM</DrawerTitle>
                            </DrawerHeader>
                            <PWMForm
                              userId={userId}
                              dId={dId}
                              widget={widget}
                            />
                            <DrawerFooter>
                              <DrawerClose asChild>
                                <Button variant="outline">Cerrar</Button>
                              </DrawerClose>
                            </DrawerFooter>
                          </DrawerContent>
                        </Drawer>
                      </div>
                    </TabsContent>
                    <TabsContent value="pid" className="w-full">
                      <div className="hidden md:block w-full">
                        <PIDForm userId={userId} dId={dId} widget={widget} />
                      </div>
                      <div className="block md:hidden">
                        <Drawer>
                          <DrawerTrigger asChild>
                            <Button variant="outline">Configurar PID</Button>
                          </DrawerTrigger>
                          <DrawerContent>
                            <DrawerHeader>
                              <DrawerTitle>Configurar PID</DrawerTitle>
                            </DrawerHeader>
                            <PIDForm
                              userId={userId}
                              dId={dId}
                              widget={widget}
                            />
                            <DrawerFooter>
                              <DrawerClose asChild>
                                <Button variant="outline">Cerrar</Button>
                              </DrawerClose>
                            </DrawerFooter>
                          </DrawerContent>
                        </Drawer>
                      </div>
                    </TabsContent>
                    <TabsContent value="pi" className="w-full">
                      <div className="hidden md:block w-full">
                        <PIForm userId={userId} dId={dId} widget={widget} />
                      </div>
                      <div className="block md:hidden">
                        <Drawer>
                          <DrawerTrigger asChild>
                            <Button variant="outline">Configurar PI</Button>
                          </DrawerTrigger>
                          <DrawerContent>
                            <DrawerHeader>
                              <DrawerTitle>Configurar PI</DrawerTitle>
                            </DrawerHeader>
                            <PIForm userId={userId} dId={dId} widget={widget} />
                            <DrawerFooter>
                              <DrawerClose asChild>
                                <Button variant="outline">Cerrar</Button>
                              </DrawerClose>
                            </DrawerFooter>
                          </DrawerContent>
                        </Drawer>
                      </div>
                    </TabsContent>
                    <TabsContent value="proportional" className="w-full">
                      <div className="hidden md:block w-full">
                        <ProportionalForm
                          userId={userId}
                          dId={dId}
                          widget={widget}
                        />
                      </div>
                      <div className="block md:hidden">
                        <Drawer>
                          <DrawerTrigger asChild>
                            <Button variant="outline">
                              Configurar Proporcional
                            </Button>
                          </DrawerTrigger>
                          <DrawerContent>
                            <DrawerHeader>
                              <DrawerTitle>
                                Configurar Control Proporcional
                              </DrawerTitle>
                            </DrawerHeader>
                            <ProportionalForm
                              userId={userId}
                              dId={dId}
                              widget={widget}
                            />
                            <DrawerFooter>
                              <DrawerClose asChild>
                                <Button variant="outline">Cerrar</Button>
                              </DrawerClose>
                            </DrawerFooter>
                          </DrawerContent>
                        </Drawer>
                      </div>
                    </TabsContent>
                    <TabsContent value="p" className="w-full">
                      <div className="hidden md:block w-full">
                        <ProportionalForm
                          userId={userId}
                          dId={dId}
                          widget={widget}
                        />
                      </div>
                      <div className="block md:hidden">
                        <Drawer>
                          <DrawerTrigger asChild>
                            <Button variant="outline">
                              Configurar Proporcional
                            </Button>
                          </DrawerTrigger>
                          <DrawerContent>
                            <DrawerHeader>
                              <DrawerTitle>
                                Configurar Control Proporcional
                              </DrawerTitle>
                            </DrawerHeader>
                            <ProportionalForm
                              userId={userId}
                              dId={dId}
                              widget={widget}
                            />
                            <DrawerFooter>
                              <DrawerClose asChild>
                                <Button variant="outline">Cerrar</Button>
                              </DrawerClose>
                            </DrawerFooter>
                          </DrawerContent>
                        </Drawer>
                      </div>
                    </TabsContent>
                  </Tabs>
                </TooltipProvider>
              </div>

              {/* Mobile: Select */}
              <div className="block md:hidden">
                <div className="space-y-3">
                  <Label htmlFor="mode-select">Modo de Control</Label>
                  <Select
                    value={mappedValue || ""}
                    onValueChange={(value) => sendValue(value)}
                    disabled={currentValue === null}
                  >
                    <SelectTrigger id="mode-select">
                      <SelectValue placeholder="Seleccionar modo" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModes.map((mode) => renderSelectItem(mode))}
                    </SelectContent>
                  </Select>

                  {/* Mobile Content based on selected value */}
                  {mappedValue === "timers" && (
                    <div className="mt-4 space-y-3">
                      <Drawer>
                        <DrawerTrigger asChild>
                          <Button variant="outline" className="w-full">
                            Configurar Temporizador
                          </Button>
                        </DrawerTrigger>
                        <DrawerContent>
                          <DrawerHeader>
                            <DrawerTitle>Editar temporizador</DrawerTitle>
                          </DrawerHeader>
                          <div className="px-4">
                            <TimersForm
                              userId={userId}
                              timers={widget.timerConfig || timer}
                              dId={dId}
                            />
                          </div>
                          <DrawerFooter>
                            <DrawerClose asChild>
                              <Button variant="outline">Cerrar</Button>
                            </DrawerClose>
                          </DrawerFooter>
                        </DrawerContent>
                      </Drawer>
                    </div>
                  )}

                  {(mappedValue === "ciclos" || mappedValue === "cicles") && (
                    <div className="mt-4 space-y-3">
                      <Drawer>
                        <DrawerTrigger asChild>
                          <Button variant="outline" className="w-full">
                            Configurar Ciclos
                          </Button>
                        </DrawerTrigger>
                        <DrawerContent>
                          <DrawerHeader>
                            <DrawerTitle>Editar ciclo</DrawerTitle>
                          </DrawerHeader>
                          <div className="px-4">
                            <CiclosForm
                              userId={userId}
                              ciclo={widget.cicloConfig || ciclo}
                              dId={dId}
                            />
                          </div>
                          <DrawerFooter>
                            <DrawerClose asChild>
                              <Button variant="outline">Cerrar</Button>
                            </DrawerClose>
                          </DrawerFooter>
                        </DrawerContent>
                      </Drawer>
                    </div>
                  )}

                  {mappedValue === "pwm" && (
                    <div className="mt-4 space-y-3">
                      <Drawer>
                        <DrawerTrigger asChild>
                          <Button variant="outline" className="w-full">
                            Configurar PWM
                          </Button>
                        </DrawerTrigger>
                        <DrawerContent>
                          <DrawerHeader>
                            <DrawerTitle>Configurar PWM</DrawerTitle>
                          </DrawerHeader>
                          <div className="px-4">
                            <PWMForm
                              userId={userId}
                              dId={dId}
                              widget={widget}
                            />
                          </div>
                          <DrawerFooter>
                            <DrawerClose asChild>
                              <Button variant="outline">Cerrar</Button>
                            </DrawerClose>
                          </DrawerFooter>
                        </DrawerContent>
                      </Drawer>
                    </div>
                  )}

                  {mappedValue === "pid" && (
                    <div className="mt-4 space-y-3">
                      <Drawer>
                        <DrawerTrigger asChild>
                          <Button variant="outline" className="w-full">
                            Configurar PID
                          </Button>
                        </DrawerTrigger>
                        <DrawerContent>
                          <DrawerHeader>
                            <DrawerTitle>Configurar PID</DrawerTitle>
                          </DrawerHeader>
                          <div className="px-4">
                            <PIDForm
                              userId={userId}
                              dId={dId}
                              widget={widget}
                            />
                          </div>
                          <DrawerFooter>
                            <DrawerClose asChild>
                              <Button variant="outline">Cerrar</Button>
                            </DrawerClose>
                          </DrawerFooter>
                        </DrawerContent>
                      </Drawer>
                    </div>
                  )}

                  {mappedValue === "pi" && (
                    <div className="mt-4 space-y-3">
                      <Drawer>
                        <DrawerTrigger asChild>
                          <Button variant="outline" className="w-full">
                            Configurar PI
                          </Button>
                        </DrawerTrigger>
                        <DrawerContent>
                          <DrawerHeader>
                            <DrawerTitle>Configurar PI</DrawerTitle>
                          </DrawerHeader>
                          <div className="px-4">
                            <PIForm userId={userId} dId={dId} widget={widget} />
                          </div>
                          <DrawerFooter>
                            <DrawerClose asChild>
                              <Button variant="outline">Cerrar</Button>
                            </DrawerClose>
                          </DrawerFooter>
                        </DrawerContent>
                      </Drawer>
                    </div>
                  )}

                  {mappedValue === "proportional" && (
                    <div className="mt-4 space-y-3">
                      <Drawer>
                        <DrawerTrigger asChild>
                          <Button variant="outline" className="w-full">
                            Configurar Proporcional
                          </Button>
                        </DrawerTrigger>
                        <DrawerContent>
                          <DrawerHeader>
                            <DrawerTitle>
                              Configurar Control Proporcional
                            </DrawerTitle>
                          </DrawerHeader>
                          <ProportionalForm
                            userId={userId}
                            dId={dId}
                            widget={widget}
                          />
                          <DrawerFooter>
                            <DrawerClose asChild>
                              <Button variant="outline">Cerrar</Button>
                            </DrawerClose>
                          </DrawerFooter>
                        </DrawerContent>
                      </Drawer>
                    </div>
                  )}

                  {mappedValue === "p" && (
                    <div className="mt-4 space-y-3">
                      <Drawer>
                        <DrawerTrigger asChild>
                          <Button variant="outline" className="w-full">
                            Configurar Proporcional
                          </Button>
                        </DrawerTrigger>
                        <DrawerContent>
                          <DrawerHeader>
                            <DrawerTitle>
                              Configurar Control Proporcional
                            </DrawerTitle>
                          </DrawerHeader>
                          <ProportionalForm
                            userId={userId}
                            dId={dId}
                            widget={widget}
                          />
                          <DrawerFooter>
                            <DrawerClose asChild>
                              <Button variant="outline">Cerrar</Button>
                            </DrawerClose>
                          </DrawerFooter>
                        </DrawerContent>
                      </Drawer>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Indicador de funciones Pro disponibles */}
          {widget.mode &&
            widget.mode.some((mode) =>
              ["pwm", "pid", "pi", "proportional", "p", "pump"].includes(mode)
            ) && (
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                {isProPlan ? (
                  <div className="flex items-center justify-center gap-2 text-xs text-green-600 dark:text-green-400">
                    <span className="text-green-500">✓</span>
                    <span>Funciones Pro activadas</span>
                    <Sparkles className="w-3 h-3 text-blue-500" />
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-xs text-blue-600 dark:text-blue-400 mb-1">
                      <Sparkles className="w-3 h-3 text-blue-500" />
                      <span>Funciones Pro disponibles</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Actualiza a Pro para acceder a controles avanzados
                    </p>
                  </div>
                )}
              </div>
            )}
        </CardContent>
      </div>
    </Card>
  );
};
ActuatorCard.propTypes = {
  widget: PropTypes.shape({
    variable: PropTypes.string.isRequired,
    variableFullName: PropTypes.string.isRequired,
    slave: PropTypes.string.isRequired,
    mode: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  dId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  timer: PropTypes.object.isRequired,
  ciclo: PropTypes.object.isRequired,
};

export default ActuatorCard;
