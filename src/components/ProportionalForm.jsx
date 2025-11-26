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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Info, HelpCircle, TrendingUp } from "lucide-react";
import useMqtt from "../hooks/useMqtt";
import useFetchAndLoad from "@/hooks/useFetchAndLoad";
import { setSingleProportional } from "../services/public";

const ProportionalForm = ({ userId, dId, widget }) => {
  const { setSend } = useMqtt();
  const { loading, callEndpoint } = useFetchAndLoad();
  const [config, setConfig] = useState({
    pid_kp: widget.pConfig?.pid_kp || 2.0,
    pid_setpoint: widget.pConfig?.pid_setpoint || 25.0,
    sensor_input: widget.pConfig?.sensor_input || 0,
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

    if (config.pid_setpoint <= 0) {
      newErrors.pid_setpoint = "El setpoint debe ser mayor a 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendProportionalConfig = async () => {
    if (!validateForm()) return;

    const toSend = {
      topic: `${userId}/${dId}/${widget.variable}/actdata`,
      msg: {
        value: 9, // Modo Proporcional
        pid_kp: config.pid_kp,
        pid_setpoint: config.pid_setpoint,
        sensor_input: config.sensor_input,
      },
    };

    // Send MQTT message
    setSend({ msg: toSend.msg, topic: toSend.topic });

    // Persist to database
    const pConfig = {
      variable: widget.variable,
      pid_kp: config.pid_kp,
      pid_setpoint: config.pid_setpoint,
      sensor_input: config.sensor_input,
    };

    const res = await callEndpoint(setSingleProportional(pConfig, dId));
    if (res?.data?.status === "success") {
      console.log("Proportional configuration saved successfully");
    }
  };

  const getResponseDescription = (kp) => {
    if (kp < 0.5) {
      return { text: "Respuesta muy suave", color: "text-blue-600" };
    } else if (kp < 1.0) {
      return { text: "Respuesta suave", color: "text-green-600" };
    } else if (kp < 2.0) {
      return { text: "Respuesta equilibrada", color: "text-green-600" };
    } else if (kp < 4.0) {
      return { text: "Respuesta rápida", color: "text-orange-600" };
    } else {
      return { text: "Respuesta muy agresiva", color: "text-red-600" };
    }
  };

  const response = getResponseDescription(config.pid_kp);

  return (
    <div className="w-full space-y-4">
      <div className="pb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Control Proporcional
          </h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm p-4">
                <div className="space-y-2">
                  <p className="font-semibold">Control Proporcional (P)</p>
                  <p className="text-sm">
                    <strong>Para usuarios normales:</strong> Como un termostato
                    básico que reacciona más fuerte cuando la diferencia es
                    mayor. Simple y fácil de entender.
                  </p>
                  <p className="text-sm">
                    <strong>Para profesionales:</strong>• <strong>Kp:</strong>{" "}
                    Ganancia proporcional - determina la agresividad de la
                    respuesta • Sin memoria de errores pasados • Puede tener
                    error en estado estable
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Ideal para sistemas que no necesitan precisión absoluta pero
                    requieren simplicidad.
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Control simple que reacciona proporcionalmente a la diferencia del
          valor objetivo
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
                  <p>Selecciona qué sensor usará el control proporcional</p>
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

        {/* Kp Parameter in Accordion */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="parameters">
            <AccordionTrigger className="text-sm">
              Configuración avanzada (Kp)
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-4">
                {/* Kp Parameter */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Kp (Ganancia Proporcional)
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Controla qué tan fuerte reacciona. Mayor valor =
                            respuesta más agresiva
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={config.pid_kp}
                    onChange={(e) =>
                      handleInputChange("pid_kp", e.target.value)
                    }
                    className={errors.pid_kp ? "border-red-500" : ""}
                  />
                  {errors.pid_kp && (
                    <p className="text-sm text-red-500">{errors.pid_kp}</p>
                  )}
                  <p className={`text-sm ${response.color} font-medium`}>
                    {response.text}
                  </p>
                </div>

                {/* Visual representation */}
                <div className="space-y-3">
                  <Label className="text-sm">Ejemplo de respuesta</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      Si la diferencia es <strong>10°C</strong> y Kp ={" "}
                      <strong>{config.pid_kp}</strong>:
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Salida = {config.pid_kp} × 10 ={" "}
                      <strong>{(config.pid_kp * 10).toFixed(1)}%</strong> de
                      potencia
                    </p>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Presets */}
        <div className="space-y-2">
          <Label>Configuraciones recomendadas</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfig((prev) => ({ ...prev, pid_kp: 0.5 }))}
            >
              Suave (0.5)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfig((prev) => ({ ...prev, pid_kp: 1.0 }))}
            >
              Normal (1.0)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfig((prev) => ({ ...prev, pid_kp: 2.0 }))}
            >
              Rápido (2.0)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfig((prev) => ({ ...prev, pid_kp: 4.0 }))}
            >
              Agresivo (4.0)
            </Button>
          </div>
        </div>

        <Button
          onClick={sendProportionalConfig}
          className="w-full"
          disabled={loading}
        >
          {loading ? "Guardando..." : "Aplicar Control Proporcional"}
        </Button>
      </div>
    </div>
  );
};

ProportionalForm.propTypes = {
  userId: PropTypes.string.isRequired,
  dId: PropTypes.string.isRequired,
  widget: PropTypes.object.isRequired,
};

export default ProportionalForm;
