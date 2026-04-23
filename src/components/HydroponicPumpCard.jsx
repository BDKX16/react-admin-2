import * as React from "react";
import PropTypes from "prop-types";
import {
  Power,
  Pencil,
  Check,
  X,
  Droplets,
  Wind,
  Moon,
  Sprout,
  Waves,
  Cloud,
  Settings,
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
import axios from "axios";
import { enqueueSnackbar } from "notistack";
import { Input } from "@/components/ui/input";
import HydroModeForm from "./HydroModeForm";

export const HydroponicPumpCard = ({ widget, dId, userId, ciclo }) => {
  const [currentValue, setCurrentValue] = React.useState(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedName, setEditedName] = React.useState(
    widget.variableFullName || ""
  );
  const [isSaving, setIsSaving] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false); // Loading para cambios de preset/tipo
  const [hydroType, setHydroType] = React.useState(widget.hydroType || "nft"); // Tipo de hidroponía
  const [selectedMode, setSelectedMode] = React.useState(widget.hydroMode || "normal"); // Preset del tipo

  const { recived, setSend } = useMqtt();

  // Reset value when device changes
  React.useEffect(() => {
    setCurrentValue(null);
    setHydroType(widget.hydroType || "nft"); // Cargar método guardado
    setSelectedMode(widget.hydroMode || "normal"); // Cargar preset guardado
  }, [dId, widget.hydroType, widget.hydroMode]);

  // Listen to MQTT messages
  React.useEffect(() => {
    if (recived) {
      recived.map((item) => {
        if (item.dId === dId && item.variable === widget.slave) {
          setCurrentValue(item.value);
        }
      });
    }
  }, [recived, dId, widget.slave]);

  // Tipos de hidroponía con sus presets
  const HYDRO_TYPES = {
    nft: {
      name: "NFT (Nutrient Film)",
      icon: Waves,
      description: "Película nutritiva en canales",
      modes: {
        eco: { onMin: 15, offMin: 20 },
        normal: { onMin: 20, offMin: 5 },
        silencio: { onMin: 10, offMin: 25 },
      },
    },
    dwc: {
      name: "DWC (Deep Water)",
      icon: Wind,
      description: "Raíces sumergidas con oxigenación",
      modes: {
        eco: { onMin: 20, offMin: 30 },
        normal: { onMin: 30, offMin: 30 },
        silencio: { onMin: 15, offMin: 40 },
      },
    },
    aeroponico: {
      name: "Aeropónico",
      icon: Cloud,
      description: "Nebulización de raíces",
      modes: {
        eco: { onSec: 20, offMin: 5 },
        normal: { onSec: 30, offMin: 4.5 },
        silencio: { onSec: 15, offMin: 7 },
      },
    },
    torres: {
      name: "Torres/Goteo Vertical",
      icon: Droplets,
      description: "Sistema de goteo en torres",
      modes: {
        eco: { onMin: 10, offMin: 20 },
        normal: { onMin: 15, offMin: 15 },
        silencio: { onMin: 5, offMin: 30 },
      },
    },
  };

  // Modos disponibles (siempre los mismos para cualquier tipo)
  const availableModes = ["eco", "normal", "silencio", "custom"];

  // Obtener preset actual basado en tipo y modo
  const getCurrentPreset = () => {
    if (selectedMode === "custom") {
      return null;
    }

    const typeConfig = HYDRO_TYPES[hydroType];
    if (!typeConfig || !typeConfig.modes[selectedMode]) {
      return null;
    }

    const modeConfig = typeConfig.modes[selectedMode];
    
    // Convertir a segundos
    let tiempoEncendido = 0;
    let tiempoApagado = 0;

    if (modeConfig.onSec !== undefined) {
      tiempoEncendido = modeConfig.onSec;
    } else if (modeConfig.onMin !== undefined) {
      tiempoEncendido = modeConfig.onMin * 60;
    }

    if (modeConfig.offSec !== undefined) {
      tiempoApagado = modeConfig.offSec;
    } else if (modeConfig.offMin !== undefined) {
      tiempoApagado = modeConfig.offMin * 60;
    }

    return { tiempoEncendido, tiempoApagado };
  };

  // Función para enviar valores del preset cuando se cambia de modo
  const sendModePreset = async (mode, type = hydroType) => {
    // Solo enviar si es un preset (no custom)
    if (mode === "custom") {
      return;
    }

    const typeConfig = HYDRO_TYPES[type];
    if (!typeConfig || !typeConfig.modes[mode]) {
      return;
    }

    const modeConfig = typeConfig.modes[mode];
    
    let tiempoEncendidoSeg = 0;
    let tiempoApagadoSeg = 0;

    if (modeConfig.onSec !== undefined) {
      tiempoEncendidoSeg = modeConfig.onSec;
    } else if (modeConfig.onMin !== undefined) {
      tiempoEncendidoSeg = modeConfig.onMin * 60;
    }

    if (modeConfig.offSec !== undefined) {
      tiempoApagadoSeg = modeConfig.offSec;
    } else if (modeConfig.offMin !== undefined) {
      tiempoApagadoSeg = modeConfig.offMin * 60;
    }

    const tiempoTotalSeg = tiempoEncendidoSeg + tiempoApagadoSeg;

    // Send MQTT message
    const toSend = {
      topic: `${userId}/${dId}/${widget.variable}/actdata`,
      msg: {
        value: 5, // Modo Ciclos
        tiempoEncendido: tiempoEncendidoSeg,
        tiempoTotal: tiempoTotalSeg,
      },
    };

    setSend({ msg: toSend.msg, topic: toSend.topic });

    // Guardar en base de datos para que el dispositivo inicie con estos valores al reiniciarse
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_BASE_URL}/ciclo`,
        {
          ciclo: {
            variable: widget.variable,
            tiempoEncendido: tiempoEncendidoSeg,
            tiempoTotal: tiempoTotalSeg,
          },
          dId: dId,
        },
        {
          headers: {
            token: token,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.error("Error guardando ciclo en DB:", error);
    }
  };

  // Manejar cambio de modo
  const handleModeChange = async (newMode) => {
    if (newMode === selectedMode) {
      return; // No hacer nada si es el mismo modo
    }

    setIsUpdating(true);
    try {
      const token = localStorage.getItem("token");

      const response = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/device-config`,
        {
          dId: dId,
          configs: [
            {
              variable: widget.variable,
              hydroMode: newMode,
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
        widget.hydroMode = newMode;
        setSelectedMode(newMode);
        // Enviar preset del modo si no es custom
        sendModePreset(newMode);
      } else {
        throw new Error("Error al actualizar el preset");
      }
    } catch (error) {
      console.error("Error updating hydro mode:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Manejar cambio de tipo de hidroponía
  const handleTypeChange = async (newType) => {
    if (newType === hydroType) {
      return; // No hacer nada si es el mismo tipo
    }

    setIsUpdating(true);
    try {
      const token = localStorage.getItem("token");

      const response = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/device-config`,
        {
          dId: dId,
          configs: [
            {
              variable: widget.variable,
              hydroType: newType,
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
        widget.hydroType = newType;
        setHydroType(newType);
        // Enviar preset del modo actual para el nuevo tipo
        sendModePreset(selectedMode, newType);
      } else {
        throw new Error("Error al actualizar el método");
      }
    } catch (error) {
      console.error("Error updating hydro type:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Obtener icono de cada modo
  const getModeIcon = (mode) => {
    switch (mode) {
      case "eco":
        return <Sprout className="w-3 h-3" />;
      case "normal":
        return <Droplets className="w-3 h-3" />;
      case "silencio":
        return <Moon className="w-3 h-3" />;
      case "custom":
        return <Settings className="w-3 h-3" />;
      default:
        return <Droplets className="w-3 h-3" />;
    }
  };

  // Obtener información de cada modo (genérica, los tiempos vienen del tipo)
  const getModeInfo = (mode) => {
    // Obtener preset específico para este modo
    let preset = null;
    if (mode !== "custom") {
      const typeConfig = HYDRO_TYPES[hydroType];
      if (typeConfig && typeConfig.modes[mode]) {
        const modeConfig = typeConfig.modes[mode];
        
        let tiempoEncendido = 0;
        let tiempoApagado = 0;

        if (modeConfig.onSec !== undefined) {
          tiempoEncendido = modeConfig.onSec;
        } else if (modeConfig.onMin !== undefined) {
          tiempoEncendido = modeConfig.onMin * 60;
        }

        if (modeConfig.offSec !== undefined) {
          tiempoApagado = modeConfig.offSec;
        } else if (modeConfig.offMin !== undefined) {
          tiempoApagado = modeConfig.offMin * 60;
        }

        preset = { tiempoEncendido, tiempoApagado };
      }
    }
    
    // Formatear tiempo para display
    const formatTime = (seconds) => {
      if (seconds >= 60) {
        const minutes = seconds / 60;
        return `${minutes} min`;
      }
      return `${seconds} seg`;
    };

    let detail = "";
    if (preset && mode !== "custom") {
      detail = `${formatTime(preset.tiempoEncendido)} ON / ${formatTime(preset.tiempoApagado)} OFF`;
    }

    switch (mode) {
      case "eco":
        return {
          title: "Modo Eco",
          description: "Ahorro de energía y agua",
          detail: detail || "Ciclo eficiente",
        };
      case "normal":
        return {
          title: "Modo Normal",
          description: "Ciclo estándar equilibrado",
          detail: detail || "Uso balanceado",
        };
      case "silencio":
        return {
          title: "Modo Silencio",
          description: "Bajo ruido nocturno",
          detail: detail || "Ciclos espaciados",
        };
      case "custom":
        return {
          title: "Personalizado",
          description: "Configura tus propios tiempos",
          detail: "Ajuste manual",
        };
      default:
        return {
          title: "Modo",
          description: "",
          detail: "",
        };
    }
  };

  // Renderizar Tab Trigger con tooltip
  const renderTabTrigger = (mode) => {
    const modeInfo = getModeInfo(mode);
    const displayName =
      {
        eco: "Eco",
        normal: "Normal",
        silencio: "Silencio",
        custom: "Custom",
      }[mode] || mode;

    return (
      <TabsTrigger
        key={mode}
        disabled={currentValue === null || isUpdating}
        value={mode}
        className="text-xs flex items-center gap-1"
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex items-center gap-1">
              {getModeIcon(mode)}
              {displayName}
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs bg-white border border-gray-200 shadow-lg">
            <div className="p-1">
              <p className="font-semibold text-sm text-gray-900">
                {modeInfo.title}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {modeInfo.description}
              </p>
              <p className="text-xs text-blue-600 mt-1 font-medium">
                {modeInfo.detail}
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TabsTrigger>
    );
  };

  // Renderizar Select Item para mobile
  const renderSelectItem = (mode) => {
    const modeInfo = getModeInfo(mode);
    const displayName =
      {
        eco: "🌱 Eco - Ahorro de energía",
        normal: "💧 Normal - Ciclo estándar",
        silencio: "🌙 Silencio - Bajo ruido",
        custom: "⚙️ Personalizado",
      }[mode] || mode;

    return (
      <SelectItem key={mode} value={mode}>
        <div className="flex flex-col">
          <span className="font-medium">{displayName}</span>
          <span className="text-xs text-muted-foreground">
            {modeInfo.detail}
          </span>
        </div>
      </SelectItem>
    );
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

      const response = await axios.patch(
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
      {/* Mobile: Compact layout */}
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
              <Droplets className="h-3 w-3 text-blue-500" />
              <span>{widget.variableFullName}</span>
              <button
                onClick={() => setIsEditing(true)}
                className="opacity-70 hover:opacity-100 transition-opacity"
              >
                <Pencil className="h-3 w-3 text-green-400/60 drop-shadow-[0_1px_2px_rgba(74,222,128,0.2)] translate-y-[1px]" />
              </button>
            </div>
          )}
        </div>

        <div className="mb-2"></div>

        {/* Grid with mode badge and quick action */}
        <div className="flex flex-col gap-2">
          {/* Mode badge - clickable to open Select with form */}
          <Drawer>
            <DrawerTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 h-9"
                disabled={currentValue === null || isUpdating}
              >
                {getModeIcon(selectedMode)}
                <span className="text-xs truncate">
                  {getModeInfo(selectedMode).title}
                </span>
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Configuración Hidropónica</DrawerTitle>
              </DrawerHeader>
              <div className="px-4 pb-4 space-y-4">
                {/* Select para tipo de hidroponía */}
                <div className="space-y-2">
                  <Label>Tipo de Hidroponía</Label>
                  <Select
                    value={hydroType}
                    onValueChange={handleTypeChange}
                    disabled={currentValue === null || isUpdating}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(HYDRO_TYPES).map(([key, config]) => {
                        const Icon = config.icon;
                        return (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <div className="flex flex-col">
                                <span className="font-medium">{config.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {config.description}
                                </span>
                              </div>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Select para cambiar modo */}
                <div className="space-y-2">
                  <Label>Preset</Label>
                  <Select
                    value={selectedMode}
                    onValueChange={handleModeChange}
                    disabled={currentValue === null || isUpdating}
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
                <div className="border-t pt-4">
                  <HydroModeForm
                    userId={userId}
                    dId={dId}
                    mode={selectedMode}
                    hydroType={hydroType}
                    variable={widget.variable}
                    currentConfig={ciclo}
                  />
                </div>
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
      </div>

      {/* Desktop: Original layout with tabs */}
      <div className="hidden md:block">
        <CardHeader className="p-0 pb-3 pl-1">
          <div className="flex items-center justify-between gap-4 mb-3">
            <CardTitle className="text-lg md:text-xl lg:text-2xl xl:text-3xl flex-shrink-0">
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
                <Droplets className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />
                <span>{widget.variableFullName}</span>
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
          
          {/* Select tipo de hidroponía a la derecha */}
          <div className="flex-shrink-0 min-w-[200px] max-w-[250px]">
            <Select
              value={hydroType}
              onValueChange={handleTypeChange}
              disabled={currentValue === null || isUpdating}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(HYDRO_TYPES).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{config.name}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <div className="w-full sm:items-center flex flex-row justify-end md:justify-start">
            <div className="flex flex-col space-y-1.5 w-full">
              {/* Desktop: Tabs */}
              <div className="hidden md:block">
                <TooltipProvider>
                  <Tabs
                    className="w-full flex flex-col items-end justify-end md:items-start"
                    value={selectedMode}
                    onValueChange={handleModeChange}
                  >
                    <TabsList
                      className="grid w-full gap-1"
                      style={{
                        gridTemplateColumns: `repeat(${Math.min(
                          availableModes.length,
                          7
                        )}, minmax(0, 1fr))`,
                      }}
                    >
                      {availableModes.map((mode) => renderTabTrigger(mode))}
                    </TabsList>

                    {/* Contenido de cada tab */}
                    {availableModes.map((mode) => (
                      <TabsContent key={mode} value={mode} className="w-full">
                        <div className="w-full">
                          <HydroModeForm
                            userId={userId}
                            dId={dId}
                            mode={mode}
                            hydroType={hydroType}
                            variable={widget.variable}
                            currentConfig={ciclo}
                          />
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

HydroponicPumpCard.propTypes = {
  widget: PropTypes.shape({
    variable: PropTypes.string.isRequired,
    variableFullName: PropTypes.string.isRequired,
    slave: PropTypes.string.isRequired,
    hydroType: PropTypes.string,
    hydroMode: PropTypes.string,
  }).isRequired,
  dId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  ciclo: PropTypes.object.isRequired,
};

export default HydroponicPumpCard;
