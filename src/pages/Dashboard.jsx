import { InputCard } from "@/components/InputCard";
import useDevices from "@/hooks/useDevices";
import ActuatorCard from "../components/ActuatorCard";
import useAuth from "../hooks/useAuth";
import WelcomeCard from "../components/WelcomeCard";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { generateDeviceTour } from "@/utils/deviceTourGenerator";
import { useEffect } from "react";

const Dashboard = () => {
  const { selectedDevice } = useDevices();
  const { auth } = useAuth();
  const { startTour, hasCompletedOnboarding } = useOnboarding();

  // Check for device-model onboarding (runs once per device model)
  useEffect(() => {
    if (!hasCompletedOnboarding("devices") && selectedDevice?.template) {
      const timer = setTimeout(() => {
        const deviceTour = generateDeviceTour(
          selectedDevice.template,
          selectedDevice.name,
          selectedDevice.modelId
        );
        startTour("device-model", deviceTour);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [
    hasCompletedOnboarding,
    startTour,
    selectedDevice?.template,
    selectedDevice?.name,
    selectedDevice?.modelId,
  ]);

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
  if (selectedDevice?.code === 1) {
    return <WelcomeCard />; // Use the new component
  }
  return (
    <>
      <div
        className="grid auto-rows-min gap-4 md:grid-cols-3 sm:grid-cols-2"
        data-tour="device-sensors"
      >
        {selectedDevice &&
          selectedDevice.template.widgets.map((item, index) => {
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
                  userId={auth.userData.id}
                  data-tour={index === 0 ? "device-card" : undefined}
                />
              );
            }
          })}
      </div>
      {selectedDevice && (
        <div
          className={
            "grid auto-rows-min gap-4 sm:grid-cols-2 md:grid-cols-" +
            calculateActuatorsCols(selectedDevice.template.widgets)
          }
          data-tour="device-controls"
        >
          {selectedDevice.template.widgets
            .filter(
              (widget) =>
                widget.widgetType === "Switch" || widget.widgetType === "Pump"
            )
            .map((item) => {
              //console.log(item);
              const widgetTimer = selectedDevice.timers.find(
                (timer) => timer.variable === item.variable
              );

              const widgetCiclo = selectedDevice.ciclos.find(
                (ciclo) => ciclo.variable == item.variable
              );

              if (!widgetTimer) {
                console.log("No timer found for variable:", item.variable);
                return;
              }
              if (!widgetCiclo) {
                console.log("No ciclo found for variable:", item.variable);
                return;
              }
              return (
                <ActuatorCard
                  key={item.variable}
                  widget={item}
                  timer={widgetTimer}
                  ciclo={widgetCiclo}
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
