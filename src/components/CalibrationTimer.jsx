import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplet, Info, Play, ClipboardList } from "lucide-react";

const CalibrationTimer = ({ onComplete, onCancel, onStart }) => {
  const [timeLeft, setTimeLeft] = useState(60); // 60 segundos total
  const [phase, setPhase] = useState("dry"); // 'dry' o 'wet'
  const [hasStarted, setHasStarted] = useState(false); // Estado para controlar si ya inició

  // Función para iniciar la calibración
  const handleStart = () => {
    setHasStarted(true);
    if (onStart) {
      onStart(); // Llama al callback para enviar el comando MQTT
    }
  };

  useEffect(() => {
    // Solo ejecutar el timer si ya ha iniciado
    if (!hasStarted) return;

    if (timeLeft <= 0) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;

        // Cambiar de fase a los 30 segundos
        if (newTime === 30) {
          setPhase("wet");
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onComplete, hasStarted]);

  // Calcular el porcentaje para el círculo
  const totalTime = 60;
  const percentage = (timeLeft / totalTime) * 100;
  const circumference = 2 * Math.PI * 54; // radio de 54
  const offset = circumference - (percentage / 100) * circumference;

  // Determinar el color según la fase
  const getColor = () => {
    if (phase === "dry") {
      return "#f59e0b"; // naranja para secar
    } else {
      return "#3b82f6"; // azul para mojar
    }
  };

  // Instrucciones según la fase
  const getInstructions = () => {
    if (phase === "dry") {
      return {
        title: "1. Secar el sensor",
        description: "Seca completamente el sensor de humedad del suelo",
        emoji: "🌵",
      };
    } else {
      return {
        title: "2. Sumergir en agua",
        description: "Sumerge el sensor completamente en agua",
        emoji: "💧",
      };
    }
  };

  const instructions = getInstructions();

  // Si no ha iniciado, mostrar pantalla de explicación
  if (!hasStarted) {
    return (
      <div className="w-full">
        {/* Ícono centrado arriba */}
        <div className="flex justify-center pt-6 pb-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <Info className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="text-left pb-4 pt-0 px-6">
          <h2 className="text-2xl font-semibold tracking-tight">
            Calibración del Sensor de Humedad
          </h2>
          <p className="text-sm text-muted-foreground mt-1.5">
            Mejora la precisión de tus lecturas
          </p>
        </div>

        <div className="space-y-6 px-6 pb-6">
          {/* Explicación de qué hace */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Droplet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              ¿Qué es la calibración?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Permite que el sensor aprenda los valores extremos de humedad
              (seco y húmedo) para mejorar la precisión de las lecturas.
            </p>
          </div>

          {/* Proceso */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Instrucciones
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Ten a mano un <strong>paño seco</strong> y un{" "}
              <strong>vaso con agua</strong>. El proceso dura 60 segundos y no
              se puede pausar.
            </p>
            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <p className="font-medium">Fase seca (30 segundos)</p>
                  <p className="text-sm text-muted-foreground">
                    Seca completamente el sensor con un paño o papel. El sistema
                    registrará el valor mínimo.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <p className="font-medium">Fase húmeda (30 segundos)</p>
                  <p className="text-sm text-muted-foreground">
                    Sumerge el sensor en agua limpia. El sistema registrará el
                    valor máximo.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botón de iniciar - centrado */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleStart}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
              size="lg"
            >
              <Play className="w-4 h-4 mr-2" />
              Iniciar calibración
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Si ya inició, mostrar el timer
  return (
    <Card className="w-full border-2" style={{ borderColor: getColor() }}>
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl flex items-center justify-center gap-2">
          <span className="text-3xl">{instructions.emoji}</span>
          Calibración en proceso
        </CardTitle>
        <CardDescription className="text-base font-medium">
          {instructions.title}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4 pb-6">
        {/* Timer Circular estilo iPhone */}
        <div className="relative flex items-center justify-center">
          <svg className="transform -rotate-90" width="140" height="140">
            {/* Círculo de fondo */}
            <circle
              cx="70"
              cy="70"
              r="54"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            {/* Círculo de progreso */}
            <circle
              cx="70"
              cy="70"
              r="54"
              stroke={getColor()}
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{
                transition: "stroke-dashoffset 1s linear",
              }}
            />
          </svg>
          {/* Tiempo restante en el centro */}
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-4xl font-bold" style={{ color: getColor() }}>
              {timeLeft}
            </span>
            <span className="text-sm text-gray-500">segundos</span>
          </div>
        </div>

        {/* Instrucciones detalladas */}
        <div className="text-center space-y-2 max-w-sm">
          <p className="text-sm text-gray-600">{instructions.description}</p>
          <div className="text-xs text-gray-500 pt-2">
            {phase === "dry" ? (
              <p>
                Tiempo restante fase 1: <strong>{timeLeft}s</strong>
              </p>
            ) : (
              <p>
                Tiempo restante fase 2: <strong>{timeLeft}s</strong>
              </p>
            )}
          </div>
        </div>

        {/* Indicador de fase */}
        <div className="flex items-center gap-3 pt-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                phase === "dry"
                  ? "bg-orange-500 animate-pulse"
                  : "bg-orange-200"
              }`}
            ></div>
            <span
              className={`text-sm ${
                phase === "dry" ? "font-semibold" : "text-gray-400"
              }`}
            >
              Secar
            </span>
          </div>
          <div className="w-8 h-0.5 bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                phase === "wet" ? "bg-blue-500 animate-pulse" : "bg-blue-200"
              }`}
            ></div>
            <span
              className={`text-sm ${
                phase === "wet" ? "font-semibold" : "text-gray-400"
              }`}
            >
              Mojar
            </span>
          </div>
        </div>

        {/* Botón de cancelar */}
        {onCancel && (
          <button
            onClick={onCancel}
            className="mt-4 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
          >
            ❌ Cancelar calibración
          </button>
        )}
      </CardContent>
    </Card>
  );
};

export default CalibrationTimer;
