import { useState } from "react";
import PropTypes from "prop-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, HelpCircle, Target } from "lucide-react";
import useMqtt from "../hooks/useMqtt";

const PIForm = ({ userId, dId, widget }) => {
  const { setSend } = useMqtt();
  const [config, setConfig] = useState({
    pid_kp: 1.5,
    pid_ki: 0.2,
    pid_setpoint: 25.0,
    sensor_input: 0,
  });

  const [errors, setErrors] = useState({});

  const sensorOptions = [
    { value: 0, label: "Temperatura (°C)" },
    { value: 1, label: "Humedad ambiente (%)" },
    { value: 2, label: "Humedad del suelo (%)" },
  ];

  const handleInputChange = (field, value) => {
    setConfig((prev) => ({
      ...prev,
      [field]: parseFloat(value) || 0,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const handleSensorChange = (value) => {
    setConfig((prev) => ({
      ...prev,
      sensor_input: parseInt(value),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (config.pid_kp <= 0) {
      newErrors.pid_kp = "Kp debe ser mayor a 0";
    }

    if (config.pid_ki < 0) {
      newErrors.pid_ki = "Ki no puede ser negativo";
    }

    if (config.pid_setpoint <= 0) {
      newErrors.pid_setpoint = "El setpoint debe ser mayor a 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendPIConfig = () => {
    if (!validateForm()) return;

    const toSend = {
      topic: `${userId}/${dId}/${widget.variable}/actdata`,
      msg: {
        value: 8, // Modo PI
        pid_kp: config.pid_kp,
        pid_ki: config.pid_ki,
        pid_setpoint: config.pid_setpoint,
        sensor_input: config.sensor_input,
      },
    };

    setSend({ msg: toSend.msg, topic: toSend.topic });
  };

  return (
    <div className="w-full space-y-4">
      <div className="pb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5" />
            Control PI
          </h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm p-4">
                <div className="space-y-2">
                  <p className="font-semibold">
                    Control PI (Proporcional-Integral)
                  </p>
                  <p className="text-sm">
                    <strong>Para usuarios normales:</strong> Como un termostato
                    inteligente que reacciona inmediatamente y también aprende
                    de errores pasados para ser más preciso.
                  </p>
                  <p className="text-sm">
                    <strong>Para profesionales:</strong>• <strong>Kp:</strong>{" "}
                    Respuesta inmediata proporcional al error •{" "}
                    <strong>Ki:</strong> Elimina error en estado estable
                    acumulando correcciones
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Más estable que solo P, más simple que PID. Ideal para la
                    mayoría de aplicaciones.
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p className="text-sm text-muted-foreground">
          Control automático con respuesta inmediata y corrección de errores
          acumulados
        </p>
      </div>

      <div className="space-y-4">
        {/* Sensor Selection */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            Sensor de entrada
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Selecciona qué sensor usará el controlador PI para leer el
                    valor actual
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Label>
          <Select
            value={config.sensor_input.toString()}
            onValueChange={handleSensorChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar sensor" />
            </SelectTrigger>
            <SelectContent>
              {sensorOptions.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Setpoint */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            Valor objetivo (Setpoint)
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>El valor que quieres mantener (ej: 25°C, 60% humedad)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Label>
          <Input
            type="number"
            step="0.1"
            value={config.pid_setpoint}
            onChange={(e) => handleInputChange("pid_setpoint", e.target.value)}
            className={errors.pid_setpoint ? "border-red-500" : ""}
          />
          {errors.pid_setpoint && (
            <p className="text-sm text-red-500">{errors.pid_setpoint}</p>
          )}
        </div>

        {/* Kp Parameter */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            Kp (Proporcional)
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Qué tan fuerte reacciona a la diferencia actual. Mayor = más
                    agresivo
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Label>
          <Input
            type="number"
            step="0.1"
            value={config.pid_kp}
            onChange={(e) => handleInputChange("pid_kp", e.target.value)}
            className={errors.pid_kp ? "border-red-500" : ""}
          />
          {errors.pid_kp && (
            <p className="text-sm text-red-500">{errors.pid_kp}</p>
          )}
        </div>

        {/* Ki Parameter */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            Ki (Integral)
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Corrige errores acumulados con el tiempo. Elimina
                    desviaciones permanentes
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Label>
          <Input
            type="number"
            step="0.01"
            value={config.pid_ki}
            onChange={(e) => handleInputChange("pid_ki", e.target.value)}
            className={errors.pid_ki ? "border-red-500" : ""}
          />
          {errors.pid_ki && (
            <p className="text-sm text-red-500">{errors.pid_ki}</p>
          )}
        </div>

        {/* Info Box */}
        <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border">
          <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
            💡 Ventajas del Control PI:
          </p>
          <ul className="text-xs text-blue-600 dark:text-blue-400 mt-1 space-y-1">
            <li>• Más estable que solo Proporcional</li>
            <li>• Elimina errores permanentes</li>
            <li>• Más simple de configurar que PID</li>
            <li>• Ideal para temperatura y humedad</li>
          </ul>
        </div>

        {/* Presets */}
        <div className="space-y-2">
          <Label>Configuraciones recomendadas</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setConfig((prev) => ({ ...prev, pid_kp: 1.5, pid_ki: 0.15 }))
              }
            >
              Temperatura
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setConfig((prev) => ({ ...prev, pid_kp: 1.0, pid_ki: 0.25 }))
              }
            >
              Humedad
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setConfig((prev) => ({ ...prev, pid_kp: 2.0, pid_ki: 0.1 }))
              }
            >
              Rápido
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setConfig((prev) => ({ ...prev, pid_kp: 0.8, pid_ki: 0.05 }))
              }
            >
              Suave
            </Button>
          </div>
        </div>

        <Button onClick={sendPIConfig} className="w-full">
          Aplicar Configuración PI
        </Button>
      </div>
    </div>
  );
};

PIForm.propTypes = {
  userId: PropTypes.string.isRequired,
  dId: PropTypes.string.isRequired,
  widget: PropTypes.object.isRequired,
};

export default PIForm;
