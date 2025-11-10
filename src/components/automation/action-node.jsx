import { Handle, Position } from "@xyflow/react";
import {
  Play,
  Power,
  Zap,
  Bell,
  Gauge,
  Timer,
  Repeat,
  Activity,
  TrendingUp,
} from "lucide-react";
import PropTypes from "prop-types";

// Función para resolver iconos por nombre
const getIconByName = (iconName) => {
  const iconMap = {
    Power,
    Zap,
    Bell,
    Gauge,
    Timer,
    Repeat,
    Activity,
    TrendingUp,
  };
  return iconMap[iconName] || Play;
};

export function ActionNode({ data }) {
  // Intentar usar el icono directo primero, luego por nombre, luego default
  let IconComponent = Play; // Default

  if (
    data?.icon &&
    (typeof data?.icon === "function" || typeof data?.icon === "object")
  ) {
    IconComponent = data.icon;
  } else if (data?.iconName) {
    IconComponent = getIconByName(data.iconName);
  }

  return (
    <div className="flex flex-col items-center">
      {/* Nodo rectangular con bordes completamente redondeados - color que coincide con minimapa */}
      <div
        className={`w-20 h-12 rounded-full flex items-center justify-center relative shadow-md transition-all duration-300 ${
          data?.isSelected
            ? "border-2 border-green-600 shadow-lg ring-2 ring-green-300 ring-opacity-50"
            : data?.isExecuting
            ? "border-[3px] border-green-500 shadow-xl shadow-green-500/60 ring-4 ring-green-400/40 scale-105 animate-pulse"
            : "border-0 hover:border-2 hover:border-green-500 focus:border-2 focus:border-green-500"
        } ${
          data?.disabled
            ? "opacity-50 cursor-not-allowed bg-gray-200 dark:bg-gray-700"
            : data?.isExecuting
            ? "cursor-pointer bg-green-300 dark:bg-green-700"
            : "cursor-pointer bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800"
        }`}
      >
        <Handle
          type="target"
          position={Position.Left}
          className="!left-[-8px] !w-3 !h-3"
        />
        <IconComponent className="w-5 h-5 text-green-600 dark:text-green-300" />
      </div>

      {/* Título abajo en letra xs */}
      <div className="mt-2 text-xs text-center max-w-24">
        <div className="font-medium truncate">{data?.label}</div>
        {data?.action && (
          <div className="text-muted-foreground truncate">{data?.action}</div>
        )}
      </div>
    </div>
  );
}

ActionNode.propTypes = {
  data: PropTypes.shape({
    label: PropTypes.string,
    icon: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    iconName: PropTypes.string,
    action: PropTypes.string,
    isExecuting: PropTypes.bool,
    isSelected: PropTypes.bool,
    disabled: PropTypes.bool,
  }),
};
