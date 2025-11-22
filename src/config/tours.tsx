import { OnboardingType, OnboardingStep } from "../types/onboarding";
import {
  Home,
  Plus,
  BarChart3,
  Download,
  Settings,
  Smartphone,
  Zap,
  Activity,
  Cog,
  CheckCircle,
  Bell,
  User,
  Calendar,
  PartyPopper,
  Radio,
  Thermometer,
  Sliders,
  GitBranch,
  Network,
  Clock,
  TrendingUp,
  Filter,
  Play,
} from "lucide-react";
import { createElement } from "react";

/**
 * Initial onboarding tour for new users
 * Shows welcome message and basic navigation
 */
export const initialTour: OnboardingStep[] = [
  {
    element: '[data-tour="main-content"]',
    popover: {
      title: "¡Bienvenido a Confi Admin!",
      description:
        "Te daremos un recorrido rápido por las funcionalidades principales de la aplicación. Este panel de administración te permite gestionar todos tus dispositivos IoT de manera centralizada.",
      side: "bottom",
      align: "start",
    },
    icon: createElement(Home, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="add-device-btn"]',
    popover: {
      title: "Agregar dispositivos",
      description:
        "Haz clic aquí para agregar un nuevo dispositivo a tu red. Podrás configurar diferentes tipos de dispositivos según sus capacidades.",
      side: "left",
      align: "start",
    },
    icon: createElement(Plus, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="device-grid"]',
    popover: {
      title: "Monitorea tus dispositivos",
      description:
        "En el dashboard verás todos tus dispositivos en tiempo real. Cada tarjeta muestra el estado, sensores y controles del dispositivo.",
      side: "top",
      align: "start",
    },
    icon: createElement(BarChart3, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="notifications"]',
    popover: {
      title: "Actualizaciones OTA",
      description:
        "Recibe notificaciones cuando haya actualizaciones de firmware disponibles. Podrás actualizar múltiples dispositivos al mismo tiempo de forma inalámbrica.",
      side: "left",
      align: "start",
    },
    icon: createElement(Download, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="settings-menu"]',
    popover: {
      title: "Configuración",
      description:
        "Accede a la configuración desde el menú lateral. Personaliza tu perfil, notificaciones y preferencias del sistema.",
      side: "right",
      align: "start",
    },
    icon: createElement(Settings, { size: 20, className: "inline-block" }),
  },
];

/**
 * Dashboard tour - detailed walkthrough of dashboard features
 */
export const dashboardTour: OnboardingStep[] = [
  {
    element: '[data-tour="main-dashboard"]',
    popover: {
      title: "Panel de Control",
      description:
        "El dashboard es tu centro de control principal. Aquí puedes ver y controlar todos tus dispositivos desde un solo lugar.",
      side: "bottom",
      align: "start",
    },
    icon: createElement(Home, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="device-card"]',
    popover: {
      title: "Tarjetas de dispositivo",
      description:
        "Cada tarjeta representa un dispositivo conectado. Muestra su estado (online/offline), sensores en tiempo real y controles.",
      side: "right",
      align: "start",
    },
    icon: createElement(Smartphone, { size: 20, className: "inline-block" }),
    selector: '[data-tour="device-card"]:first-child',
    side: "top",
  },
  {
    icon: createElement(Zap, { size: 20, className: "inline-block" }),
    title: "Controles rápidos",
    content: `
      <p>Los switches te permiten controlar tus dispositivos directamente.</p>
      <p>Los cambios se aplican en tiempo real vía MQTT.</p>
    `,
    selector: '[data-tour="device-controls"]',
    side: "top",
  },
  {
    icon: createElement(Activity, { size: 20, className: "inline-block" }),
    title: "Sensores y métricas",
    content: `
      <p>Los medidores radiales muestran valores de sensores en tiempo real.</p>
      <p>Temperatura, humedad, corriente, voltaje y más según el dispositivo.</p>
    `,
    selector: '[data-tour="device-sensors"]',
    side: "top",
  },
  {
    icon: createElement(Cog, { size: 20, className: "inline-block" }),
    title: "Configurar dispositivo",
    content: `
      <p>Haz clic en "Configurar" para acceder a opciones avanzadas.</p>
      <p>Podrás ajustar timers, calibración de sensores y más configuraciones específicas.</p>
    `,
    selector: '[data-tour="device-config-btn"]',
    side: "top",
  },
  {
    icon: createElement(Plus, { size: 20, className: "inline-block" }),
    title: "Agregar más dispositivos",
    content: `
      <p>Usa este botón para añadir nuevos dispositivos a tu red.</p>
      <p>Soporta múltiples modelos con diferentes capacidades.</p>
    `,
    selector: '[data-tour="add-device-btn"]',
    side: "left",
  },
];

/**
 * OTA Update tour - explains firmware update process
 */
export const otaTour: OnboardingStep[] = [
  {
    icon: createElement(Download, { size: 20, className: "inline-block" }),
    title: "Actualizaciones OTA",
    content: `
      <p>Las actualizaciones Over-The-Air (OTA) te permiten actualizar el firmware de tus dispositivos de forma inalámbrica.</p>
      <p>Sin necesidad de cables o acceso físico al dispositivo.</p>
    `,
    selector: '[data-tour="ota-modal"]',
    side: "top",
  },
  {
    icon: createElement(CheckCircle, { size: 20, className: "inline-block" }),
    title: "Selecciona dispositivos",
    content: `
      <p>Selecciona los dispositivos que deseas actualizar.</p>
      <p>Puedes actualizar uno o varios dispositivos al mismo tiempo.</p>
      <p>Solo se muestran dispositivos que están online.</p>
    `,
    selector: '[data-tour="ota-device-selector"]',
    side: "top",
  },
  {
    icon: createElement(BarChart3, { size: 20, className: "inline-block" }),
    title: "Monitorea el progreso",
    content: `
      <p>Durante la actualización verás el progreso de cada dispositivo.</p>
      <p>El modal permanecerá abierto hasta que todas las actualizaciones se completen.</p>
    `,
    selector: '[data-tour="ota-progress"]',
    side: "top",
  },
  {
    icon: createElement(Bell, { size: 20, className: "inline-block" }),
    title: "Ocultar notificaciones",
    content: `
      <p>Puedes elegir no ver notificaciones de actualizaciones por 7 días.</p>
      <p>Siempre podrás actualizar manualmente desde el menú de configuración.</p>
    `,
    selector: '[data-tour="ota-hide-checkbox"]',
    side: "top",
  },
];

/**
 * Settings tour - profile and preferences
 */
export const settingsTour: OnboardingStep[] = [
  {
    icon: createElement(Settings, { size: 20, className: "inline-block" }),
    title: "Configuración",
    content: `
      <p>Personaliza la aplicación según tus preferencias.</p>
      <p>Configura tu perfil, notificaciones y opciones del sistema.</p>
    `,
    selector: '[data-tour="settings-page"]',
    side: "bottom",
  },
  {
    icon: createElement(User, { size: 20, className: "inline-block" }),
    title: "Perfil de usuario",
    content: `
      <p>Actualiza tu información personal y credenciales.</p>
      <p>Cambia tu contraseña o actualiza tu correo electrónico.</p>
    `,
    selector: '[data-tour="profile-section"]',
    side: "left",
  },
  {
    icon: createElement(Bell, { size: 20, className: "inline-block" }),
    title: "Notificaciones",
    content: `
      <p>Configura qué notificaciones deseas recibir.</p>
      <p>Actualizaciones de firmware, alertas de dispositivos y más.</p>
    `,
    selector: '[data-tour="notifications-section"]',
    side: "left",
  },
];

/**
 * Analytics tour - data visualization
 */
export const analyticsTour: OnboardingStep[] = [
  {
    icon: createElement(BarChart3, { size: 20, className: "inline-block" }),
    title: "Analíticas",
    content: `
      <p>Visualiza el historial de datos de tus dispositivos.</p>
      <p>Gráficos de consumo, temperatura, humedad y más métricas.</p>
    `,
    selector: '[data-tour="analytics-page"]',
    side: "bottom",
  },
  {
    icon: createElement(Smartphone, { size: 20, className: "inline-block" }),
    title: "Selecciona dispositivo",
    content: `
      <p>Elige el dispositivo del que deseas ver analíticas.</p>
      <p>Cada dispositivo tiene métricas específicas según sus sensores.</p>
    `,
    selector: '[data-tour="device-selector"]',
    side: "top",
  },
  {
    icon: createElement(Calendar, { size: 20, className: "inline-block" }),
    title: "Rango de fechas",
    content: `
      <p>Filtra los datos por período de tiempo.</p>
      <p>Día, semana, mes o rango personalizado.</p>
    `,
    selector: '[data-tour="date-range"]',
    side: "top",
  },
];

/**
 * Device onboarding tour - shown after claiming/adding a device
 */
export const deviceTour: OnboardingStep[] = [
  {
    element: '[data-tour="device-card"]',
    popover: {
      title: "¡Dispositivo agregado!",
      description:
        "Este es tu nuevo dispositivo. Aquí podrás ver su estado en tiempo real, sensores y controles disponibles.",
      side: "top",
      align: "start",
    },
    icon: createElement(PartyPopper, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="device-status"]',
    popover: {
      title: "Estado de conexión",
      description:
        "Este indicador muestra si el dispositivo está conectado (online/verde) o desconectado (offline/rojo). El estado se actualiza en tiempo real.",
      side: "left",
      align: "start",
    },
    icon: createElement(Radio, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="device-card"]',
    popover: {
      title: "Sensores y datos en tiempo real",
      description:
        "En esta sección verás las lecturas de los sensores configurados en tu dispositivo (temperatura, humedad, etc.). Los valores se actualizan automáticamente vía MQTT.",
      side: "bottom",
      align: "start",
    },
    icon: createElement(Thermometer, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="device-controls"]',
    popover: {
      title: "Controles de actuadores",
      description:
        "Usa estos switches para controlar los actuadores de tu dispositivo (luces, bombas, ventiladores, etc.). Los cambios se aplican en tiempo real. Puedes omitir este tour cuando quieras.",
      side: "bottom",
      align: "start",
    },
    icon: createElement(Sliders, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="device-card"]',
    popover: {
      title: "Configuración avanzada",
      description:
        "Haz clic en cualquier parte de la tarjeta para acceder a la configuración completa del dispositivo: automatizaciones, horarios, calibración de sensores y más.",
      side: "top",
      align: "start",
    },
    icon: createElement(Settings, { size: 20, className: "inline-block" }),
  },
];

/**
 * Rules tour - automation rules management
 */
export const rulesTour: OnboardingStep[] = [
  {
    element: '[data-tour="rules-page"]',
    popover: {
      title: "Motor de Reglas",
      description:
        "Aquí puedes crear y gestionar todas las automatizaciones de tus dispositivos. Define reglas simples o workflows complejos para automatizar tu sistema.",
      side: "bottom",
      align: "start",
    },
    icon: createElement(GitBranch, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="automation-type-tabs"]',
    popover: {
      title: "Tipos de automatización",
      description:
        "Elige entre diferentes tipos: Reglas simples (if-then), Horarios recurrentes, y Workflows complejos con nodos visuales.",
      side: "bottom",
      align: "start",
    },
    icon: createElement(Filter, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="create-rule-btn"]',
    popover: {
      title: "Crear nueva regla",
      description:
        "Haz clic aquí para crear una nueva automatización. Podrás elegir condiciones basadas en sensores, tiempo o eventos del sistema.",
      side: "left",
      align: "start",
    },
    icon: createElement(Plus, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="rules-list"]',
    popover: {
      title: "Tus automatizaciones",
      description:
        "Todas tus reglas activas aparecen aquí. Puedes editarlas, activar/desactivar, o eliminarlas. El estado de cada regla se actualiza en tiempo real.",
      side: "top",
      align: "start",
    },
    icon: createElement(Activity, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="rule-toggle"]',
    popover: {
      title: "Activar/desactivar reglas",
      description:
        "Usa estos switches para activar o pausar reglas sin eliminarlas. Útil para temporadas o mantenimiento.",
      side: "left",
      align: "start",
    },
    icon: createElement(Zap, { size: 20, className: "inline-block" }),
  },
];

/**
 * Automation Editor tour - visual workflow builder
 */
export const automationEditorTour: OnboardingStep[] = [
  {
    element: '[data-tour="editor-canvas"]',
    popover: {
      title: "Editor Visual de Workflows",
      description:
        "Crea automatizaciones complejas arrastrando y conectando nodos. Este editor te permite construir lógica avanzada de forma visual e intuitiva.",
      side: "bottom",
      align: "start",
    },
    icon: createElement(Network, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="node-palette"]',
    popover: {
      title: "Paleta de nodos",
      description:
        "Arrastra nodos desde aquí al canvas. Tipos disponibles: Sensores (inputs), Operaciones lógicas, Actuadores (outputs), Timers y más.",
      side: "right",
      align: "start",
    },
    icon: createElement(Plus, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="node-connection"]',
    popover: {
      title: "Conectar nodos",
      description:
        "Arrastra desde el punto de salida de un nodo al punto de entrada de otro para crear conexiones. Los datos fluyen por estas conexiones.",
      side: "bottom",
      align: "start",
    },
    icon: createElement(GitBranch, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="save-workflow-btn"]',
    popover: {
      title: "Guardar workflow",
      description:
        "Guarda tu workflow cuando termines. Puedes editarlo después desde el motor de reglas. Los workflows se ejecutan automáticamente en el servidor.",
      side: "left",
      align: "start",
    },
    icon: createElement(CheckCircle, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="workflow-settings"]',
    popover: {
      title: "Configuración del nodo",
      description:
        "Haz clic en cualquier nodo para ver sus propiedades. Configura umbrales, operadores, delays y más según el tipo de nodo.",
      side: "top",
      align: "start",
    },
    icon: createElement(Cog, { size: 20, className: "inline-block" }),
  },
];

/**
 * Charts tour - data visualization and analytics
 */
export const chartsTour: OnboardingStep[] = [
  {
    element: '[data-tour="charts-dashboard"]',
    popover: {
      title: "Dashboard de Gráficos",
      description:
        "Visualiza y analiza los datos históricos de tus dispositivos. Identifica patrones, tendencias y anomalías en tus lecturas de sensores.",
      side: "bottom",
      align: "start",
    },
    icon: createElement(BarChart3, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="chart-variable-selector"]',
    popover: {
      title: "Seleccionar variables",
      description:
        "Elige qué sensores o variables quieres visualizar. Puedes seleccionar múltiples variables para compararlas en el mismo gráfico.",
      side: "right",
      align: "start",
    },
    icon: createElement(Filter, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="time-range-selector"]',
    popover: {
      title: "Rango de tiempo",
      description:
        "Selecciona el período que quieres analizar: última hora, día, semana, mes o un rango personalizado. Los datos se cargan automáticamente.",
      side: "bottom",
      align: "start",
    },
    icon: createElement(Clock, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="chart-type-selector"]',
    popover: {
      title: "Tipo de gráfico",
      description:
        "Cambia entre diferentes visualizaciones: líneas, barras, áreas. Cada tipo es útil para diferentes análisis de datos.",
      side: "left",
      align: "start",
    },
    icon: createElement(TrendingUp, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="export-data-btn"]',
    popover: {
      title: "Exportar datos",
      description:
        "Exporta tus datos en formato CSV o Excel para análisis externos. Útil para reportes, machine learning o respaldos.",
      side: "left",
      align: "start",
    },
    icon: createElement(Download, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="chart-zoom"]',
    popover: {
      title: "Zoom interactivo",
      description:
        "Haz zoom en áreas específicas del gráfico para análisis detallado. Usa la rueda del mouse o arrastra para seleccionar un área.",
      side: "top",
      align: "start",
    },
    icon: createElement(Activity, { size: 20, className: "inline-block" }),
  },
];

/**
 * Get tour steps by type
 */
export const getTourByType = (type: OnboardingType): OnboardingStep[] => {
  switch (type) {
    case "initial":
      return initialTour;
    case "dashboard":
      return dashboardTour;
    case "device":
      return deviceTour;
    case "ota":
      return otaTour;
    case "settings":
      return settingsTour;
    case "analytics":
      return analyticsTour;
    case "rules":
      return rulesTour;
    case "automation-editor":
      return automationEditorTour;
    case "charts":
      return chartsTour;
    default:
      return [];
  }
};
