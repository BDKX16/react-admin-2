import { InputCard } from "@/components/InputCard";
import useDevices from "@/hooks/useDevices";
import ActuatorCard from "../components/ActuatorCard";
import useAuth from "../hooks/useAuth";
import WelcomeCard from "../components/WelcomeCard"; // Import the new component

const Dashboard = () => {
  const { selectedDevice } = useDevices();
  const { auth } = useAuth();

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
      <div className="grid auto-rows-min gap-4 md:grid-cols-3 sm:grid-cols-2">
        {selectedDevice &&
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
                  userId={auth.userData.id}
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
