import { Handle, Position } from "@xyflow/react";
import { Card } from "@/components/ui/card";
import { GitBranch } from "lucide-react";

export function ConditionNode({ data }) {
  // Handle icon properly - if it's a string or "default", use a default icon
  const IconComponent =
    typeof data?.icon === "function" ? data.icon : GitBranch;

  return (
    <Card
      className={`p-3 min-w-[150px] border-2 ${
        data?.isExecuting ? "border-green-400 shadow-lg" : "border-yellow-400"
      }`}
    >
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <div className="flex items-center gap-2">
        <IconComponent className="w-4 h-4 text-yellow-600" />
        <div>
          <div className="font-medium text-sm">{data?.label}</div>
          <div className="text-xs text-muted-foreground">{data?.condition}</div>
        </div>
      </div>
    </Card>
  );
}
