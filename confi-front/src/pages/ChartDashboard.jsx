import React from "react";
import Chart from "@/components/chart";

const ChartDashboard = () => {
  return (
    <div>
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
        <Chart />
      </div>
    </div>
  );
};

export default ChartDashboard;
