import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { GitMerge, RefreshCw } from "lucide-react";
import PropTypes from "prop-types";

export const JoinNode = memo(({ data }) => {
  const mode = data.joinMode || "and";
  const timeout = data.timeout || 10;
  const timeoutUnit = data.timeoutUnit || "seconds";

  const getModeLabel = (mode) => {
    const labels = {
      and: "Y (AND)",
      or: "O (OR)",
    };
    return labels[mode] || "Y (AND)";
  };

  const getUnitLabel = (unit) => {
    const labels = {
      seconds: "seg",
      minutes: "min",
      hours: "hrs",
    };
    return labels[unit] || "seg";
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-20 h-16 rounded-lg flex items-center justify-center relative transition-all duration-300 ${
          data?.isSelected
            ? "border-2 border-amber-600 shadow-lg ring-2 ring-amber-300 ring-opacity-50"
            : data?.isExecuting || data?.isWaiting
            ? "!border-[3px] !border-green-500 !shadow-xl !shadow-green-500/60 !ring-4 !ring-green-400/40 !scale-105"
            : "border-0 shadow-md hover:border-2 hover:border-amber-500 focus:border-2 focus:border-amber-500"
        } ${
          data?.disabled
            ? "opacity-50 cursor-not-allowed bg-gray-200 dark:bg-gray-700"
            : data?.isExecuting || data?.isWaiting
            ? "cursor-pointer !bg-green-50 dark:!bg-green-950/30"
            : "cursor-pointer bg-amber-100 dark:bg-amber-900 hover:bg-amber-200 dark:hover:bg-amber-800"
        }`}
      >
        {/* Input Handles - 2 entradas (superior e inferior) */}
        <Handle
          type="target"
          position={Position.Left}
          id="input-top"
          className="!left-[-8px] !top-[30%] !w-3 !h-3 !bg-blue-500"
          title="Entrada Superior"
        />
        <Handle
          type="target"
          position={Position.Left}
          id="input-bottom"
          className="!left-[-8px] !top-[70%] !w-3 !h-3 !bg-blue-500"
          title="Entrada Inferior"
        />

        {/* Output Handles - 2 salidas (true/false o match/no-match) */}
        <Handle
          type="source"
          position={Position.Right}
          id="output-true"
          className="!right-[-8px] !top-[30%] !w-3 !h-3 !bg-green-500"
          title="Salida True"
        />
        <Handle
          type="source"
          position={Position.Right}
          id="output-false"
          className="!right-[-8px] !top-[70%] !w-3 !h-3 !bg-red-500"
          title="Salida False"
        />

        {/* Icono principal o estado de espera */}
        {data?.isWaiting ? (
          <RefreshCw className="w-5 h-5 text-amber-600 dark:text-amber-300 animate-spin" />
        ) : (
          <GitMerge className="w-5 h-5 text-amber-600 dark:text-amber-300" />
        )}
      </div>

      {/* Título abajo en letra xs */}
      <div className="mt-2 text-xs text-center max-w-24">
        <div className="font-medium truncate">{data?.label}</div>
        {mode && (
          <div className="text-muted-foreground truncate text-[10px]">
            {getModeLabel(mode)}
            <br />
            Timeout: {timeout}
            {getUnitLabel(timeoutUnit)}
          </div>
        )}
      </div>
    </div>
  );
});

JoinNode.displayName = "JoinNode";

JoinNode.propTypes = {
  data: PropTypes.shape({
    label: PropTypes.string,
    joinMode: PropTypes.oneOf(["and", "or"]),
    timeout: PropTypes.number,
    timeoutUnit: PropTypes.string,
    topInputType: PropTypes.string,
    topInputVariable: PropTypes.string,
    topComparison: PropTypes.string,
    topComparisonValue: PropTypes.any,
    bottomInputType: PropTypes.string,
    bottomInputVariable: PropTypes.string,
    bottomComparison: PropTypes.string,
    bottomComparisonValue: PropTypes.any,
    isExecuting: PropTypes.bool,
    isSelected: PropTypes.bool,
    disabled: PropTypes.bool,
    executionDirection: PropTypes.string,
    isWaiting: PropTypes.bool,
  }).isRequired,
  selected: PropTypes.bool,
};
