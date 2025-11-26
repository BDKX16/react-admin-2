import { InputCard } from "@/components/InputCard";
import { FusionCard } from "@/components/FusionCard";
import useDevices from "@/hooks/useDevices";
import ActuatorCard from "../components/ActuatorCard";
import useAuth from "../hooks/useAuth";
import WelcomeCard from "../components/WelcomeCard";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { generateDeviceTour } from "@/utils/deviceTourGenerator";
import { useEffect, useMemo } from "react";
import useMqtt from "../hooks/useMqtt";

// Calcular VPD (Vapor Pressure Deficit)
const calculateVPD = (temp, humidity) => {
  const svp = 0.61078 * Math.exp((17.27 * temp) / (temp + 237.3));
  const avp = svp * (humidity / 100);
  const vpd = svp - avp;
  return Number(vpd.toFixed(2));
};

// Calcular Dew Point (Punto de Rocío)
const calculateDewPoint = (temp, humidity) => {
  const a = 17.27;
  const b = 237.7;
  const alpha = (a * temp) / (b + temp) + Math.log(humidity / 100);
  const dewPoint = (b * alpha) / (a - alpha);
  return Number(dewPoint.toFixed(1));
};

const Dashboard = () => {
  const { selectedDevice } = useDevices();
  const { auth } = useAuth();
  const { startTour, hasCompletedOnboarding } = useOnboarding();
  const { recived } = useMqtt();

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

  // Calcular VPD y Dew Point para dispositivos Confi con datos reales
  const vpdDewPointData = useMemo(() => {
    if (!selectedDevice) {
      return null;
    }

    // Buscar las variables correctas en los widgets del template
    const tempWidget = selectedDevice.template?.widgets?.find(
      (w) => w.name === "Temperatura"
    );
    const humWidget = selectedDevice.template?.widgets?.find(
      (w) => w.name === "Humedad Ambiente"
    );

    if (!tempWidget || !humWidget) {
      return null;
    }

    let temp = null;
    let hum = null;

    // Obtener últimos valores de temperatura y humedad usando las variables correctas
    if (recived && recived.length > 0) {
      const deviceData = recived.filter(
        (item) => item.dId === selectedDevice.dId
      );
      const tempData = deviceData.find(
        (item) => item.variable === tempWidget.variable
      );
      const humData = deviceData.find(
        (item) => item.variable === humWidget.variable
      );

      temp = tempData?.value;
      hum = humData?.value;
    }

    // Fallback a savelogs si no hay datos MQTT
    if ((temp === null || hum === null) && selectedDevice.savelogs?.[0]) {
      temp = temp ?? selectedDevice.savelogs[0].temp;
      hum = hum ?? selectedDevice.savelogs[0].hum;
    }

    // Solo mostrar si hay datos reales válidos
    if (temp !== null && temp > 0 && hum !== null && hum > 0) {
      return {
        vpd: calculateVPD(temp, hum),
        dewPoint: calculateDewPoint(temp, hum),
        tempVariable: tempWidget.variable,
        humVariable: humWidget.variable,
      };
    }

    return null;
  }, [selectedDevice, recived]);

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
        className="grid auto-rows-min gap-0 md:gap-4 md:grid-cols-3 sm:grid-cols-2"
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

      {/* VPD y Dew Point - Fusion Cards */}
      {vpdDewPointData && (
        <>
          {/* Mobile: Solo VPD (DP incluido dentro) */}
          <div className="md:hidden">
            <FusionCard
              type="vpd"
              vpd={vpdDewPointData.vpd}
              dewPoint={vpdDewPointData.dewPoint}
              dId={selectedDevice.dId}
              tempVariable={vpdDewPointData.tempVariable}
              humVariable={vpdDewPointData.humVariable}
            />
          </div>

          {/* Desktop: Ambos cards en 2 columnas */}
          <div className="hidden md:grid auto-rows-min gap-4 md:grid-cols-2">
            <FusionCard
              type="vpd"
              vpd={vpdDewPointData.vpd}
              dewPoint={vpdDewPointData.dewPoint}
              dId={selectedDevice.dId}
              tempVariable={vpdDewPointData.tempVariable}
              humVariable={vpdDewPointData.humVariable}
            />
            <FusionCard
              type="dewpoint"
              vpd={vpdDewPointData.vpd}
              dewPoint={vpdDewPointData.dewPoint}
              dId={selectedDevice.dId}
              tempVariable={vpdDewPointData.tempVariable}
              humVariable={vpdDewPointData.humVariable}
            />
          </div>
        </>
      )}
      {selectedDevice && (
        <div
          className={
            "grid auto-rows-min gap-4 grid-cols-2 md:grid-cols-" +
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
