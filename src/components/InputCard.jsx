import * as React from "react";
import {
  Settings,
  Clock,
  Droplets,
  FlaskConical,
  RefreshCw,
  AlertCircle,
  Unplug,
  AlertTriangle,
  Radio,
  Wrench,
  Zap,
  XCircle,
  TrendingUp,
  Wifi,
  HardDrive,
  Timer,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import MiniChart from "./MiniChart";
import CalibrationTimer from "./CalibrationTimer";
import PhCalibrationModal from "./PhCalibrationModal";
import useMqtt from "../hooks/useMqtt";

export const InputCard = ({ widget, dId, userId, "data-tour": dataTour }) => {
  const valueRef = React.useRef(null);
  const lastPhMessageRef = React.useRef(null);
  const setValue = (newValue) => {
    valueRef.current = newValue;
  };
  const { recived, setSend } = useMqtt();
  const [isCalibrating, setIsCalibrating] = React.useState(false);
  const [isPhCalibrating, setIsPhCalibrating] = React.useState(false);
  const [phReadState, setPhReadState] = React.useState(null);
  const [isForcePhReadPending, setIsForcePhReadPending] = React.useState(false);
  const isPhWidget = widget.variableFullName === "pH Agua";

  // Reset value when device changes
  React.useEffect(() => {
    setValue(null);
    setPhReadState(null);
    setIsForcePhReadPending(false);
    lastPhMessageRef.current = null;
  }, [dId]);

  React.useEffect(() => {
    if (recived) {
      let nextPhReadState = null;

      //console.log(recived);
      recived.forEach((item) => {
        if (
          isPhWidget &&
          item.dId === dId &&
          (item.variable === widget.variable || item.variable === "updater")
        ) {
          const currentMessage = {
            dId: item.dId,
            variable: item.variable,
            topic: item.topic,
            value: item.value ?? null,
            ph_read_state: item.ph_read_state ?? null,
            calib_state: item.calib_state ?? null,
            calib_progress: item.calib_progress ?? null,
          };
          const currentSignature = JSON.stringify(currentMessage);

          if (!lastPhMessageRef.current) {
            console.log("[pH-force-read] first mqtt message, value: "+ currentMessage.value+ ", ph_state: " + currentMessage.ph_read_state);
            lastPhMessageRef.current = {
              signature: currentSignature,
              data: currentMessage,
            };
          } else if (lastPhMessageRef.current.signature !== currentSignature) {
            console.log("[pH-force-read] new mqtt message changed, value: "+ currentMessage.value+ ", ph_state: " + currentMessage.ph_read_state);
            lastPhMessageRef.current = {
              signature: currentSignature,
              data: currentMessage,
            };
          }
        }

        if (
          isPhWidget &&
          item.dId === dId &&
          (item.variable === widget.variable || item.variable === "updater") &&
          item.ph_read_state !== null &&
          item.ph_read_state !== undefined
        ) {
          nextPhReadState = item.ph_read_state;
        }

        if (item.dId === dId && item.variable === widget.variable) {
          // During pH calibration "value" is voltage (V), not pH units — skip card update
          if (item.calib_state && item.calib_state !== "idle") return;
          if (item.value === null || item.value === undefined) return;
          //setConfig({ ...config, value: item.value });
          setValue(item.value);
        }
      });

      if (isPhWidget) {
        setPhReadState(nextPhReadState);
      }
    }
  }, [recived]);

  const forcePhRead = () => {
    if (isForcePhReadPending) return;

    const toSend = {
      topic: userId + "/" + dId + "/updater/actdata",
      msg: {
        value: "read_ph",
      },
    };
    setIsForcePhReadPending(true);
    console.log("[pH-force-read] publish read_ph", {
      dId,
      variable: widget.variable,
      topic: toSend.topic,
      msg: toSend.msg,
      currentPhReadState: phReadState,
      currentValue: valueRef.current,
    });
    setSend({ msg: toSend.msg, topic: toSend.topic });
  };

  const mapName = (variableFullName) => {
    switch (variableFullName) {
      case "Temp":
        return "Temperatura";
      case "Hum":
        return "Humedad ambiente";
      case "Hum suelo":
        return "Humedad del suelo";
      case "Temp Ambiente":
        return "Temperatura ambiente";
      case "Hum Ambiente":
        return "Humedad ambiente";
      case "Temp Agua":
        return "Temperatura del agua";
      case "pH Agua":
        return "pH del agua";
      default:
        return variableFullName;
    }
  };

  // Función para abrir el modal de calibración
  const openCalibrationModal = () => {
    setIsCalibrating(true);
  };

  // Función para enviar el comando de inicio de calibración
  const startCalibrationProcess = () => {
    const sensorNumber = getSensorNumber();
    if (sensorNumber) {
      const calibMsg = `calib_s${sensorNumber}`;
      const toSend = {
        topic: userId + "/" + dId + "/updater/actdata",
        msg: {
          value: calibMsg,
        },
      };
      console.log(toSend);
      setSend({ msg: toSend.msg, topic: toSend.topic });
    }
  };

  // Función para cancelar la calibración
  const cancelCalibration = () => {
    const toSend = {
      topic: userId + "/" + dId + "/updater/actdata",
      msg: {
        value: "calib_cancel",
      },
    };
    setSend({ msg: toSend.msg, topic: toSend.topic });
    setIsCalibrating(false);
  };

  // Función para finalizar la calibración
  const handleCalibrationComplete = () => {
    setIsCalibrating(false);
  };

  // Determinar el número de sensor basado en la variable
  const getSensorNumber = () => {
    // Asumiendo que widget.variable es algo como "s1", "s2", etc.
    // o widget.variableFullName es "Hum suelo"
    if (widget.variable) {
      const match = widget.variable.match(/s(\d+)/);
      if (match) {
        return match[1];
      }
    }
    // Si no hay match, retornar null o un valor por defecto
    return "1"; // Por defecto sensor 1
  };

  // Verificar si es sensor de humedad del suelo
  const isSoilHumiditySensor = () => {
    return (
      widget.variableFullName === "Hum suelo"
    );
  };

  // Verificar si es sensor de pH
  const isPhSensor = () => {
    return widget.variableFullName === "pH Agua";
  };

  const errorHandeOnValue = (value, unidad) => {
    // Códigos de error del sensor con iconos
    const errorCodes = {
      0: null, // SENSOR_OK - Funcionando correctamente
      [-1]: { icon: Clock, text: "Timeout" },
      [-2]: { icon: AlertCircle, text: "Error lectura" },
      [-3]: { icon: Unplug, text: "Desconectado" },
      [-4]: { icon: AlertTriangle, text: "Datos inválidos" },
      [-5]: { icon: Radio, text: "Error I2C" },
      [-6]: { icon: Wrench, text: "Error calibración" },
      [-7]: { icon: Zap, text: "Error alimentación" },
      [-8]: { icon: XCircle, text: "Error inicialización" },
      [-9]: { icon: TrendingUp, text: "Fuera de rango" },
      [-10]: { icon: Unplug, text: "Múltiples desconectados" },
      [-11]: { icon: Wifi, text: "Conflicto WiFi-ADC2" },
      [-12]: { icon: HardDrive, text: "Error buffer" },
      [-13]: { icon: Timer, text: "Error frecuencia" },
    };

    // Si hay un código de error, mostrarlo
    if (value < 0 && errorCodes[value]) {
      const ErrorIcon = errorCodes[value].icon;
      return (
        <span className="flex items-center gap-1 text-red-600 text-xs font-medium">
          <ErrorIcon className="h-3 w-3" />
          {errorCodes[value].text}
        </span>
      );
    }

    // Si no hay valor o es null/undefined
    if (value === null || value === undefined) {
      return " - " + unidad;
    }

    // Valor normal - formatear si es número con decimales
    let formattedValue = value;
    if (typeof value === "number" && !Number.isInteger(value)) {
      // pH requiere 2 decimales, otros sensores 1 decimal
      const decimals = unidad === "pH" ? 2 : 1;
      formattedValue = value.toFixed(decimals);
    }

    return formattedValue + " " + unidad;
  };

  // Verificar si el sensor está funcionando correctamente (sin errores)
  const isSensorWorking = () => {
    const currentValue = valueRef.current;
    // El sensor debe tener un valor válido (>= 0) para poder calibrar
    return (
      currentValue !== null && currentValue !== undefined && currentValue >= 0
    );
  };

  const isPhWaitingRead = isPhSensor() && phReadState === "waiting_pump_off";
  const isPhStabilizing = isPhSensor() && phReadState === "stabilizing";
  const isPhSampling = isPhSensor() && phReadState === "sampling";
  const isPhValueMissing = valueRef.current === null || valueRef.current === undefined;

  React.useEffect(() => {
    if (!isPhWidget) return;
    if (
      phReadState === "waiting_pump_off" ||
      phReadState === "stabilizing" ||
      phReadState === "sampling"
    ) {
      console.log("[pH-force-read] state update: " + phReadState);
    }

    if (isForcePhReadPending && phReadState === "sampling") {
      console.log("[pH-force-read] first sampling received, enabling button again");
      setIsForcePhReadPending(false);
    }
  }, [isPhWidget, phReadState, dId, widget.variable, isForcePhReadPending]);

  const renderCardValue = () => {
    if (isPhSampling) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex items-center gap-2" aria-label="Tomando muestra de pH">
                <RefreshCw className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-sky-500" />
                <span className="text-2xl sm:text-3xl text-white">pH</span>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Tomando muestra de pH...</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    if (isPhStabilizing) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex items-center gap-2" aria-label="Estabilizando agua para lectura de pH">
                <Droplets className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-500 animate-pulse [animation-duration:1200ms]" />
                <span className="text-2xl sm:text-3xl text-white">pH</span>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Estabilizando agua tras apagar la bomba...</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return errorHandeOnValue(valueRef.current, widget.unidad);
  };

  return (
    <Card
      className="text-left flex md:flex-col p-6 relative border-0 sm:border"
      data-tour={dataTour}
    >
      {/* Botón de calibración pH en la esquina superior derecha */}
      {isPhSensor() && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsPhCalibrating(true)}
          className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-foreground"
          title="Calibrar sonda de pH"
        >
          <Settings className="h-3.5 w-3.5" />
        </Button>
      )}

      {/* Botón de calibración de humedad en la esquina superior derecha */}
      {isSoilHumiditySensor() && !isCalibrating && (
        <Button
          variant="ghost"
          size="icon"
          onClick={openCalibrationModal}
          disabled={!isSensorWorking()}
          className="absolute top-2 right-2 h-8 w-8"
          title={
            isSensorWorking()
              ? "Calibrar sensor"
              : "Sensor no disponible - Verifica la conexión"
          }
        >
          <Settings className="h-4 w-4" />
        </Button>
      )}

      <CardHeader className="p-0 pb-2 pl-1 min-w-[110px] sm:min-w-[130px] flex flex-col justify-center">
        <CardDescription className="text-wrap truncate text-[10px] sm:text-xs">
          {mapName(widget.variableFullName)}
        </CardDescription>
        <CardTitle className="text-2xl sm:text-3xl">
          <div className="flex items-center gap-2">
            {renderCardValue()}
            {isPhSensor() && (isPhWaitingRead || isPhStabilizing) && !isPhSampling && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={forcePhRead}
                      disabled={isForcePhReadPending || isPhStabilizing}
                      className={`h-7 w-7 transition-colors ${
                        isPhValueMissing
                          ? "text-amber-600 hover:text-amber-700"
                          : "text-amber-400 hover:text-amber-500"
                      }`}
                      aria-label="Forzar lectura de pH"
                    >
                      {isPhStabilizing ? (
                        <Clock className="h-4 w-4 opacity-70" />
                      ) : isPhValueMissing ? (
                        <Clock className="h-4 w-4 animate-pulse [animation-duration:700ms]" />
                      ) : (
                        <RefreshCw className="h-4 w-4 opacity-80" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {isPhStabilizing
                        ? "Estabilizando agua..."
                        : `Esperando a que se apague la bomba${
                            valueRef.current ? " para tomar una nueva lectura" : ""
                          }. Click para forzar lectura de pH.`}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <MiniChart
          color={widget.color}
          variable={widget.variable}
          dId={dId}
          sensorName={widget.name}
        />
      </CardContent>

      {/* Modal de calibración de humedad del suelo */}
      <Dialog open={isCalibrating} onOpenChange={setIsCalibrating}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="sr-only">
              Calibración del sensor
            </DialogTitle>
            <DialogDescription className="sr-only">
              Proceso de calibración del sensor de humedad del suelo
            </DialogDescription>
          </DialogHeader>
          <CalibrationTimer
            onComplete={handleCalibrationComplete}
            onCancel={cancelCalibration}
            onStart={startCalibrationProcess}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de calibración de pH */}
      <PhCalibrationModal
        open={isPhCalibrating}
        onOpenChange={setIsPhCalibrating}
        deviceId={dId}
        userId={userId}
        phVariableId={widget.variable}
      />
    </Card>
  );
};

export default InputCard;
