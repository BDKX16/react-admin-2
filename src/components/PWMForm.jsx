import { useState } from "react";
import PropTypes from "prop-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, HelpCircle, Zap } from "lucide-react";
import useMqtt from "../hooks/useMqtt";
import useFetchAndLoad from "@/hooks/useFetchAndLoad";
import { setSinglePWM } from "../services/public";

const PWMForm = ({ userId, dId, widget }) => {
  const { setSend } = useMqtt();
  const { loading, callEndpoint } = useFetchAndLoad();

  const getInitialConfig = () => ({
    pwm_frequency: widget.pwmConfig?.pwm_frequency || 1000,
    pwm_duty_cycle: widget.pwmConfig?.pwm_duty_cycle || 50,
  });

  const [config, setConfig] = useState(getInitialConfig());
  const [savedConfig, setSavedConfig] = useState(getInitialConfig());

  const [errors, setErrors] = useState({});

  // Determina si hay cambios pendientes respecto al último guardado
  const isDirty = JSON.stringify(config) !== JSON.stringify(savedConfig);
  const isButtonDisabled = !isDirty || loading;

  const handleFrequencyChange = (value) => {
    const frequency = parseInt(value) || 1;
    setConfig((prev) => ({
      ...prev,
      pwm_frequency: Math.max(1, Math.min(40000, frequency)),
    }));

    if (errors.pwm_frequency) {
      setErrors((prev) => ({
        ...prev,
        pwm_frequency: null,
      }));
    }
  };

  const handleDutyCycleChange = (value) => {
    const dutyCycle = Array.isArray(value) ? value[0] : value;
    setConfig((prev) => ({
      ...prev,
      pwm_duty_cycle: dutyCycle,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (config.pwm_frequency < 1 || config.pwm_frequency > 40000) {
      newErrors.pwm_frequency = "La frecuencia debe estar entre 1 y 40000 Hz";
    }

    if (config.pwm_duty_cycle < 0 || config.pwm_duty_cycle > 100) {
      newErrors.pwm_duty_cycle = "El duty cycle debe estar entre 0 y 100%";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendPWMConfig = async () => {
    if (!validateForm()) return;

    const toSend = {
      topic: `${userId}/${dId}/${widget.variable}/actdata`,
      msg: {
        value: 6, // Modo PWM
        pwm_frequency: config.pwm_frequency,
        pwm_duty_cycle: config.pwm_duty_cycle,
      },
    };

    // Send MQTT message
    setSend({ msg: toSend.msg, topic: toSend.topic });

    // Persist to database
    const pwmConfig = {
      variable: widget.variable,
      pwm_frequency: config.pwm_frequency,
      pwm_duty_cycle: config.pwm_duty_cycle,
    };

    const res = await callEndpoint(setSinglePWM(pwmConfig, dId));
    if (res?.data?.status === "success") {
      console.log("PWM configuration saved successfully");
      // Actualizar savedConfig para deshabilitar el botón tras guardar exitosamente
      setSavedConfig({ ...config });
    }
  };

  const getFrequencyRecommendation = (frequency) => {
    if (frequency >= 1 && frequency <= 100) {
      return "Ideal para ventiladores y motores lentos";
    } else if (frequency > 100 && frequency <= 1000) {
      return "Bueno para calefactores y cargas resistivas";
    } else if (frequency > 1000 && frequency <= 5000) {
      return "Ideal para LEDs y control de brillo";
    } else if (frequency > 5000) {
      return "Para cargas rápidas y control preciso";
    }
    return "";
  };

  return (
    <div className="w-full space-y-4">
      <div className="pb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Control PWM
          </h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm p-4">
                <div className="space-y-2">
                  <p className="font-semibold">
                    PWM (Modulación por Ancho de Pulso)
                  </p>
                  <p className="text-sm">
                    <strong>Para usuarios normales:</strong> Como un dimmer de
                    luz que enciende y apaga muy rápido para controlar la
                    intensidad. A mayor %, más potencia.
                  </p>
                  <p className="text-sm">
                    <strong>Para profesionales:</strong>•{" "}
                    <strong>Frecuencia:</strong> Qué tan rápido pulsa (Hz) •{" "}
                    <strong>Duty Cycle:</strong> % del tiempo que está encendido
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Frecuencias típicas: LEDs=1-5kHz, Motores=100-1kHz,
                    Resistencias=10-100Hz
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p className="text-sm text-muted-foreground">
          Configure la modulación por ancho de pulso para control variable
        </p>
      </div>

      <div className="space-y-6">
        {/* Duty Cycle Slider */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            Intensidad (Duty Cycle): {config.pwm_duty_cycle}%
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Porcentaje de tiempo que estará encendido. 0% = apagado,
                    100% = máxima potencia
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Label>
          <Slider
            value={[config.pwm_duty_cycle]}
            onValueChange={handleDutyCycleChange}
            max={100}
            min={0}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0% (Apagado)</span>
            <span>50% (Media potencia)</span>
            <span>100% (Máxima potencia)</span>
          </div>
        </div>

        {/* Visual representation */}
        <div className="space-y-2">
          <Label className="text-sm">Vista previa del pulso</Label>
          <div className="h-8 bg-muted rounded flex items-center overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${config.pwm_duty_cycle}%` }}
            />
          </div>
        </div>

        {/* Frequency */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            Frecuencia (Hz)
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Qué tan rápido pulsa por segundo. Mayor frecuencia = más
                    suave
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Label>
          <Input
            type="number"
            min="1"
            max="40000"
            value={config.pwm_frequency}
            onChange={(e) => handleFrequencyChange(e.target.value)}
            className={errors.pwm_frequency ? "border-red-500" : ""}
          />
          {errors.pwm_frequency && (
            <p className="text-sm text-red-500">{errors.pwm_frequency}</p>
          )}
          {getFrequencyRecommendation(config.pwm_frequency) && (
            <p className="text-xs text-muted-foreground">
              💡 {getFrequencyRecommendation(config.pwm_frequency)}
            </p>
          )}
        </div>

        {/* Frequency Presets */}
        <div className="space-y-2">
          <Label>Configuraciones frecuentes</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setConfig((prev) => ({ ...prev, pwm_frequency: 50 }))
              }
            >
              Ventiladores (50Hz)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setConfig((prev) => ({ ...prev, pwm_frequency: 500 }))
              }
            >
              Calefactor (500Hz)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setConfig((prev) => ({ ...prev, pwm_frequency: 2000 }))
              }
            >
              LEDs (2kHz)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setConfig((prev) => ({ ...prev, pwm_frequency: 10000 }))
              }
            >
              Precisión (10kHz)
            </Button>
          </div>
        </div>

        {/* Power Calculation */}
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm font-medium">Información de potencia:</p>
          <p className="text-xs text-muted-foreground mt-1">
            Con {config.pwm_duty_cycle}% de duty cycle, el dispositivo recibirá
            aproximadamente{" "}
            <span className="font-medium">
              {config.pwm_duty_cycle}% de la potencia máxima
            </span>
          </p>
        </div>

        <Button
          onClick={sendPWMConfig}
          className="w-full"
          variant={isDirty ? "default" : "outline"}
          disabled={isButtonDisabled}
        >
          {loading ? "Guardando..." : "Aplicar Configuración PWM"}
        </Button>
      </div>
    </div>
  );
};

PWMForm.propTypes = {
  userId: PropTypes.string.isRequired,
  dId: PropTypes.string.isRequired,
  widget: PropTypes.object.isRequired,
};

export default PWMForm;
