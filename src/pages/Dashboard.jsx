import React from "react";
import Chart from "@/components/chart";
import { InputCard } from "@/components/InputCard";
import useDevices from "@/hooks/useDevices";

import ActuatorCard from "../components/ActuatorCard";
import useAuth from "../hooks/useAuth";

const Dashboard = () => {
  const { selectedDevice } = useDevices();
  const { auth } = useAuth();
  console.log(selectedDevice);
  const calculateActuatorsCols = (widgets) => {
    const cant = widgets.filter(
      (widget) => widget.widgetType === "Switch" || widget.widgetType === "Pump"
    ).length;

    if (cant == 4) {
      return 2;
    } else if (cant == 3) {
      return 3;
    }
  };
  return (
    <>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3 sm:grid-cols-2">
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
      {Object.keys(selectedDevice)?.length !== 0 && (
        <div
          className={
            "grid auto-rows-min gap-4 sm:grid-cols-2 md:grid-cols-" +
            calculateActuatorsCols(selectedDevice.template.widgets)
          }
        >
          {selectedDevice.template.widgets
            .filter(
              (widget) =>
                widget.widgetType === "Switch" || widget.widgetType === "Pump"
            )
            .map((item) => {
              return (
                <ActuatorCard
                  key={item.variable}
                  widget={item}
                  timer={selectedDevice.timers.find(
                    (timer) => timer.variable === item.variable
                  )}
                  ciclo={selectedDevice.ciclos.find(
                    (ciclo) => ciclo.variable === item.variable
                  )}
                  dId={selectedDevice.dId}
                  userId={auth.userData.id}
                />
              );
            })}
        </div>
      )}
    </>
  );
};

export default Dashboard;
