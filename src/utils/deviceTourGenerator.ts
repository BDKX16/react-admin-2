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
  const modelName =
    deviceTemplate?.name || deviceTemplate?.model || "Dispositivo IoT";
  const displayName = deviceName || "tu dispositivo";

  steps.push({
    icon: "👋",
    element: '[data-tour="device-config-page"]',
    popover: {
      title: `Configuración de ${displayName}`,
      description: `
        <p>Esta es la página de configuración de tu dispositivo.</p>
        <p>Modelo: <strong>${modelName}</strong></p>
        <p>Aquí puedes personalizar nombres, temporizadores, ubicación y firmware.</p>
      `,
      side: "bottom",
    },
  });

  // Check for switches/controls for timer configuration
  const switches = widgets.filter(
    (w: any) => w?.widgetType === "Switch" || w?.widgetType === "Pump"
  );
  if (switches.length > 0) {
    const switchNames = switches
      .map((s: any) => {
        const name = s?.variableFullName || s?.name || "Actuador";
        return name;
      })
      .filter(Boolean)
      .slice(0, 2)
      .join(", ");

    const displaySwitchNames = switchNames || "Actuador 1, Actuador 2";

    // Timer configuration step
    steps.push({
      icon: "⏰",
      element: '[data-tour="device-timers"]',
      popover: {
        title: "Configuración de Actuadores",
        description: `
          <p>Configura los <strong>${
            switches.length
          } actuador(es)</strong> de tu dispositivo.</p>
          <p>Actuadores: ${displaySwitchNames}${
          switches.length > 2 ? " y más..." : ""
        }</p>
          <p>Puedes establecer el comportamiento inicial al encender:</p>
          <ul>
            <li><strong>Apagado/Encendido:</strong> Estado fijo</li>
            <li><strong>Timer:</strong> Horarios programados</li>
            <li><strong>Ciclos:</strong> Encendido/apagado automático</li>
          </ul>
        `,
        side: "top",
      },
    });
  }

  // Check for sensors
  const sensors = widgets.filter(
    (w: any) => w?.widgetType === "Indicator" && w?.sensor === true
  );

  const sensorCount = sensors?.length || 0;

  // Data storage step
  steps.push({
    icon: "💾",
    element: '[data-tour="device-storage"]',
    popover: {
      title: "Almacenamiento de datos",
      description: `
        <p>Activa el almacenamiento para guardar datos históricos de tus sensores.</p>
        ${
          sensorCount > 0
            ? `<p>Tu dispositivo tiene <strong>${sensorCount} sensor(es)</strong> que pueden registrar datos.</p>`
            : "<p>Si tu dispositivo tiene sensores, sus datos se guardarán aquí.</p>"
        }
        <p>Necesario para visualizar gráficos y analíticas en el dashboard.</p>
      `,
      side: "left",
    },
  });

  // Final step
  steps.push({
    icon: "✅",
    element: '[data-tour="device-config-page"]',
    popover: {
      title: "¡Listo para configurar!",
      description: `
        <p>Ahora puedes personalizar tu dispositivo:</p>
        <ul>
          <li><strong>Cambiar nombre</strong> para identificarlo fácilmente</li>
          <li><strong>Configurar ubicación</strong> para automatizaciones climáticas</li>
          <li><strong>Actualizar firmware (OTA)</strong> para nuevas funciones</li>
          <li><strong>Ajustar comportamiento</strong> de actuadores al encender</li>
        </ul>
        <p>Puedes acceder a estos tutoriales en cualquier momento desde el menú.</p>
      `,
      side: "bottom",
    },
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
      element: '[data-tour="device-config-page"]',
      popover: {
        title: `Configuración de ${deviceName || "dispositivo"}`,
        description: `
          <p>Aquí puedes configurar todas las opciones de tu dispositivo.</p>
          <p>Desde sensores hasta controles y temporizadores.</p>
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
          <p>Activa el almacenamiento de datos de sensores.</p>
          <p>Necesario para ver gráficos históricos.</p>
        `,
        side: "left",
      },
    },
    {
      icon: "⏰",
      element: '[data-tour="device-timers"]',
      popover: {
        title: "Configuración de Actuadores",
        description: `
          <p>Configura el comportamiento de tus actuadores.</p>
          <p>Define modo Timer o Ciclos para automatización.</p>
        `,
        side: "top",
      },
    },
    {
      icon: "✅",
      element: '[data-tour="device-config-page"]',
      popover: {
        title: "¡Todo listo!",
        description: `
          <p>Explora las opciones de configuración disponibles.</p>
          <p>Puedes cambiar nombre, ubicación y actualizar firmware.</p>
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
