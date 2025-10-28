import React from "react";
import Chart from "@/components/Chart";
import useDevices from "@/hooks/useDevices";

const ChartDashboard = () => {
  const { selectedDevice } = useDevices();
  return (
    <div className="p-2 md:p-4">
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min overflow-hidden">
        {selectedDevice && <Chart device={selectedDevice} />}
      </div>
    </div>
  );
};

export default ChartDashboard;
