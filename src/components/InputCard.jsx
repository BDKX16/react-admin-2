import * as React from "react";
import {
  Settings,
  Clock,
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

import MiniChart from "./MiniChart";
import CalibrationTimer from "./CalibrationTimer";
import useMqtt from "../hooks/useMqtt";

export const InputCard = ({ widget, dId, userId, "data-tour": dataTour }) => {
  const valueRef = React.useRef(null);
  const setValue = (newValue) => {
    valueRef.current = newValue;
  };
  const { recived, setSend } = useMqtt();
  const [isCalibrating, setIsCalibrating] = React.useState(false);

  // Reset value when device changes
  React.useEffect(() => {
    setValue(null);
  }, [dId]);

  React.useEffect(() => {
    if (recived) {
      //console.log(recived);
      recived.map((item) => {
        if (item.dId === dId && item.variable === widget.variable) {
          //setConfig({ ...config, value: item.value });
          setValue(item.value);
        }
      });
    }
  }, [recived]);

  const mapName = (variableFullName) => {
    switch (variableFullName) {
      case "Temp":
        return "Temperatura";
      case "Hum":
        return "Humedad ambiente";
      case "Hum suelo":
        return "Humedad del suelo";
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
      widget.variableFullName === "Hum suelo" ||
      (widget.variable && widget.variable.includes("s"))
    );
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
      // Si tiene decimales, redondear a 1 dígito
      formattedValue = value.toFixed(1);
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

  return (
    <Card
      className="text-left flex md:flex-col p-6 relative border-0 sm:border"
      data-tour={dataTour}
    >
      {/* Botón de calibración en la esquina superior derecha */}
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
          {errorHandeOnValue(valueRef.current, widget.unidad)}
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

      {/* Modal de calibración */}
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
    </Card>
  );
};

export default InputCard;
