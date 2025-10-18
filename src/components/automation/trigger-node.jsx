import { Handle, Position } from "@xyflow/react";
import { Zap } from "lucide-react";

export function TriggerNode({ data }) {
  // Handle icon properly - if it's a string or "default", use a default icon
  const IconComponent = typeof data?.icon === "function" ? data.icon : Zap;

  return (
    <div className="flex flex-col items-center">
      {/* Nodo cuadrado con bordes levemente redondeados - color que coincide con minimapa */}
      <div
        className={`w-16 h-16 rounded-lg flex items-center justify-center relative shadow-md transition-all duration-200 ${
          data?.isExecuting
            ? "border-2 border-green-400 shadow-lg"
            : "border-0 hover:border-2 hover:border-blue-500 focus:border-2 focus:border-blue-500"
        } ${
          data?.disabled
            ? "opacity-50 cursor-not-allowed bg-gray-200 dark:bg-gray-700"
            : "cursor-pointer bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800"
        }`}
      >
        <Handle
          type="source"
          position={Position.Right}
          className="!right-[-8px] !w-3 !h-3"
        />
        <IconComponent className="w-6 h-6 text-blue-600 dark:text-blue-300" />
      </div>

      {/* Título abajo en letra xs */}
      <div className="mt-2 text-xs text-center max-w-20">
        <div className="font-medium truncate">{data?.label}</div>
        {data?.value && (
          <div className="text-muted-foreground truncate">{data?.value}</div>
        )}
      </div>
    </div>
  );
}
