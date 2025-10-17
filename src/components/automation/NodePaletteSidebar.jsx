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
} from "lucide-react";
import PropTypes from "prop-types";

const triggerNodes = [
  {
    icon: Thermometer,
    label: "Temperatura",
    data: {
      label: "Sensor de Temperatura",
      icon: Thermometer,
      sensorType: "temperature",
    },
  },
  {
    icon: Droplets,
    label: "Humedad Aire",
    data: {
      label: "Sensor de Humedad",
      icon: Droplets,
      sensorType: "humidity",
    },
  },
  {
    icon: Sprout,
    label: "Humedad Suelo",
    data: {
      label: "Humedad del Suelo",
      icon: Sprout,
      sensorType: "soilMoisture",
    },
  },
  {
    icon: Wind,
    label: "CO2",
    data: { label: "Sensor de CO2", icon: Wind, sensorType: "co2" },
  },
  {
    icon: FlaskConical,
    label: "pH",
    data: { label: "Sensor de pH", icon: FlaskConical, sensorType: "ph" },
  },
  {
    icon: Clock,
    label: "Horario",
    data: { label: "Horario", icon: Clock, sensorType: "schedule" },
  },
];

const conditionNodes = [
  {
    icon: GitBranch,
    label: "Comparación",
    data: {
      label: "Comparar Valor",
      icon: GitBranch,
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
      conditionType: "range",
      condition: "min - max",
    },
  },
  {
    icon: Clock,
    label: "Horario",
    data: {
      label: "Verificar Horario",
      icon: Clock,
      conditionType: "time",
      condition: "HH:MM",
    },
  },
  {
    icon: Sunrise,
    label: "Amanecer/Atardecer",
    data: {
      label: "Hora Solar",
      icon: Sunrise,
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
      conditionType: "waterDeficit",
      condition: "evaporación - lluvia",
    },
  },
];

const actionNodes = [
  {
    icon: Power,
    label: "Switch ON",
    data: {
      label: "Encender Switch",
      icon: Power,
      action: "Activar",
      actionType: "switch",
    },
  },
  {
    icon: Power,
    label: "Switch OFF",
    data: {
      label: "Apagar Switch",
      icon: Power,
      action: "Desactivar",
      actionType: "switch",
    },
  },
  {
    icon: Zap,
    label: "Toggle",
    data: {
      label: "Alternar Switch",
      icon: Zap,
      action: "Toggle",
      actionType: "toggle",
    },
  },
  {
    icon: Bell,
    label: "Notificación",
    data: {
      label: "Enviar Notificación",
      icon: Bell,
      action: "Notificar",
      actionType: "notification",
    },
  },
  {
    icon: Gauge,
    label: "Control PID",
    data: {
      label: "Control PID",
      icon: Gauge,
      action: "PID",
      actionType: "pid",
    },
  },
  {
    icon: Timer,
    label: "Modo Timer",
    data: {
      label: "Modo Timer",
      icon: Timer,
      action: "Timer",
      actionType: "timer",
    },
  },
  {
    icon: Repeat,
    label: "Modo Ciclos",
    data: {
      label: "Modo Ciclos",
      icon: Repeat,
      action: "Ciclos",
      actionType: "cycles",
    },
  },
  {
    icon: Activity,
    label: "Modo PWM",
    data: {
      label: "Modo PWM",
      icon: Activity,
      action: "PWM",
      actionType: "pwm",
    },
  },
  {
    icon: TrendingUp,
    label: "Modo PI",
    data: {
      label: "Control PI",
      icon: TrendingUp,
      action: "PI",
      actionType: "pi",
    },
  },
  {
    icon: TrendingUp,
    label: "Modo P",
    data: {
      label: "Control P",
      icon: TrendingUp,
      action: "P",
      actionType: "p",
    },
  },
];

function NodePaletteSidebarContent({ onAddNode }) {
  const { setOpen } = useSidebar();

  const handleCategoryClick = () => {
    setOpen(true);
  };

  return (
    <>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-full">
            <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-primary text-primary-foreground">
              <Zap className="h-4 w-4" />
            </div>
            <span className="font-semibold text-sm group-data-[collapsible=icon]:sr-only">
              Paleta de Nodos
            </span>
          </div>
          <SidebarTrigger className="group-data-[collapsible=icon]:absolute group-data-[collapsible=icon]:top-2 group-data-[collapsible=icon]:right-2 group-data-[collapsible=icon]:z-10" />
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
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs uppercase tracking-wider">
                Triggers
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {triggerNodes.map((node, idx) => (
                    <SidebarMenuItem key={idx}>
                      <SidebarMenuButton
                        onClick={() => onAddNode("trigger", node.data)}
                        className="w-full justify-start gap-2 h-auto py-2"
                        tooltip={node.label}
                      >
                        <div className="p-1 rounded bg-chart-1/10">
                          <node.icon className="h-3.5 w-3.5 text-chart-1" />
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

            {/* Conditions Group */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs uppercase tracking-wider">
                Condiciones
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {conditionNodes.map((node, idx) => (
                    <SidebarMenuItem key={idx}>
                      <SidebarMenuButton
                        onClick={() => onAddNode("condition", node.data)}
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

            {/* Actions Group */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs uppercase tracking-wider">
                Acciones
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {actionNodes.map((node, idx) => (
                    <SidebarMenuItem key={idx}>
                      <SidebarMenuButton
                        onClick={() => onAddNode("action", node.data)}
                        className="w-full justify-start gap-2 h-auto py-2"
                        tooltip={node.label}
                      >
                        <div className="p-1 rounded bg-chart-3/10">
                          <node.icon className="h-3.5 w-3.5 text-chart-3" />
                        </div>
                        <span className="text-xs">{node.label}</span>
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
            tooltip="Acciones"
            className="w-8 h-8 p-0 bg-chart-3/10 hover:bg-chart-3/20"
          >
            <Zap className="h-5 w-5 text-chart-3" />
          </SidebarMenuButton>
        </div>
      </SidebarContent>
    </>
  );
}

export function NodePaletteSidebar({ onAddNode }) {
  return (
    <Sidebar side="right" variant="sidebar" collapsible="icon">
      <NodePaletteSidebarContent onAddNode={onAddNode} />
    </Sidebar>
  );
}

NodePaletteSidebarContent.propTypes = {
  onAddNode: PropTypes.func.isRequired,
};

NodePaletteSidebar.propTypes = {
  onAddNode: PropTypes.func.isRequired,
};
