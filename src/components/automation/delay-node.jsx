import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Clock } from "lucide-react";
import PropTypes from "prop-types";

export const DelayNode = memo(({ data }) => {
  const duration = data.delayDuration || 5;
  const unit = data.delayUnit || "seconds";

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
        className={`w-20 h-12 rounded-full flex items-center justify-center relative shadow-md transition-all duration-300 ${
          data?.isSelected
            ? "border-2 border-amber-600 shadow-lg ring-2 ring-amber-300 ring-opacity-50"
            : data?.isExecuting
            ? "border-[3px] border-green-500 shadow-xl shadow-green-500/60 ring-4 ring-green-400/40 scale-105"
            : "border-0 hover:border-2 hover:border-amber-500 focus:border-2 focus:border-amber-500"
        } ${
          data?.disabled
            ? "opacity-50 cursor-not-allowed bg-gray-200 dark:bg-gray-700"
            : data?.isExecuting
            ? "cursor-pointer bg-green-50 dark:bg-green-950/30"
            : "cursor-pointer bg-amber-100 dark:bg-amber-900 hover:bg-amber-200 dark:hover:bg-amber-800"
        }`}
      >
        {/* Input Handle */}
        <Handle
          type="target"
          position={Position.Left}
          className="!left-[-8px] !w-3 !h-3"
        />

        {/* Output Handle */}
        <Handle
          type="source"
          position={Position.Right}
          className="!right-[-8px] !w-3 !h-3"
        />
        <Clock className="w-5 h-5 text-amber-600 dark:text-amber-300" />
      </div>

      {/* Título abajo en letra xs */}
      <div className="mt-2 text-xs text-center max-w-24">
        <div className="font-medium truncate">{data?.label}</div>
        {duration && (
          <div className="text-muted-foreground truncate">
            Esperar {duration} {getUnitLabel(unit)}
          </div>
        )}
      </div>
    </div>
  );
});

DelayNode.displayName = "DelayNode";

DelayNode.propTypes = {
  data: PropTypes.shape({
    label: PropTypes.string,
    delayDuration: PropTypes.number,
    delayUnit: PropTypes.string,
    isExecuting: PropTypes.bool,
    isSelected: PropTypes.bool,
    disabled: PropTypes.bool,
  }).isRequired,
  selected: PropTypes.bool,
};
