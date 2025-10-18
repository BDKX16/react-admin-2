import { Handle, Position } from "@xyflow/react";
import { GitBranch } from "lucide-react";

export function ConditionNode({ data }) {
  // Handle icon properly - if it's a string or "default", use a default icon
  const IconComponent =
    typeof data?.icon === "function" ? data.icon : GitBranch;

  return (
    <div className="flex flex-col items-center">
      {/* Nodo rombo - color que coincide con minimapa */}
      <div
        className={`w-16 h-16 rotate-45 flex items-center justify-center relative shadow-md transition-all duration-200 ${
          data?.isExecuting
            ? "border-2 border-green-400 shadow-lg"
            : "border-0 hover:border-2 hover:border-yellow-500 focus:border-2 focus:border-yellow-500"
        } ${
          data?.disabled
            ? "opacity-50 cursor-not-allowed bg-gray-200 dark:bg-gray-700"
            : "cursor-pointer bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200 dark:hover:bg-yellow-800"
        }`}
      >
        {/* Handle de entrada - izquierda centrado, aplicamos rotación inversa */}
        <Handle
          type="target"
          position={Position.Left}
          className="!left-[-6px] !top-[50%] !w-3 !h-3 !-rotate-45"
          style={{ transform: "translateY(-50%) rotate(-45deg)" }}
        />
        {/* Dos salidas para condiciones - derecha, aplicamos rotación inversa */}
        <Handle
          type="source"
          position={Position.Right}
          id="true"
          className="!right-[-6px] !top-[25%] !w-3 !h-3 !-rotate-45"
          style={{ transform: "translateY(-50%) rotate(-45deg)" }}
        />
        <Handle
          type="source"
          position={Position.Right}
          id="false"
          className="!right-[-6px] !top-[75%] !w-3 !h-3 !-rotate-45"
          style={{ transform: "translateY(-50%) rotate(-45deg)" }}
        />
        <IconComponent className="w-6 h-6 text-yellow-600 dark:text-yellow-300 -rotate-45" />
      </div>

      {/* Título abajo en letra xs */}
      <div className="mt-2 text-xs text-center max-w-20">
        <div className="font-medium truncate">{data?.label}</div>
        {data?.condition && (
          <div className="text-muted-foreground truncate">
            {data?.condition}
          </div>
        )}
      </div>
    </div>
  );
}
