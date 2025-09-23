import PropTypes from "prop-types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Power,
  Clock,
  RotateCcw,
  Zap,
  Target,
  TrendingUp,
  Settings,
  Info,
} from "lucide-react";

const ControlModeTooltip = ({ mode, children }) => {
  const getModeInfo = (mode) => {
    switch (mode) {
      case "on":
        return {
          icon: <Power className="h-4 w-4" />,
          title: "Encendido Manual",
          description:
            "El dispositivo permanece encendido hasta que lo cambies manualmente.",
          userExplanation: "Como un interruptor normal - permanece encendido.",
          professionalExplanation: "Estado digital HIGH constante.",
        };

      case "off":
        return {
          icon: <Power className="h-4 w-4" />,
          title: "Apagado Manual",
          description:
            "El dispositivo permanece apagado hasta que lo cambies manualmente.",
          userExplanation: "Como un interruptor normal - permanece apagado.",
          professionalExplanation: "Estado digital LOW constante.",
        };

      case "timers":
        return {
          icon: <Clock className="h-4 w-4" />,
          title: "Control por Horario",
          description:
            "Se enciende y apaga automáticamente según horarios programados.",
          userExplanation:
            "Como un timer de luces - se enciende y apaga a horas específicas.",
          professionalExplanation:
            "Programación horaria basada en RTC con horarios de encendido/apagado.",
        };

      case "cicles":
        return {
          icon: <RotateCcw className="h-4 w-4" />,
          title: "Control por Ciclos",
          description:
            "Se enciende por un tiempo, luego se apaga por otro tiempo, repitiendo el ciclo.",
          userExplanation:
            "Como un riego automático - enciende X minutos, descansa Y minutos, y repite.",
          professionalExplanation:
            "Ciclo de trabajo configurable con tiempo ON/OFF repetitivo.",
        };

      case "pwm":
        return {
          icon: <Zap className="h-4 w-4" />,
          title: "Control PWM",
          description:
            "Controla la intensidad encendiendo y apagando muy rápidamente.",
          userExplanation:
            "Como un dimmer de luz - controla la intensidad de 0% a 100%.",
          professionalExplanation:
            "PWM con frecuencia y duty cycle configurables. 8-bit resolution.",
        };

      case "pid":
        return {
          icon: <Settings className="h-4 w-4" />,
          title: "Control PID",
          description:
            "Control automático inteligente que aprende y se anticipa para mantener el valor exacto.",
          userExplanation:
            "Como un termostato muy inteligente que aprende y predice para mantener la temperatura exacta.",
          professionalExplanation:
            "Control PID completo con términos proporcional, integral y derivativo. Anti-windup incluido.",
        };

      case "pi":
        return {
          icon: <Target className="h-4 w-4" />,
          title: "Control PI",
          description:
            "Control automático que reacciona inmediatamente y corrige errores acumulados.",
          userExplanation:
            "Como un termostato inteligente que reacciona rápido y elimina diferencias permanentes.",
          professionalExplanation:
            "Control PI con términos proporcional e integral. Elimina error en estado estable.",
        };

      case "proportional":
        return {
          icon: <TrendingUp className="h-4 w-4" />,
          title: "Control Proporcional",
          description:
            "Control automático simple que reacciona más fuerte cuando la diferencia es mayor.",
          userExplanation:
            "Como un termostato básico - mientras más lejos del objetivo, más fuerte reacciona.",
          professionalExplanation:
            "Control proporcional simple. Output = Kp × Error. Puede tener offset en estado estable.",
        };

      default:
        return {
          icon: <Info className="h-4 w-4" />,
          title: "Modo de Control",
          description: "Selecciona un modo de control.",
          userExplanation: "",
          professionalExplanation: "",
        };
    }
  };

  const info = getModeInfo(mode);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent className="max-w-sm p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {info.icon}
              <span className="font-semibold">{info.title}</span>
            </div>

            <p className="text-sm">{info.description}</p>

            {info.userExplanation && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  👤 Para usuarios normales:
                </p>
                <p className="text-xs text-muted-foreground">
                  {info.userExplanation}
                </p>
              </div>
            )}

            {info.professionalExplanation && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-green-600 dark:text-green-400">
                  🔧 Para profesionales:
                </p>
                <p className="text-xs text-muted-foreground">
                  {info.professionalExplanation}
                </p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

ControlModeTooltip.propTypes = {
  mode: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default ControlModeTooltip;
