import { OnboardingStep } from "../types/onboarding";

/**
 * Generates a dynamic onboarding tour based on device template widgets
 * @param deviceTemplate - The device template containing widgets configuration
 * @param deviceName - Optional device name for personalization
 * @returns Array of onboarding steps
 */
export function generateDeviceTour(
  deviceTemplate: any,
  deviceName?: string
): OnboardingStep[] {
  if (
    !deviceTemplate ||
    !deviceTemplate.widgets ||
    deviceTemplate.widgets.length === 0
  ) {
    // Return basic device tour if no template
    return getBasicDeviceTour(deviceName);
  }

  const steps: OnboardingStep[] = [];
  const widgets = deviceTemplate.widgets;

  // Welcome step
  steps.push({
    icon: "👋",
    title: `Bienvenido a ${deviceName || "tu dispositivo"}`,
    content: `
      <p>Te mostraremos las funcionalidades específicas de este dispositivo.</p>
      <p>Modelo: <strong>${
        deviceTemplate.name || deviceTemplate.model || "Dispositivo IoT"
      }</strong></p>
    `,
    selector: '[data-tour="device-config-page"]',
    side: "bottom",
  });

  // Check for sensors (Indicators)
  const sensors = widgets.filter(
    (w: any) => w.widgetType === "Indicator" && w.sensor === true
  );
  if (sensors.length > 0) {
    const sensorNames = sensors
      .map((s: any) => s.variableFullName || s.name)
      .slice(0, 3)
      .join(", ");

    steps.push({
      icon: "📊",
      title: "Sensores en tiempo real",
      content: `
        <p>Este dispositivo tiene <strong>${
          sensors.length
        } sensor(es)</strong> activos.</p>
        <p>${sensorNames}${sensors.length > 3 ? " y más..." : ""}</p>
        <p>Los valores se actualizan automáticamente vía MQTT.</p>
      `,
      selector: '[data-tour="device-sensors"]',
      side: "top",
    });
  }

  // Check for switches/controls
  const switches = widgets.filter(
    (w: any) => w.widgetType === "Switch" || w.widgetType === "Pump"
  );
  if (switches.length > 0) {
    const switchNames = switches
      .map((s: any) => s.variableFullName || s.name)
      .slice(0, 2)
      .join(", ");

    steps.push({
      icon: "⚡",
      title: "Controles del dispositivo",
      content: `
        <p>Controla <strong>${
          switches.length
        } actuador(es)</strong> desde aquí.</p>
        <p>${switchNames}${switches.length > 2 ? " y más..." : ""}</p>
        <p>Los cambios se aplican instantáneamente.</p>
      `,
      selector: '[data-tour="device-controls"]',
      side: "top",
    });

    // If device has switches, show timer configuration
    steps.push({
      icon: "⏰",
      title: "Temporizadores",
      content: `
        <p>Configura horarios de encendido y apagado automático.</p>
        <p>Perfecto para automatizar riego, luces, ventilación, etc.</p>
      `,
      selector: '[data-tour="device-timers"]',
      side: "top",
    });
  }

  // Check for charts
  const charts = widgets.filter((w: any) => w.widgetType === "Chart");
  if (charts.length > 0) {
    steps.push({
      icon: "📈",
      title: "Gráficos históricos",
      content: `
        <p>Visualiza el historial de datos de tus sensores.</p>
        <p>Analiza tendencias y patrones de comportamiento.</p>
      `,
      selector: '[data-tour="device-charts"]',
      side: "top",
    });
  }

  // Check for growth-specific widgets (temperature + humidity)
  const hasTemperature = sensors.some(
    (s: any) =>
      s.variableFullName?.toLowerCase().includes("temp") ||
      s.name?.toLowerCase().includes("temp")
  );
  const hasHumidity = sensors.some(
    (s: any) =>
      s.variableFullName?.toLowerCase().includes("hum") ||
      s.name?.toLowerCase().includes("hum")
  );

  if (hasTemperature && hasHumidity) {
    steps.push({
      icon: "🌱",
      title: "Dispositivo de cultivo",
      content: `
        <p>Este dispositivo está optimizado para cultivo indoor.</p>
        <p>Monitorea temperatura y humedad para mantener condiciones ideales.</p>
        <p>Puedes configurar ciclos de luz y ventilación.</p>
      `,
      selector: '[data-tour="device-growth-info"]',
      side: "top",
    });
  }

  // Calibration step (if device has sensors)
  if (sensors.length > 0) {
    steps.push({
      icon: "🔧",
      title: "Calibración de sensores",
      content: `
        <p>Ajusta la precisión de tus sensores con factores de calibración.</p>
        <p>Útil para compensar variaciones en las lecturas.</p>
      `,
      selector: '[data-tour="device-calibration"]',
      side: "left",
    });
  }

  // Data storage step
  steps.push({
    icon: "💾",
    title: "Almacenamiento de datos",
    content: `
      <p>Activa el almacenamiento para guardar datos históricos.</p>
      <p>Necesario para visualizar gráficos y analíticas.</p>
    `,
    selector: '[data-tour="device-storage"]',
    side: "left",
  });

  // Advanced settings step
  steps.push({
    icon: "⚙️",
    title: "Configuración avanzada",
    content: `
      <p>Aquí encontrarás opciones adicionales:</p>
      <ul>
        <li>Cambiar nombre del dispositivo</li>
        <li>Actualizar firmware (OTA)</li>
        <li>Configurar ubicación</li>
        <li>Resetear configuración</li>
      </ul>
    `,
    selector: '[data-tour="device-advanced"]',
    side: "left",
  });

  return steps;
}

/**
 * Returns a basic device tour when no template is available
 */
function getBasicDeviceTour(deviceName?: string): OnboardingStep[] {
  return [
    {
      icon: "📱",
      title: `Configuración de ${deviceName || "dispositivo"}`,
      content: `
        <p>Aquí puedes configurar todas las opciones de tu dispositivo.</p>
        <p>Desde sensores hasta controles y temporizadores.</p>
      `,
      selector: '[data-tour="device-config-page"]',
      side: "bottom",
    },
    {
      icon: "📊",
      title: "Monitoreo en tiempo real",
      content: `
        <p>Ve los valores de tus sensores actualizándose en tiempo real.</p>
        <p>Controla tus actuadores con un solo clic.</p>
      `,
      selector: '[data-tour="device-sensors"]',
      side: "top",
    },
    {
      icon: "⏰",
      title: "Automatización",
      content: `
        <p>Configura temporizadores para automatizar tus dispositivos.</p>
        <p>Define horarios de encendido y apagado.</p>
      `,
      selector: '[data-tour="device-timers"]',
      side: "top",
    },
    {
      icon: "⚙️",
      title: "Opciones avanzadas",
      content: `
        <p>Accede a configuración avanzada, calibración y actualizaciones OTA.</p>
      `,
      selector: '[data-tour="device-advanced"]',
      side: "left",
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
