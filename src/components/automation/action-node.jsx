import { Handle, Position } from "@xyflow/react";
import { Play } from "lucide-react";

export function ActionNode({ data }) {
  // Handle icon properly - if it's a string or "default", use a default icon
  const IconComponent = typeof data?.icon === "function" ? data.icon : Play;

  return (
    <div className="flex flex-col items-center">
      {/* Nodo rectangular con bordes completamente redondeados - color que coincide con minimapa */}
      <div
        className={`w-20 h-12 rounded-full flex items-center justify-center relative shadow-md transition-all duration-200 ${
          data?.isExecuting
            ? "border-2 border-green-400 shadow-lg"
            : "border-0 hover:border-2 hover:border-green-500 focus:border-2 focus:border-green-500"
        } ${
          data?.disabled
            ? "opacity-50 cursor-not-allowed bg-gray-200 dark:bg-gray-700"
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
