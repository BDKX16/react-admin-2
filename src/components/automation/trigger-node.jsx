import { Handle, Position } from "@xyflow/react";
import { Card } from "@/components/ui/card";
import { Zap } from "lucide-react";

export function TriggerNode({ data }) {
  // Handle icon properly - if it's a string or "default", use a default icon
  const IconComponent = typeof data?.icon === "function" ? data.icon : Zap;

  return (
    <Card
      className={`p-3 min-w-[150px] border-2 ${
        data?.isExecuting ? "border-green-400 shadow-lg" : "border-blue-400"
      }`}
    >
      <Handle type="source" position={Position.Right} />
      <div className="flex items-center gap-2">
        <IconComponent className="w-4 h-4 text-blue-600" />
        <div>
          <div className="font-medium text-sm">{data?.label}</div>
          <div className="text-xs text-muted-foreground">{data?.value}</div>
        </div>
      </div>
    </Card>
  );
}
