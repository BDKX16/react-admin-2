import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Thermometer,
  Droplets,
  Wind,
  GitBranch,
  Clock,
  Zap,
  Power,
  Bell,
  Plus,
  Sprout,
  Sun,
  CloudRain,
  Sunrise,
  Moon,
  Calendar,
  CloudSnow,
  Leaf,
  Gauge,
  FlaskConical,
  Timer,
  Repeat,
  Activity,
  TrendingUp,
  Crown,
  Hourglass,
  GitMerge,
} from "lucide-react";
import PropTypes from "prop-types";
import { useMemo, useState } from "react";
import { LocationConfigModal } from "./LocationConfigModal";
import { ConditionNodeModal } from "./ConditionNodeModal";
import { updateDeviceLocation } from "@/services/public";

// Función para mapear iconos de widgets a componentes Lucide
const getWidgetIcon = (iconName) => {
  const iconMap = {
    thermometer: Thermometer,
    droplets: Droplets,
    wind: Wind,
    sprout: Sprout,
    "flask-conical": FlaskConical,
    gauge: Gauge,
    leaf: Leaf,
    sun: Sun,
    "cloud-rain": CloudRain,
    activity: Activity,
    "trending-up": TrendingUp,
    zap: Zap,
    power: Power,
    bell: Bell,
    timer: Timer,
    repeat: Repeat,
  };
  return iconMap[iconName] || Gauge; // Usar Gauge como default
};

const conditionNodes = [
  {
    icon: GitBranch,
    label: "Comparación",
    data: {
      label: "Comparar Valor",
      icon: GitBranch,
      iconName: "GitBranch",
      conditionType: "comparison",
      condition: "> < = !=",
    },
  },
  {
    icon: GitBranch,
    label: "Rango",
    data: {
      label: "En Rango",
      icon: GitBranch,
      iconName: "GitBranch",
      conditionType: "range",
      condition: "entre X y Y",
    },
  },
  {
    icon: Clock,
    label: "Rango Horario",
    data: {
      label: "Rango de Horas",
      icon: Clock,
      iconName: "Clock",
      conditionType: "timeRange",
      condition: "Entre HH:MM y HH:MM",
    },
  },
  {
    icon: Sunrise,
    label: "Amanecer/Atardecer",
    data: {
      label: "Hora Solar",
      icon: Sunrise,
      iconName: "Sunrise",
      conditionType: "solar",
      condition: "sunrise/sunset",
    },
  },
  {
    icon: Moon,
    label: "Día/Noche",
    data: {
      label: "Ciclo Diurno",
      icon: Moon,
      iconName: "Moon",
      conditionType: "dayNight",
      condition: "day/night",
    },
  },
  {
    icon: Calendar,
    label: "Estación",
    data: {
      label: "Estación del Año",
      icon: Calendar,
      iconName: "Calendar",
      conditionType: "season",
      condition: "primavera/verano/otoño/invierno",
    },
  },
  {
    icon: CloudRain,
    label: "Pronóstico Lluvia",
    data: {
      label: "Probabilidad de Lluvia",
      icon: CloudRain,
      iconName: "CloudRain",
      conditionType: "rainForecast",
      condition: "> 50%",
    },
  },
  {
    icon: CloudSnow,
    label: "Riesgo Helada",
    data: {
      label: "Alerta de Helada",
      icon: CloudSnow,
      iconName: "CloudSnow",
      conditionType: "frostRisk",
      condition: "< 2°C",
    },
  },
  {
    icon: Thermometer,
    label: "Índice de Calor",
    data: {
      label: "Sensación Térmica",
      icon: Thermometer,
      iconName: "Thermometer",
      conditionType: "heatIndex",
      condition: "temp + humedad",
    },
  },
  {
    icon: Leaf,
    label: "Punto de Rocío",
    data: {
      label: "Punto de Rocío",
      icon: Leaf,
      iconName: "Leaf",
      conditionType: "dewPoint",
      condition: "condensación",
    },
  },
  {
    icon: Sun,
    label: "Horas de Luz",
    data: {
      label: "Duración del Día",
      icon: Sun,
      iconName: "Sun",
      conditionType: "daylightHours",
      condition: "> 12h",
    },
  },
  {
    icon: Sprout,
    label: "Déficit Hídrico",
    data: {
      label: "Necesidad de Riego",
      icon: Sprout,
      iconName: "Sprout",
      conditionType: "waterDeficit",
      condition: "evaporación - lluvia",
    },
  },
];

// Nodos de utilidad
const utilityNodes = [
  {
    type: "delay",
    icon: Clock,
    label: "Espera/Delay",
    data: {
      label: "Esperar 5 segundos",
      icon: Clock,
      iconName: "Clock",
      delayDuration: 5,
      delayUnit: "seconds",
    },
  },
  {
    type: "join",
    icon: GitMerge,
    label: "Join/Unir",
    data: {
      label: "Llave Lógica",
      icon: GitMerge,
      iconName: "GitMerge",
      joinMode: "and", // 'and' o 'or'
      timeout: 10, // Timeout en segundos (por defecto 10)
      timeoutUnit: "seconds",
      topInputType: null,
      topInputVariable: null,
      topComparison: ">",
      topComparisonValue: null,
      bottomInputType: null,
      bottomInputVariable: null,
      bottomComparison: "==",
      bottomComparisonValue: null,
    },
  },
];

function NodePaletteSidebarContent({
  onAddNode,
  selectedDevice,
  isProUser,
  userId,
}) {
  const { setOpen, open } = useSidebar();

  // Estados para los modales
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [conditionModalOpen, setConditionModalOpen] = useState(false);
  const [pendingNode, setPendingNode] = useState(null);

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

  // Verificar si el dispositivo tiene ubicación configurada
  const hasLocation =
    selectedDevice?.location &&
    selectedDevice.location.latitude &&
    selectedDevice.location.longitude;

  // Función para manejar el click en nodos de condición
  const handleConditionNodeClick = (nodeData) => {
    // Verificar si el nodo requiere ubicación
    if (locationRequiredTypes.includes(nodeData.conditionType)) {
      if (!hasLocation) {
        // Si no tiene ubicación, abrir modal de ubicación
        setPendingNode({ type: "condition", data: nodeData });
        setLocationModalOpen(true);
        return;
      }
    }

    // Si no requiere ubicación o ya la tiene, abrir modal de configuración
    setPendingNode({ type: "condition", data: nodeData });
    setConditionModalOpen(true);
  };

  // Función para guardar la ubicación
  const handleLocationSave = async (locationData) => {
    try {
      // Usar el servicio para actualizar la ubicación del dispositivo
      const { call } = updateDeviceLocation(selectedDevice.dId, {
        name: locationData.name,
        state: locationData.state,
        country: locationData.country,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        displayName: locationData.displayName,
      });

      const response = await call;

      if (response.error) {
        throw new Error("Error guardando ubicación");
      }

      // Actualizar el dispositivo seleccionado localmente
      if (selectedDevice) {
        selectedDevice.location = {
          name: locationData.name,
          state: locationData.state,
          country: locationData.country,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          displayName: locationData.displayName,
        };
      }

      setLocationModalOpen(false);

      // Después de guardar la ubicación, abrir el modal de configuración del nodo
      if (pendingNode) {
        setConditionModalOpen(true);
      }
    } catch (error) {
      console.error("Error guardando ubicación:", error);
      // Aquí podrías mostrar un toast o notificación de error
    }
  };

  // Función para guardar la configuración del nodo de condición
  const handleConditionSave = (nodeConfig) => {
    onAddNode("condition", nodeConfig.data);
    setConditionModalOpen(false);
    setPendingNode(null);
  };
  // Generar nodos trigger dinámicos basados en widgets del selectedDevice
  const dynamicTriggerNodes = useMemo(() => {
    if (!selectedDevice?.template?.widgets) {
      return [];
    }

    // Filtrar widgets de tipo "Indicator" para crear triggers
    const indicatorWidgets = selectedDevice.template.widgets.filter(
      (widget) => widget.widgetType === "Indicator" && widget.sensor === true
    );

    return indicatorWidgets.map((widget) => {
      const nodeData = {
        label: `Sensor ${widget.name || widget.variableFullName}`,
        icon: getWidgetIcon(widget.icon),
        iconName: widget.icon, // Nombre original del icono
        sensorType: widget.variable,
        variable: widget.variable,
        variableFullName: widget.name,
        unidad: widget.unidad,
        deviceId: selectedDevice.dId,
        dId: selectedDevice.dId, // Agregar dId también como backup
      };

      return {
        icon: getWidgetIcon(widget.icon),
        label: widget.name || widget.variableFullName,
        data: nodeData,
      };
    });
  }, [selectedDevice, userId]);

  // Combinar nodos trigger estáticos con dinámicos
  const allTriggerNodes = useMemo(() => {
    const staticTriggers = [
      {
        icon: Clock,
        label: "Horario",
        data: {
          label: "Horario",
          icon: Clock,
          iconName: "Clock", // Agregar nombre del icono como string
          sensorType: "schedule",
          variable: "schedule",
        },
      },
      {
        icon: Power,
        label: "Estado Actuador",
        data: {
          label: "Estado Actuador",
          icon: Power,
          iconName: "Power",
          sensorType: "actuatorState",
          variable: "actuatorState",
        },
      },
    ];

    const result = [...dynamicTriggerNodes, ...staticTriggers];

    return result;
  }, [dynamicTriggerNodes]);

  // Generar nodos de acción dinámicos basados en modos disponibles
  const dynamicActionNodes = useMemo(() => {
    if (!selectedDevice?.template?.widgets) {
      return [];
    }

    // Filtrar widgets de tipo "Button" o "Switch" para obtener modos
    const actionWidgets = selectedDevice.template.widgets.filter(
      (widget) =>
        widget.widgetType === "Button" || widget.widgetType === "Switch"
    );

    // Recopilar todos los modos únicos disponibles en los widgets
    const availableModes = new Set();
    actionWidgets.forEach((widget) => {
      if (widget.mode && Array.isArray(widget.mode)) {
        widget.mode.forEach((mode) => {
          availableModes.add(mode);
        });
      }
    });
    // Mapeo de modos a configuraciones de nodos
    const modeToNodeConfig = {
      On: {
        icon: Power,
        iconName: "Power",
        label: "Encender",
        action: "Activar",
        actionType: "on",
        requiresPro: false,
      },
      Off: {
        icon: Power,
        iconName: "Power",
        label: "Apagar",
        action: "Desactivar",
        actionType: "off",
        requiresPro: false,
      },
      Timers: {
        icon: Timer,
        iconName: "Timer",
        label: "Modo Timer",
        action: "Timer",
        actionType: "timer",
        requiresPro: false,
      },
      Ciclos: {
        icon: Repeat,
        iconName: "Repeat",
        label: "Modo Ciclos",
        action: "Ciclos",
        actionType: "cycles",
        requiresPro: false,
      },
      PID: {
        icon: Gauge,
        iconName: "Gauge",
        label: "Control PID",
        action: "PID",
        actionType: "pid",
        requiresPro: true,
      },
      PWM: {
        icon: Activity,
        iconName: "Activity",
        label: "Modo PWM",
        action: "PWM",
        actionType: "pwm",
        requiresPro: true,
      },
      PI: {
        icon: TrendingUp,
        iconName: "TrendingUp",
        label: "Control PI",
        action: "PI",
        actionType: "pi",
        requiresPro: true,
      },
      P: {
        icon: TrendingUp,
        iconName: "TrendingUp",
        label: "Control P",
        action: "P",
        actionType: "p",
        requiresPro: true,
      },
    };

    // Generar nodos solo para los modos disponibles
    const generatedNodes = [];
    availableModes.forEach((mode) => {
      const config = modeToNodeConfig[mode];
      if (config) {
        const isDisabled = config.requiresPro && !isProUser;

        generatedNodes.push({
          icon: config.icon,
          label: config.label,
          data: {
            label: config.label,
            icon: config.icon,
            iconName: config.iconName,
            action: config.action,
            actionType: config.actionType,
            deviceId: selectedDevice.dId,
            availableModes: Array.from(availableModes),
            requiresPro: config.requiresPro && !isProUser,
          },
          disabled: isDisabled,
        });
      }
    });

    return generatedNodes;
  }, [selectedDevice, isProUser]);

  // Combinar nodos de acción dinámicos con notificación estática
  const allActionNodes = useMemo(() => {
    // Solo incluir notificación de los nodos estáticos
    const staticNotification = {
      icon: Bell,
      label: "Notificación",
      data: {
        label: "Enviar Notificación",
        icon: Bell,
        iconName: "Bell",
        action: "Notificar",
        actionType: "notification",
      },
    };

    return [...dynamicActionNodes, staticNotification];
  }, [dynamicActionNodes]);

  const handleCategoryClick = () => {
    setOpen(true);
  };
  return (
    <div className="flex flex-col h-full" data-tour="node-palette">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-full">
            <div
              className="flex h-6 w-6 min-w-6 flex-shrink-0 items-center justify-center rounded-sm bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90 transition-colors group-data-[collapsible=open]:cursor-default"
              onClick={() => {
                setOpen(!open);
              }}
            >
              <Zap className="h-4 w-4" />
            </div>
            <span className="font-semibold text-sm group-data-[collapsible=icon]:sr-only">
              Paleta de Nodos
            </span>
          </div>
          <SidebarTrigger className="group-data-[collapsible=icon]:hidden" />
        </div>
        <p className="px-2 pb-2 text-xs text-sidebar-foreground/60 group-data-[collapsible=icon]:sr-only">
          Arrastra o haz clic para agregar
        </p>
      </SidebarHeader>
      <SidebarContent>
        {/* Vista expandida - contenido completo */}
        <div className="group-data-[collapsible=icon]:hidden">
          <ScrollArea className="flex-1">
            {/* Triggers Group */}
            <SidebarGroup data-tour="trigger-nodes">
              <SidebarGroupLabel className="text-xs uppercase tracking-wider">
                Triggers
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {allTriggerNodes.map((node, idx) => (
                    <SidebarMenuItem key={idx}>
                      <SidebarMenuButton
                        onClick={() => {
                          onAddNode("trigger", node.data);
                        }}
                        className="w-full justify-start gap-2 h-auto py-2"
                        tooltip={node.label}
                        disabled={node.disabled}
                      >
                        <div className="p-1 rounded bg-chart-1/10">
                          <node.icon className="h-3.5 w-3.5 text-chart-1" />
                        </div>
                        <span className="text-xs">{node.label}</span>
                        {node.disabled && (
                          <Crown className="h-3 w-3 ml-auto text-yellow-500" />
                        )}
                        <Plus className="h-3 w-3 ml-auto opacity-50" />
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator />

            {/* Conditions Group */}
            <SidebarGroup data-tour="condition-nodes">
              <SidebarGroupLabel className="text-xs uppercase tracking-wider">
                Condiciones
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {conditionNodes.map((node, idx) => (
                    <SidebarMenuItem key={idx}>
                      <SidebarMenuButton
                        onClick={() => handleConditionNodeClick(node.data)}
                        className="w-full justify-start gap-2 h-auto py-2"
                        tooltip={node.label}
                      >
                        <div className="p-1 rounded bg-chart-2/10">
                          <node.icon className="h-3.5 w-3.5 text-chart-2" />
                        </div>
                        <span className="text-xs">{node.label}</span>
                        <Plus className="h-3 w-3 ml-auto opacity-50" />
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator />

            {/* Utilities Group */}
            <SidebarGroup data-tour="utility-nodes">
              <SidebarGroupLabel className="text-xs uppercase tracking-wider">
                Utilidades
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {utilityNodes.map((node, idx) => (
                    <SidebarMenuItem key={idx}>
                      <SidebarMenuButton
                        onClick={() => onAddNode(node.type, node.data)}
                        className="w-full justify-start gap-2 h-auto py-2"
                        tooltip={node.label}
                      >
                        <div className="p-1 rounded bg-chart-4/10">
                          <node.icon className="h-3.5 w-3.5 text-chart-4" />
                        </div>
                        <span className="text-xs">{node.label}</span>
                        <Plus className="h-3 w-3 ml-auto opacity-50" />
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator />

            {/* Actions Group */}
            <SidebarGroup data-tour="action-nodes">
              <SidebarGroupLabel className="text-xs uppercase tracking-wider">
                Acciones
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {allActionNodes.map((node, idx) => (
                    <SidebarMenuItem key={idx}>
                      <SidebarMenuButton
                        onClick={() => onAddNode("action", node.data)}
                        className="w-full justify-start gap-2 h-auto py-2"
                        tooltip={node.label}
                        disabled={node.disabled}
                      >
                        <div className="p-1 rounded bg-chart-3/10">
                          <node.icon className="h-3.5 w-3.5 text-chart-3" />
                        </div>
                        <span className="text-xs">{node.label}</span>
                        {node.disabled && (
                          <Crown className="h-3 w-3 ml-auto text-yellow-500" />
                        )}
                        <Plus className="h-3 w-3 ml-auto opacity-50" />
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </ScrollArea>
        </div>

        {/* Vista colapsada - solo iconos de categorías clickeables para expandir */}
        <div className="hidden group-data-[collapsible=icon]:flex flex-col items-center py-4 space-y-4">
          <SidebarMenuButton
            onClick={handleCategoryClick}
            tooltip="Triggers"
            className="w-8 h-8 p-0 bg-chart-1/10 hover:bg-chart-1/20"
          >
            <Thermometer className="h-5 w-5 text-chart-1" />
          </SidebarMenuButton>

          <SidebarMenuButton
            onClick={handleCategoryClick}
            tooltip="Condiciones"
            className="w-8 h-8 p-0 bg-chart-2/10 hover:bg-chart-2/20"
          >
            <GitBranch className="h-5 w-5 text-chart-2" />
          </SidebarMenuButton>

          <SidebarMenuButton
            onClick={handleCategoryClick}
            tooltip="Utilidades"
            className="w-8 h-8 p-0 bg-chart-4/10 hover:bg-chart-4/20"
          >
            <Clock className="h-5 w-5 text-chart-4" />
          </SidebarMenuButton>

          <SidebarMenuButton
            onClick={handleCategoryClick}
            tooltip="Acciones"
            className="w-8 h-8 p-0 bg-chart-3/10 hover:bg-chart-3/20"
          >
            <Zap className="h-5 w-5 text-chart-3" />
          </SidebarMenuButton>
        </div>
      </SidebarContent>

      {/* Modales */}
      <LocationConfigModal
        open={locationModalOpen}
        onClose={() => {
          setLocationModalOpen(false);
          setPendingNode(null);
        }}
        onSave={handleLocationSave}
        deviceName={selectedDevice?.name}
        hasExistingLocation={hasLocation ? true : false}
      />

      <ConditionNodeModal
        node={pendingNode}
        open={conditionModalOpen}
        onClose={() => {
          setConditionModalOpen(false);
          setPendingNode(null);
        }}
        onSave={handleConditionSave}
        deviceLocation={selectedDevice?.location}
        onLocationUpdate={() => {
          setConditionModalOpen(false);
          setLocationModalOpen(true);
        }}
      />
    </div>
  );
}

export function NodePaletteSidebar({
  onAddNode,
  selectedDevice,
  isProUser,
  userId,
}) {
  return (
    <Sidebar side="right" variant="sidebar" collapsible="icon">
      <NodePaletteSidebarContent
        onAddNode={onAddNode}
        selectedDevice={selectedDevice}
        isProUser={isProUser}
        userId={userId}
      />
    </Sidebar>
  );
}

NodePaletteSidebarContent.propTypes = {
  onAddNode: PropTypes.func.isRequired,
  selectedDevice: PropTypes.object,
  isProUser: PropTypes.bool,
  userId: PropTypes.string,
};

NodePaletteSidebar.propTypes = {
  onAddNode: PropTypes.func.isRequired,
  selectedDevice: PropTypes.object,
  isProUser: PropTypes.bool,
  userId: PropTypes.string,
};
