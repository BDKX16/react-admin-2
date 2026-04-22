import { OnboardingStep } from "../types/onboarding";
import { createElement } from "react";
import {
  Home,
  Sprout,
  Zap,
  Activity,
  Database,
  CheckCircle,
  Thermometer,
  Droplets,
  Wind,
  Gauge,
} from "lucide-react";

/**
 * Generates a dynamic onboarding tour based on device model and template
 * @param deviceTemplate - The device template containing widgets configuration
 * @param deviceName - Optional device name for personalization
 * @param modelId - Model identifier to determine tour type
 * @returns Array of onboarding steps
 */
export function generateDeviceTour(
  deviceTemplate: any,
  deviceName?: string,
  modelId?: string
): OnboardingStep[] {
  // Determine if it's TecMat, ConfiPlant, or ConfiHydro
  const isTecMat = modelId === "tecmat";
  const isConfiHydro = modelId === "confi_hydro";
  const isConfiPlant =
    modelId?.startsWith("default") ||
    modelId === "confi-plant" ||
    modelId === "hidroponics";

  if (isTecMat) {
    return getTecMatTour(deviceTemplate, deviceName);
  } else if (isConfiHydro) {
    return getConfiHydroTour(deviceTemplate, deviceName);
  } else if (isConfiPlant) {
    return getConfiPlantTour(deviceTemplate, deviceName);
  }

  // Fallback to basic tour
  return getBasicDeviceTour(deviceName);
}

/**
 * TecMat Tour - Generic sensor and actuator control
 */
function getTecMatTour(
  deviceTemplate: any,
  deviceName?: string
): OnboardingStep[] {
  const displayName = deviceName || "tu TecMat";
  const widgets = deviceTemplate?.widgets || [];

  // Count sensors and actuators
  const sensors = widgets.filter(
    (w: any) => w?.widgetType === "Indicator" && w?.sensor === true
  );
  const actuators = widgets.filter(
    (w: any) => w?.widgetType === "Switch" || w?.widgetType === "Pump"
  );

  return [
    {
      element: '[data-tour="device-card"]:first-child',
      popover: {
        title: "Bienvenida Personalizada",
        description: `<div class="space-y-3">
          <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=200&fit=crop" alt="Industrial Control" class="w-full h-32 object-cover rounded-lg mb-2" />
          <p>Este es <strong>${displayName}</strong>, tu centro de control industrial. Monitorea sensores, controla actuadores y ajusta parámetros en tiempo real para tus procesos.</p>
        </div>`,
        side: "top",
        align: "start",
      },
      icon: createElement(Home, { size: 20, className: "inline-block" }),
    },
    {
      element: '[data-tour="device-sensors"]',
      popover: {
        title: "Sensores en Tiempo Real",
        description: `Visualiza todas tus variables de proceso al instante. ${
          sensors.length > 0
            ? `Tienes ${sensors.length} sensor(es) configurado(s): temperatura, presión, nivel, y más.`
            : "Configura sensores para monitorear tus variables críticas."
        }`,
        side: "top",
        align: "start",
      },
      icon: createElement(Activity, { size: 20, className: "inline-block" }),
    },
    {
      element: '[data-tour="device-controls"]',
      popover: {
        title: "Control de Actuadores",
        description: `<div class="space-y-3">
          <p>Tú decides cómo opera tu sistema. ${
            actuators.length > 0
              ? `Controla ${actuators.length} actuador(es): motores, válvulas, relés. `
              : ""
          }Configura ciclos automáticos, horarios y secuencias de operación.</p>
        </div>`,
        side: "top",
        align: "start",
      },
      icon: createElement(Zap, { size: 20, className: "inline-block" }),
    },
    {
      element: '[data-tour="mode-selector"]',
      popover: {
        title: "Modos de Control Disponibles",
        description: `<div class="space-y-2">
          <p class="font-medium mb-2">Elegí cómo controlar cada actuador:</p>
          <ul class="space-y-1 text-sm">
            <li><strong>On/Off:</strong> Control manual directo</li>
            <li><strong>Timer:</strong> Programa horarios de encendido/apagado</li>
            <li><strong>Ciclo:</strong> Ejecuta ciclos automáticos (ej: 5min ON, 10min OFF)</li>
            <li><strong>PWM ✨:</strong> Control de potencia variable (0-100%)</li>
            <li><strong>PID ✨:</strong> Control automático inteligente con feedback</li>
          </ul>
          <p class="text-xs text-muted-foreground mt-2">Los modos con ✨ requieren Plan Plus</p>
        </div>`,
        side: "top",
        align: "start",
      },
      icon: createElement(Gauge, { size: 20, className: "inline-block" }),
    },
    {
      element: '[data-tour="device-config-btn"]',
      popover: {
        title: "Almacenamiento y Análisis",
        description:
          "Guarda el historial de tus procesos. Activa el registro de datos para análisis, gráficas de tendencias y optimización de operaciones.",
        side: "top",
        align: "start",
      },
      icon: createElement(Database, { size: 20, className: "inline-block" }),
    },
    {
      element: '[data-tour="device-card"]:first-child',
      popover: {
        title: "Sistema Listo",
        description:
          "Todo configurado. Personaliza alertas, actualiza firmware y ajusta comportamientos. Tu TecMat está listo para controlar tus procesos de forma eficiente. ✅",
        side: "top",
        align: "start",
      },
      icon: createElement(CheckCircle, {
        size: 20,
        className: "inline-block",
      }),
    },
  ];
}

/**
 * ConfiHydro Tour - Specialized for hydroponic cultivation
 */
function getConfiHydroTour(
  deviceTemplate: any,
  deviceName?: string
): OnboardingStep[] {
  const displayName = deviceName || "tu Sistema Hidropónico";
  const widgets = deviceTemplate?.widgets || [];

  // Check for specific hydroponic sensors
  const hasPHSensor = widgets.some(
    (w: any) =>
      w?.sensor &&
      (w?.variableFullName?.toLowerCase().includes("ph") ||
        w?.name?.toLowerCase().includes("ph"))
  );
  const hasWaterTempSensor = widgets.some(
    (w: any) =>
      w?.sensor &&
      (w?.variableFullName?.toLowerCase().includes("temp agua") ||
        w?.variableFullName?.toLowerCase().includes("temp water") ||
        w?.name?.toLowerCase().includes("temperatura del agua"))
  );

  return [
    {
      element: '[data-tour="device-card"]:first-child',
      popover: {
        title: "Bienvenida a la Hidroponía Inteligente",
        description: `<div class="space-y-3">
          <img src="https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&h=200&fit=crop" alt="Hydroponic System" class="w-full h-32 object-cover rounded-lg mb-2" />
          <p>Este es <strong>${displayName}</strong>, tu control centralizado para cultivo hidropónico. Monitorea pH, temperatura del agua, ambiente y controla tu sistema de riego con precisión botánica.</p>
        </div>`,
        side: "top",
        align: "start",
      },
      icon: createElement(Droplets, { size: 20, className: "inline-block" }),
    },
    {
      element: '[data-tour="device-sensors"]',
      popover: {
        title: "Sensores Especializados",
        description: `<div class="space-y-2">
          <p class="font-medium mb-2">Monitoreo completo de tu sistema:</p>
          <ul class="space-y-1 text-sm">
            <li><strong>🌡️ Temperatura ambiente:</strong> Control del clima del cultivo</li>
            <li><strong>💧 Humedad ambiente:</strong> Previene estrés hídrico</li>
            ${
              hasWaterTempSensor
                ? "<li><strong>🌊 Temperatura del agua:</strong> Crítica para absorción de nutrientes</li>"
                : ""
            }
            ${
              hasPHSensor
                ? "<li><strong>⚗️ pH del agua:</strong> Esencial para disponibilidad de nutrientes (ideal 5.5-6.5)</li>"
                : ""
            }
          </ul>
          <p class="text-xs text-muted-foreground mt-2">Todos en tiempo real</p>
        </div>`,
        side: "top",
        align: "start",
      },
      icon: createElement(Activity, { size: 20, className: "inline-block" }),
    },
    {
      element: '[data-tour="device-controls"]',
      popover: {
        title: "Control de Bomba Hidropónica",
        description: `<div class="space-y-3">
          <p>Controla tu bomba según el sistema hidropónico que uses:</p>
          <ul class="space-y-1 text-sm">
            <li><strong>Eco:</strong> Ahorro de energía (10/20 min)</li>
            <li><strong>Normal:</strong> Para torres verticales (15/15 min)</li>
            <li><strong>NFT:</strong> Flujo casi continuo (20/5 min)</li>
            <li><strong>DWC:</strong> Oxigenación equilibrada (30/30 min)</li>
            <li><strong>Aeropónico:</strong> Nebulización frecuente (30 seg ON)</li>
            <li><strong>Silencio:</strong> Modo nocturno bajo ruido</li>
            <li><strong>Personalizado:</strong> Configura tus propios ciclos</li>
          </ul>
          <p class="text-xs text-muted-foreground mt-2">Además, controla luces y otros dispositivos con el segundo enchufe</p>
        </div>`,
        side: "top",
        align: "start",
      },
      icon: createElement(Zap, { size: 20, className: "inline-block" }),
    },
    {
      element: '[data-tour="device-config-btn"]',
      popover: {
        title: "Historial y Análisis",
        description:
          "Activa el almacenamiento de datos para ver tendencias de pH, temperatura y ajustar tu sistema. El pH del agua es crítico: debe mantenerse entre 5.5-6.5 para óptima absorción de nutrientes.",
        side: "top",
        align: "start",
      },
      icon: createElement(Database, { size: 20, className: "inline-block" }),
    },
    {
      element: '[data-tour="device-card"]:first-child',
      popover: {
        title: "Sistema Hidropónico Listo",
        description: `<div class="space-y-2">
          <p>Todo configurado para tu cultivo sin suelo. Recuerda:</p>
          <ul class="text-xs space-y-1 mt-2">
            <li>• Revisa el pH diariamente</li>
            <li>• Temperatura del agua ideal: 18-22°C</li>
            <li>• Ajusta el modo de bomba según tu sistema</li>
            <li>• Monitorea humedad para prevenir hongos</li>
          </ul>
          <p class="text-sm mt-2">Tu ConfiHydro está listo para optimizar tu cosecha. 🌱✅</p>
        </div>`,
        side: "top",
        align: "start",
      },
      icon: createElement(CheckCircle, {
        size: 20,
        className: "inline-block",
      }),
    },
  ];
}

/**
 * ConfiPlant Tour - Specialized for growing/cultivation with VPD, Dew Point, CO2
 */
function getConfiPlantTour(
  deviceTemplate: any,
  deviceName?: string
): OnboardingStep[] {
  const displayName = deviceName || "tu Confi Plant";
  const widgets = deviceTemplate?.widgets || [];

  // Check for specific cultivation sensors
  const hasTempSensor = widgets.some(
    (w: any) =>
      w?.sensor &&
      (w?.variableFullName?.toLowerCase().includes("temp") ||
        w?.name?.toLowerCase().includes("temp"))
  );
  const hasHumiditySensor = widgets.some(
    (w: any) =>
      w?.sensor &&
      (w?.variableFullName?.toLowerCase().includes("hum") ||
        w?.name?.toLowerCase().includes("hum"))
  );
  const hasCO2Sensor = widgets.some(
    (w: any) =>
      w?.sensor &&
      (w?.variableFullName?.toLowerCase().includes("co2") ||
        w?.name?.toLowerCase().includes("co2"))
  );

  return [
    {
      element: '[data-tour="device-card"]:first-child',
      popover: {
        title: "Bienvenida al Cultivo Inteligente",
        description: `<div class="space-y-3">
          <img src="https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400&h=200&fit=crop" alt="Smart Growing" class="w-full h-32 object-cover rounded-lg mb-2" />
          <p>Este es <strong>${displayName}</strong>, único como tu cultivo. Optimiza temperatura, humedad, iluminación y CO₂ para alcanzar el máximo potencial de tus plantas. Configura nombre, ubicación y personaliza cada detalle.</p>
        </div>`,
        side: "top",
        align: "start",
      },
      icon: createElement(Sprout, { size: 20, className: "inline-block" }),
    },
    {
      element: '[data-tour="device-sensors"]',
      popover: {
        title: "Ciencia del Cultivo en Tiempo Real",
        description: `<div class="space-y-3">
          <img src="https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&h=200&fit=crop" alt="Plant Monitoring" class="w-full h-32 object-cover rounded-lg mb-2" />
          <p>Monitorea las variables clave de tu cultivo: ${
            hasTempSensor ? "🌡️ Temperatura" : ""
          } ${hasHumiditySensor ? "💧 Humedad" : ""} ${
          hasCO2Sensor ? "🌬️ CO₂" : ""
        }.</p>
          ${
            hasTempSensor && hasHumiditySensor
              ? '<p class="text-sm">El sistema calcula automáticamente <strong>VPD</strong> (Déficit de Presión de Vapor) y <strong>Punto de Rocío</strong>, fundamentales para transpiración óptima y prevención de moho.</p>'
              : ""
          }
          ${
            hasCO2Sensor
              ? '<p class="text-sm">El CO₂ potencia la fotosíntesis: niveles de 800-1200 ppm aumentan el rendimiento hasta 30%.</p>'
              : ""
          }
        </div>`,
        side: "top",
        align: "start",
      },
      icon: createElement(Activity, { size: 20, className: "inline-block" }),
    },
    {
      element: '[data-tour="device-controls"]',
      popover: {
        title: "Control del Ambiente Perfecto",
        description: `<div class="space-y-2">
            <p>Tú decides cómo reacciona tu cultivo. Ajusta luces (ciclos día/noche), ventilación (control de humedad y temperatura) y extractores. Programa ciclos, temporizadores y automatizaciones basadas en los sensores.</p>
          </div>`,
        side: "top",
        align: "start",
      },
      icon: createElement(Wind, { size: 20, className: "inline-block" }),
    },
    {
      element: '[data-tour="mode-selector"]',
      popover: {
        title: "Modos de Control para Cultivo",
        description: `<div class="space-y-2">
          <img src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=200&fit=crop" alt="Growing Control" class="w-full h-32 object-cover rounded-lg mb-2" />
          <p class="font-medium mb-2">Elegí cómo controlar cada elemento:</p>
          <ul class="space-y-1 text-sm">
            <li><strong>On/Off:</strong> Control manual directo de luces, ventiladores</li>
            <li><strong>Timer:</strong> Programa ciclos día/noche (ej: 18h ON, 6h OFF)</li>
            <li><strong>Ciclo:</strong> Ciclos repetitivos y ventilación intermitente</li>
            <li><strong>PID, PI, P✨:</strong> Mantiene temperatura/humedad perfecta automáticamente</li>
          </ul>
          <p class="text-xs text-muted-foreground mt-2">Los modos con ✨ requieren Plan Plus o superior</p>
        </div>`,
        side: "top",
        align: "start",
      },
      icon: createElement(Gauge, { size: 20, className: "inline-block" }),
    },
    {
      element: '[data-tour="device-config-btn"]',
      popover: {
        title: "Memoria de Tu Cultivo",
        description:
          "Guarda cada momento de crecimiento. Activa el registro histórico para ver gráficas de VPD, tendencias de temperatura/humedad, y analizar ciclos completos. Aprende de cada cultivo y perfecciona tu técnica basándote en datos reales.",
        side: "top",
        align: "start",
      },
      icon: createElement(Database, { size: 20, className: "inline-block" }),
    },
    {
      element: '[data-tour="device-card"]:first-child',
      popover: {
        title: "Cultivo de Máxima Eficiencia",
        description:
          "Todo listo para cultivar al siguiente nivel. Personaliza alertas de VPD, actualiza firmware con nuevas funciones, y ajusta automatizaciones inteligentes. Tu Confi Plant está preparado para maximizar rendimiento, calidad y eficiencia. 🌱✅",
        side: "top",
        align: "start",
      },
      icon: createElement(CheckCircle, {
        size: 20,
        className: "inline-block",
      }),
    },
  ];
}

/**
 * Returns a basic device tour when no template is available
 */
function getBasicDeviceTour(deviceName?: string): OnboardingStep[] {
  return [
    {
      icon: "📱",
      element: '[data-tour="device-config-page"]',
      popover: {
        title: `Configuración de ${deviceName || "dispositivo"}`,
        description: `
          <p>Este es tu dispositivo, único como tu cultivo. Configura nombre, temporizadores y ubicación fácilmente.</p>
        `,
        side: "bottom",
      },
    },
    {
      icon: "💾",
      element: '[data-tour="device-storage"]',
      popover: {
        title: "Almacenamiento de datos",
        description: `
          <p>Guarda la memoria de tu cultivo. Activa el registro histórico para ver gráficas y analíticas después.</p>
        `,
        side: "left",
      },
    },
    {
      icon: "⏰",
      element: '[data-tour="device-timers"]',
      popover: {
        title: "Actuadores",
        description: `
          <p>Tú decides cómo reaccionan. Ajusta luces, bombas o ventiladores con timers y ciclos automáticos.</p>
        `,
        side: "top",
      },
    },
    {
      icon: "✅",
      element: '[data-tour="device-config-page"]',
      popover: {
        title: "Todo listo.",
        description: `
          <p>Personaliza, actualiza firmware y ajusta comportamientos. Tu dispositivo está preparado para trabajar contigo. ✅</p>
        `,
        side: "bottom",
      },
    },
  ];
}

/**
 * Helper to check if user should see device-model onboarding
 * @param deviceModel - Model/template identifier
 * @returns true if this is a new model for the user
 */
export function shouldShowDeviceModelTour(
  userId: string,
  deviceModel: string
): boolean {
  const storageKey = `onboarding_${userId}`;
  const stored = localStorage.getItem(storageKey);

  if (!stored) return true;

  try {
    const data = JSON.parse(stored);
    const completedModels = data.completedTours?.deviceModels || {};
    return !completedModels[deviceModel];
  } catch {
    return true;
  }
}
