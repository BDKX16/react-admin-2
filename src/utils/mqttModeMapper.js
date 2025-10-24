/**
 * Mapeo de modos de actuadores a valores numéricos MQTT
 * Estos valores son los que entiende el ESP32 para cada modo
 *
 * IMPORTANTE: Orden actualizado de modos (Octubre 2025):
 * - 2: Timers OFF
 * - 3: Timers ON
 * - 5: Ciclos
 * - 6: PWM (antes era PID)
 * - 7: PID (antes era PI)
 * - 8: PI (antes era P)
 * - 9: P Proporcional (antes era PWM)
 */

export const MODE_TO_MQTT_VALUE = {
  // Modos básicos
  on: true,
  off: false,

  // Modos avanzados con valores numéricos
  timers_on: 3,
  timers_off: 2,
  timers: 3, // Alias para timers_on
  ciclos: 5,
  cycles: 5, // Alias en inglés
  pwm: 6,
  pwd: 6, // Alias para PWM
  pid: 7,
  pi: 8,
  p: 9,
};

/**
 * Convierte un modo de actuador a su valor MQTT correspondiente
 * @param {string} mode - Modo del actuador (ej: "on", "off", "timers", "pid")
 * @returns {boolean|number} - Valor MQTT correspondiente
 */
export const modeToMqttValue = (mode) => {
  if (!mode) return false;

  const normalizedMode = mode.toLowerCase().trim();

  if (normalizedMode in MODE_TO_MQTT_VALUE) {
    return MODE_TO_MQTT_VALUE[normalizedMode];
  }

  // Si no se encuentra el modo, retornar false por defecto
  console.warn(`Modo desconocido: ${mode}, usando false por defecto`);
  return false;
};

/**
 * Obtiene todos los modos disponibles con sus valores MQTT
 * @returns {Array} - Array de objetos {mode, value, label}
 */
export const getAllModes = () => {
  return [
    { mode: "on", value: true, label: "Encendido (ON)" },
    { mode: "off", value: false, label: "Apagado (OFF)" },
    { mode: "timers_on", value: 3, label: "Timers ON" },
    { mode: "timers_off", value: 2, label: "Timers OFF" },
    { mode: "ciclos", value: 5, label: "Ciclos" },
    { mode: "pwm", value: 6, label: "PWM" },
    { mode: "pid", value: 7, label: "PID" },
    { mode: "pi", value: 8, label: "PI" },
    { mode: "p", value: 9, label: "P" },
  ];
};

/**
 * Convierte un valor MQTT a su modo de actuador correspondiente
 * @param {boolean|number} value - Valor MQTT recibido
 * @returns {string|undefined} - Modo del actuador o undefined si no se encuentra
 */
export const mqttValueToMode = (value) => {
  // Manejar valores booleanos
  if (value === true || value === 1) return "on";
  if (value === false || value === 0) return "off";

  // Manejar valores numéricos
  switch (value) {
    case 2:
      return "timers"; // timers_off también mapea a "timers"
    case 3:
      return "timers"; // timers_on
    case 5:
      return "ciclos";
    case 6:
      return "pwm";
    case 7:
      return "pid";
    case 8:
      return "pi";
    case 9:
      return "p"; // proporcional
    case 10:
      return "pump";
    default:
      console.warn(`Valor MQTT desconocido: ${value}`);
      return undefined;
  }
};

/**
 * Verifica si un modo es válido
 * @param {string} mode - Modo a verificar
 * @returns {boolean} - true si el modo es válido
 */
export const isValidMode = (mode) => {
  if (!mode) return false;
  const normalizedMode = mode.toLowerCase().trim();
  return normalizedMode in MODE_TO_MQTT_VALUE;
};

/**
 * Obtiene el label legible de un modo
 * @param {string} mode - Modo del actuador
 * @returns {string} - Label legible
 */
export const getModeLabel = (mode) => {
  const modeLabels = {
    on: "Encendido",
    off: "Apagado",
    timers_on: "Timers ON",
    timers_off: "Timers OFF",
    timers: "Timers",
    ciclos: "Ciclos",
    cycles: "Ciclos",
    pid: "PID",
    pi: "PI",
    p: "P",
    pwm: "PWM",
    pwd: "PWM",
  };

  return modeLabels[mode?.toLowerCase()] || mode;
};

/**
 * Filtra los modos disponibles basándose en los modos soportados por un widget
 * @param {Array} widgetModes - Array de modos soportados por el widget
 * @returns {Array} - Array de objetos {mode, value, label} filtrados
 */
export const getAvailableModesForWidget = (widgetModes) => {
  if (!widgetModes || !Array.isArray(widgetModes)) {
    return getAllModes();
  }

  const allModes = getAllModes();
  return allModes.filter((modeObj) =>
    widgetModes.some((wm) => wm.toLowerCase() === modeObj.mode.toLowerCase())
  );
};
