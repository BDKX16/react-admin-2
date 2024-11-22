import React from "react";
import Chart from "@/components/chart";
import { InputCard } from "@/components/InputCard";
import useDevices from "@/hooks/useDevices";
const Dashboard = () => {
  const { selectedDevice } = useDevices();
  return (
    <>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        {Object.keys(selectedDevice)?.length !== 0 &&
          selectedDevice.template.widgets.map((item) => {
            if (
              item.variableFullName === "Temp" ||
              item.variableFullName === "Hum" ||
              item.variableFullName === "Hum suelo"
            ) {
              return (
                <InputCard
                  key={item.variable}
                  widget={item}
                  dId={selectedDevice.dId}
                />
              );
            }
          })}
      </div>
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
        Hola
      </div>
    </>
  );
};

export default Dashboard;
