import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Power,
  Wifi,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Unplug,
} from "lucide-react";
import useMqtt from "@/hooks/useMqtt";
import useAuth from "@/hooks/useAuth";
import confetti from "canvas-confetti";

const DeviceSetupDashboard = ({
  device,
  template,
  onComplete,
  onActuatorConfigChange,
}) => {
  const { auth } = useAuth();
  const [sensorData, setSensorData] = useState({});
  const [actuatorStates, setActuatorStates] = useState({});
  const [actuatorConfig, setActuatorConfig] = useState({});
  const [missingSensors, setMissingSensors] = useState([]);
  const [hasReceivedData, setHasReceivedData] = useState(false);
  const [hoveredStepIndex, setHoveredStepIndex] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  // Hook MQTT - con validación para evitar errores si es undefined
  const { recived, setSend } = useMqtt();

  // Slider automático de imágenes (solo cuando no hay datos recibidos)
  useEffect(() => {
    if (!hasReceivedData) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % 5); // 5 imágenes
      }, 4000); // 4 segundos

      return () => clearInterval(interval);
    }
  }, [hasReceivedData]);

  // Extraer sensores y actuadores del template
  const sensors = template.widgets.filter(
    (w) => w.widgetType === "Indicator" && w.sensor === true
  );
  const actuators = template.widgets.filter((w) => w.widgetType === "Switch");

  // Inicializar configuración de actuadores
  useEffect(() => {
    const initialConfig = {};
    actuators.forEach((actuator) => {
      initialConfig[actuator.variable] = {
        startup: 0,
        powerFailure: 0,
      };
    });
    setActuatorConfig(initialConfig);
  }, [template]);

  // Escuchar mensajes MQTT
  useEffect(() => {
    if (recived) {
      recived.forEach((item) => {
        if (item.dId === device.dId) {
          // Si es la primera vez que recibimos datos, celebrar!
          if (!hasReceivedData) {
            setShowCelebration(true);

            // Lanzar confeti
            const duration = 2000;
            const animationEnd = Date.now() + duration;

            const randomInRange = (min, max) =>
              Math.random() * (max - min) + min;

            const interval = setInterval(() => {
              const timeLeft = animationEnd - Date.now();

              if (timeLeft <= 0) {
                clearInterval(interval);
                return;
              }

              const particleCount = 8;

              confetti({
                particleCount,
                startVelocity: 30,
                spread: 360,
                ticks: 60,
                origin: {
                  x: randomInRange(0.1, 0.9),
                  y: Math.random() - 0.2,
                },
                colors: ["#22c55e", "#3b82f6", "#a855f7", "#f59e0b", "#ef4444"],
              });

              // Añadir ráfaga extra desde el centro
              confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ["#22c55e", "#3b82f6", "#a855f7"],
              });
              confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ["#f59e0b", "#ef4444", "#a855f7"],
              });
            }, 250);

            // Después de la celebración, avanzar automáticamente
            setTimeout(() => {
              setShowCelebration(false);
            }, duration);
          }

          setHasReceivedData(true);

          // Buscar si es un sensor
          const sensor = sensors.find((s) => s.variable === item.variable);
          if (sensor) {
            setSensorData((prev) => ({
              ...prev,
              [item.variable]: item.value,
            }));
          }

          // Buscar si es un actuador
          const actuator = actuators.find((a) => a.variable === item.variable);
          if (actuator) {
            setActuatorStates((prev) => ({
              ...prev,
              [item.variable]: item.value === 1 || item.value === "1",
            }));
          }
        }
      });
    }
  }, [recived, device.dId, sensors, actuators, hasReceivedData]);

  // Verificar sensores críticos que faltan
  const checkMissingSensors = () => {
    const missing = [];

    // Sensores obligatorios: temperatura y humedad ambiente
    const tempSensor = sensors.find((s) => s.variable.includes("temp"));
    const humSensor = sensors.find(
      (s) => s.variable.includes("hum") && !s.variable.includes("soil")
    );

    if (tempSensor && sensorData[tempSensor.variable] === undefined) {
      missing.push(tempSensor);
    }
    if (humSensor && sensorData[humSensor.variable] === undefined) {
      missing.push(humSensor);
    }

    // Sensores de humedad del suelo: al menos uno debe estar conectado
    const soilSensors = sensors.filter(
      (s) =>
        s.variable.includes("soil") ||
        (s.variable.includes("hum") &&
          s.variableFullName.toLowerCase().includes("suelo"))
    );

    if (soilSensors.length > 0) {
      const connectedSoilSensors = soilSensors.filter(
        (s) =>
          sensorData[s.variable] !== undefined && sensorData[s.variable] >= 0
      );

      // Si ningún sensor de suelo está conectado, agregamos el primero como faltante
      if (connectedSoilSensors.length === 0) {
        missing.push(soilSensors[0]);
      }
    }

    setMissingSensors(missing);
  };

  // Controlar actuador
  const toggleActuator = (variable, currentState) => {
    const newState = !currentState;
    setActuatorStates((prev) => ({ ...prev, [variable]: newState }));

    // Enviar comando MQTT usando setSend
    const topic = `${auth.userData.id}/${device.dId}/${variable}/actdata`;
    const msg = {
      value: newState ? 1 : 0,
    };
    setSend({ topic, msg });
  };

  // Actualizar configuración de arranque
  // configType puede ser 'startup' o 'powerFailure'
  // value puede ser 0 (apagado), 1 (encendido), 3 (timer), 5 (ciclos)
  const updateActuatorConfig = (variable, configType, value) => {
    const newConfig = {
      ...actuatorConfig,
      [variable]: {
        ...actuatorConfig[variable],
        [configType]: parseInt(value),
      },
    };
    setActuatorConfig(newConfig);
    onActuatorConfigChange(newConfig);
  };

  // Verificar si puede continuar
  const canContinue = hasReceivedData && missingSensors.length === 0;

  // Función para traducir nombres de sensores
  const translateSensorName = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("hum") && lowerName.includes("suelo")) {
      return "humedad del suelo";
    }
    if (lowerName === "hum suelo") {
      return "humedad del suelo";
    }
    return lowerName;
  };

  // Generar lista de pasos de configuración
  const getSetupSteps = () => {
    const steps = [];
    const processedSensors = new Set();

    // Buscar sensores de temperatura y humedad para combinarlos
    const tempSensor = sensors.find((s) =>
      s.variableFullName.toLowerCase().includes("temp")
    );
    const humSensor = sensors.find((s) =>
      s.variableFullName.toLowerCase().includes("hum")
    );

    // Si hay ambos sensores (temp y hum), combinarlos en un paso
    if (tempSensor && humSensor) {
      const tempValue = sensorData[tempSensor.variable];
      const humValue = sensorData[humSensor.variable];

      processedSensors.add(tempSensor.variable);
      processedSensors.add(humSensor.variable);

      // Verificar si ambos están OK
      const bothOk = tempValue > 0 && humValue > 0;
      const bothMissing =
        (tempValue === undefined || tempValue === null || tempValue < 0) &&
        (humValue === undefined || humValue === null || humValue < 0);

      if (bothOk) {
        steps.push({
          icon: "✅",
          text: "Sensor de temperatura y humedad conectado",
          status: "completed",
        });
      } else if (bothMissing || (tempValue < 0 && humValue < 0)) {
        // Si ambos faltan o tienen error de conexión
        if (
          tempValue === -3 ||
          tempValue === -10 ||
          humValue === -3 ||
          humValue === -10
        ) {
          steps.push({
            icon: "",
            text: "Conecta el sensor de temperatura y humedad",
            status: "pending",
          });
        } else if (tempValue === -5 || humValue === -5) {
          steps.push({
            icon: "📡",
            text: "Revisa los cables de conexión del sensor de temperatura y humedad",
            status: "pending",
          });
        } else if (tempValue === -6 || humValue === -6) {
          steps.push({
            icon: "🔧",
            text: "Calibra el sensor de temperatura y humedad",
            status: "pending",
          });
        } else {
          steps.push({
            icon: "⚠️",
            text: "Verifica el sensor de temperatura y humedad",
            status: "pending",
          });
        }
      } else {
        // Si solo uno tiene problemas
        steps.push({
          icon: "⚠️",
          text: "Verifica el sensor de temperatura y humedad",
          status: "pending",
        });
      }
    }

    // Procesar el resto de sensores individualmente
    sensors.forEach((sensor) => {
      if (processedSensors.has(sensor.variable)) {
        return; // Skip ya procesados
      }

      const value = sensorData[sensor.variable];

      const translatedName = translateSensorName(sensor.variableFullName);

      // Si el sensor tiene un error o no tiene datos
      if (value === undefined || value === null) {
        steps.push({
          icon: "",
          text: `Conecta el sensor de ${translatedName}`,
          status: "pending",
        });
      } else if (value < 0) {
        // Códigos de error específicos
        if (value === -3 || value === -10) {
          steps.push({
            icon: "",
            text: `Conecta el sensor de ${translatedName}`,
            status: "pending",
          });
        } else if (value === -5) {
          steps.push({
            icon: "📡",
            text: `Revisa los cables de conexión del sensor de ${translatedName}`,
            status: "pending",
          });
        } else if (value === -6) {
          steps.push({
            icon: "🔧",
            text: `Calibra el sensor de ${translatedName}`,
            status: "pending",
          });
        } else {
          steps.push({
            icon: "⚠️",
            text: `Verifica el sensor de ${translatedName}`,
            status: "pending",
          });
        }
      } else {
        steps.push({
          icon: "✅",
          text: `Sensor de ${translatedName} conectado`,
          status: "completed",
        });
      }
    });

    return steps;
  };

  const setupSteps = getSetupSteps();
  const completedSteps = setupSteps.filter(
    (s) => s.status === "completed"
  ).length;

  return (
    <div className="space-y-6">
      {/* Instrucciones */}
      <Card className="border-0">
        <CardContent className="space-y-4">
          {!hasReceivedData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
              {/* Columna izquierda: Pasos */}
              <div className="space-y-4 text-left">
                <Wifi className="h-6 w-6 mb-2" />
                <h3 className="text-lg font-semibold">
                  Conecta tu dispositivo
                </h3>
                <ol className="list-decimal list-inside space-y-3 text-sm">
                  <li>Conecta tu dispositivo a una fuente de alimentación</li>
                  <li>Asegúrate de que esté conectado a tu red WiFi</li>
                  <li>Espera a que el dispositivo envíe datos</li>
                  <li>Verifica que todos los sensores estén conectados</li>
                </ol>

                <div className="flex items-center gap-2 text-muted-foreground pt-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">
                    Esperando conexión del dispositivo...
                  </span>
                </div>
              </div>

              {/* Columna derecha: Slider de imágenes */}
              <div className="relative w-full h-64 md:h-full min-h-[300px] bg-muted rounded-lg overflow-hidden">
                {[1, 2, 3, 4, 5].map((num, index) => (
                  <div
                    key={num}
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      index === currentImageIndex ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <img
                      src={`/assets/onboard-coneccion${num}.webp`}
                      alt={`Paso de conexión ${num}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                ))}

                {/* Indicadores de posición */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                  {[0, 1, 2, 3, 4].map((index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex
                          ? "bg-white w-6"
                          : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex flex-col items-center justify-center space-y-3 py-4 animate-in zoom-in duration-500 delay-300">
                <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
                <div className="text-center">
                  <p className="font-semibold text-lg">
                    ¡Dispositivo conectado!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ({completedSteps}/{setupSteps.length} sensores listos)
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <ol className="list-none space-y-3">
                  {setupSteps.map((step, index) => {
                    // Encontrar el primer paso pendiente
                    const firstPendingIndex = setupSteps.findIndex(
                      (s) => s.status === "pending"
                    );
                    const isCurrentStep = index === firstPendingIndex;
                    const isPastStep = step.status === "completed";

                    // Calcular la opacidad y tamaño basado en hover
                    let opacityClass = "";
                    let textSizeClass = "";
                    let iconScaleClass = "";

                    if (hoveredStepIndex !== null) {
                      // Cuando hay hover activo
                      if (hoveredStepIndex === index) {
                        // El paso con hover
                        opacityClass = "opacity-100";
                        textSizeClass = "text-xl font-semibold";
                        iconScaleClass = "scale-110";
                      } else if (Math.abs(hoveredStepIndex - index) === 1) {
                        // Pasos adyacentes (uno arriba o uno abajo)
                        opacityClass = isPastStep ? "opacity-50" : "opacity-70";
                        textSizeClass = "text-base";
                        iconScaleClass = "scale-100";
                      } else {
                        // Resto de pasos
                        opacityClass = "opacity-30";
                        textSizeClass = "text-xs";
                        iconScaleClass = "scale-90";
                      }
                    } else {
                      // Sin hover - comportamiento original
                      if (isPastStep) {
                        opacityClass = "opacity-60";
                        textSizeClass = "text-sm";
                        iconScaleClass = "scale-100";
                      } else if (isCurrentStep) {
                        opacityClass = "opacity-100";
                        textSizeClass = "text-xl font-semibold";
                        iconScaleClass = "scale-100";
                      } else {
                        // Pasos futuros van bajando en opacidad
                        const distance = index - firstPendingIndex;
                        if (distance === 1) opacityClass = "opacity-50";
                        else if (distance === 2) opacityClass = "opacity-30";
                        else opacityClass = "opacity-20";
                        textSizeClass = "text-sm";
                        iconScaleClass = "scale-100";
                      }
                    }

                    return (
                      <li
                        key={index}
                        onMouseEnter={() => setHoveredStepIndex(index)}
                        onMouseLeave={() => setHoveredStepIndex(null)}
                        className={`flex items-start gap-3 transition-all duration-300 cursor-pointer ${
                          isPastStep
                            ? "text-green-600 dark:text-green-400"
                            : "text-foreground"
                        } ${opacityClass}`}
                      >
                        <span
                          className={`flex-shrink-0 text-xl transition-all duration-300 ${iconScaleClass}`}
                        >
                          {step.icon}
                        </span>
                        <span
                          className={`flex-1 transition-all duration-300 ${textSizeClass}`}
                        >
                          {index + 1}. {step.text}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sensores faltantes */}
      {missingSensors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-semibold mb-2">
              Sensores desconectados o no detectados:
            </p>
            <ul className="list-disc list-inside space-y-1">
              {missingSensors.map((sensor) => (
                <li key={sensor.variable}>
                  {sensor.variableFullName} - Por favor, conecta este sensor
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Dashboard de sensores */}
      {sensors.length > 0 && hasReceivedData && (
        <div>
          <div className="flex flex-wrap md:flex-nowrap items-center justify-center gap-6">
            {/* Sensor combinado de Temperatura y Humedad Ambiente */}
            {(() => {
              const tempSensor = sensors.find((s) =>
                s.variable.includes("temp")
              );
              const humSensor = sensors.find(
                (s) =>
                  (s.variable.includes("hum") ||
                    s.variableFullName.toLowerCase().includes("hum")) &&
                  !s.variable.includes("soil") &&
                  !s.variableFullName.toLowerCase().includes("suelo")
              );

              if (tempSensor || humSensor) {
                const tempValue = sensorData[tempSensor?.variable];
                const humValue = sensorData[humSensor?.variable];
                const hasTempData =
                  tempValue !== undefined &&
                  tempValue !== null &&
                  tempValue >= 0;
                const hasHumData =
                  humValue !== undefined && humValue !== null && humValue >= 0;
                const hasAnyData = hasTempData || hasHumData;

                return (
                  <div className="flex flex-col items-center">
                    <div
                      className="relative w-24 h-24 rounded-full flex items-center justify-center"
                      style={{
                        background: hasAnyData
                          ? "rgba(76, 182, 73, 0.1)"
                          : "rgba(107, 114, 128, 0.1)",
                        border: hasAnyData
                          ? "3px solid #4CB649"
                          : "3px solid #6b7280",
                      }}
                    >
                      {hasAnyData ? (
                        <div className="text-center">
                          {hasTempData ? (
                            <p className="text-sm font-bold text-green-600">
                              {parseFloat(tempValue).toFixed(1)}°C
                            </p>
                          ) : (
                            <p className="text-xs text-gray-400">--°C</p>
                          )}
                          {hasHumData ? (
                            <p className="text-sm font-bold text-blue-600">
                              {parseFloat(humValue).toFixed(0)}%
                            </p>
                          ) : (
                            <p className="text-xs text-gray-400">--%</p>
                          )}
                        </div>
                      ) : (
                        <Unplug className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Temp/Hum Ambiente
                    </p>
                  </div>
                );
              }
              return null;
            })()}

            {/* Sensores de Humedad del Suelo (siempre mostrar 2 sensores) */}
            {(() => {
              const soilSensors = sensors.filter(
                (s) =>
                  s.variable.includes("soil") ||
                  s.variableFullName.toLowerCase().includes("suelo")
              );

              // Asegurar que siempre se muestren 2 sensores
              const sensorSlots = [
                soilSensors[0] || {
                  variable: "soil1",
                  variableFullName: "Hum suelo 1",
                  unidad: "%",
                },
                soilSensors[1] || {
                  variable: "soil2",
                  variableFullName: "Hum suelo 2",
                  unidad: "%",
                },
              ];

              return sensorSlots.map((sensor, index) => {
                const value = sensorData[sensor.variable];
                const hasData =
                  value !== undefined && value !== null && value >= 0;
                const numericValue = hasData ? parseFloat(value) : 0;

                return (
                  <div
                    key={sensor.variable || `soil-${index}`}
                    className="flex flex-col items-center"
                  >
                    <div
                      className="relative w-24 h-24 rounded-full flex items-center justify-center"
                      style={{
                        background: hasData
                          ? "rgba(76, 182, 73, 0.1)"
                          : "rgba(107, 114, 128, 0.1)",
                        border: hasData
                          ? "3px solid #4CB649"
                          : "3px solid #6b7280",
                      }}
                    >
                      {hasData ? (
                        <>
                          <svg
                            className="absolute w-full h-full"
                            viewBox="0 0 96 96"
                            style={{ transform: "rotate(-90deg)" }}
                          >
                            <circle
                              cx="48"
                              cy="48"
                              r="40"
                              fill="none"
                              stroke="rgba(255,255,255,0.1)"
                              strokeWidth="4"
                            />
                            <circle
                              cx="48"
                              cy="48"
                              r="40"
                              fill="none"
                              stroke="#4CB649"
                              strokeWidth="4"
                              strokeDasharray={`${
                                (numericValue / 100) * 251.2
                              } 251.2`}
                              style={{
                                transition: "stroke-dasharray 0.5s ease",
                              }}
                            />
                          </svg>
                          <div className="text-center z-10">
                            <p className="text-lg font-bold text-green-600">
                              {numericValue.toFixed(0)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {sensor.unidad}
                            </p>
                          </div>
                        </>
                      ) : (
                        <Unplug className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      {sensor.variableFullName}
                    </p>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* Control de actuadores */}
      {actuators.length > 0 && hasReceivedData && (
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Configuración de Actuadores
          </h3>
          <div className="grid grid-cols-2 md:flex md:flex-row md:gap-4 gap-4">
            {actuators.map((actuator) => {
              const isOn = actuatorStates[actuator.variable] || false;

              return (
                <Card key={actuator.variable} className="border-0 md:flex-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base text-left">
                      <Power className="h-5 w-5" />
                      {actuator.variableFullName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Botón de encendido/apagado */}
                    <Button
                      variant={isOn ? "primary" : "outline"}
                      className={
                        "w-full" + (isOn ? " bg-green-600 text-white" : "")
                      }
                      onClick={() => toggleActuator(actuator.variable, isOn)}
                    >
                      <Power className="mr-2 h-4 w-4" />
                      {isOn ? "Apagar" : "Encender"}
                    </Button>

                    {/* Configuración de inicio */}
                    <div className="space-y-1 text-left">
                      <Label className="text-xs text-muted-foreground">
                        Estado al iniciar dispositivo
                      </Label>
                      <Select
                        value={(
                          actuatorConfig[actuator.variable]?.startup || 0
                        ).toString()}
                        onValueChange={(value) =>
                          updateActuatorConfig(
                            actuator.variable,
                            "startup",
                            value
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Apagado</SelectItem>
                          <SelectItem value="1">Encendido</SelectItem>
                          <SelectItem value="3">Timer</SelectItem>
                          <SelectItem value="5">Ciclos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Botón continuar */}
      <div className="flex justify-end">
        <Button
          size="lg"
          disabled={!canContinue}
          onClick={onComplete}
          className="px-8"
        >
          {canContinue ? (
            <>
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Continuar
            </>
          ) : (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Esperando dispositivo...
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default DeviceSetupDashboard;
