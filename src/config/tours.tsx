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
    element: '[data-tour="device-card"]:first-child',
    popover: {
      title: "Tarjetas de dispositivo",
      description:
        "Cada tarjeta representa un dispositivo conectado. Muestra su estado (online/offline), sensores en tiempo real y controles.",
      side: "top",
      align: "start",
    },
    icon: createElement(Smartphone, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="device-controls"]',
    popover: {
      title: "Controles rápidos",
      description:
        "Los switches te permiten controlar tus dispositivos directamente. Los cambios se aplican en tiempo real vía MQTT.",
      side: "top",
      align: "start",
    },
    icon: createElement(Zap, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="device-sensors"]',
    popover: {
      title: "Sensores y métricas",
      description:
        "Los medidores radiales muestran valores de sensores en tiempo real. Temperatura, humedad, corriente, voltaje y más según el dispositivo.",
      side: "top",
      align: "start",
    },
    icon: createElement(Activity, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="device-config-btn"]',
    popover: {
      title: "Configurar dispositivo",
      description:
        'Haz clic en "Configurar" para acceder a opciones avanzadas. Podrás ajustar timers, calibración de sensores y más configuraciones específicas.',
      side: "top",
      align: "start",
    },
    icon: createElement(Cog, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="add-device-btn"]',
    popover: {
      title: "Agregar más dispositivos",
      description:
        "Usa este botón para añadir nuevos dispositivos a tu red. Soporta múltiples modelos con diferentes capacidades.",
      side: "left",
      align: "start",
    },
    icon: createElement(Plus, { size: 20, className: "inline-block" }),
  },
];

/**
 * OTA Update tour - explains firmware update process
 */
export const otaTour: OnboardingStep[] = [
  {
    element: '[data-tour="ota-modal"]',
    popover: {
      title: "Actualizaciones OTA",
      description:
        "Las actualizaciones Over-The-Air (OTA) te permiten actualizar el firmware de tus dispositivos de forma inalámbrica. Sin necesidad de cables o acceso físico al dispositivo.",
      side: "top",
      align: "start",
    },
    icon: createElement(Download, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="ota-device-selector"]',
    popover: {
      title: "Selecciona dispositivos",
      description:
        "Selecciona los dispositivos que deseas actualizar. Puedes actualizar uno o varios dispositivos al mismo tiempo. Solo se muestran dispositivos que están online.",
      side: "top",
      align: "start",
    },
    icon: createElement(CheckCircle, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="ota-progress"]',
    popover: {
      title: "Monitorea el progreso",
      description:
        "Durante la actualización verás el progreso de cada dispositivo. El modal permanecerá abierto hasta que todas las actualizaciones se completen.",
      side: "top",
      align: "start",
    },
    icon: createElement(BarChart3, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="ota-hide-checkbox"]',
    popover: {
      title: "Ocultar notificaciones",
      description:
        "Puedes elegir no ver notificaciones de actualizaciones por 7 días. Siempre podrás actualizar manualmente desde el menú de configuración.",
      side: "top",
      align: "start",
    },
    icon: createElement(Bell, { size: 20, className: "inline-block" }),
  },
];

/**
 * Settings tour - profile and preferences
 */
export const settingsTour: OnboardingStep[] = [
  {
    element: '[data-tour="settings-page"]',
    popover: {
      title: "Configuración",
      description:
        "Personaliza la aplicación según tus preferencias. Configura tu perfil, notificaciones y opciones del sistema.",
      side: "bottom",
      align: "start",
    },
    icon: createElement(Settings, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="profile-section"]',
    popover: {
      title: "Perfil de usuario",
      description:
        "Actualiza tu información personal y credenciales. Cambia tu contraseña o actualiza tu correo electrónico.",
      side: "left",
      align: "start",
    },
    icon: createElement(User, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="notifications-section"]',
    popover: {
      title: "Notificaciones",
      description:
        "Configura qué notificaciones deseas recibir. Actualizaciones de firmware, alertas de dispositivos y más.",
      side: "left",
      align: "start",
    },
    icon: createElement(Bell, { size: 20, className: "inline-block" }),
  },
];

/**
 * Analytics tour - data visualization
 */
export const analyticsTour: OnboardingStep[] = [
  {
    element: '[data-tour="analytics-page"]',
    popover: {
      title: "Analíticas",
      description:
        "Visualiza el historial de datos de tus dispositivos. Gráficos de consumo, temperatura, humedad y más métricas.",
      side: "bottom",
      align: "start",
    },
    icon: createElement(BarChart3, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="device-selector"]',
    popover: {
      title: "Selecciona dispositivo",
      description:
        "Elige el dispositivo del que deseas ver analíticas. Cada dispositivo tiene métricas específicas según sus sensores.",
      side: "top",
      align: "start",
    },
    icon: createElement(Smartphone, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="date-range"]',
    popover: {
      title: "Rango de fechas",
      description:
        "Filtra los datos por período de tiempo. Día, semana, mes o rango personalizado.",
      side: "top",
      align: "start",
    },
    icon: createElement(Calendar, { size: 20, className: "inline-block" }),
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
      title: "¿Qué son las Reglas?",
      description:
        "<p>Las <strong>reglas</strong> son automatizaciones basadas en la nube que permiten controlar las variables de los dispositivos <strong>24/7</strong>.</p><p>Estas funcionarán mientras el dispositivo esté conectado a internet.</p>",
      side: "bottom",
      align: "start",
    },
    icon: createElement(GitBranch, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="automation-type-selector"]',
    popover: {
      title: "Tipos de Reglas",
      description:
        "<p>Existen <strong>3 tipos de reglas</strong>:</p><ul class='space-y-2 mt-2'><li><strong>Reglas Simples</strong>: Condición y acción directa (Si temperatura > 30°C, entonces encender ventilador)</li><li><strong>Reglas Programadas</strong>: Basadas en horarios específicos o recurrentes</li><li><strong>Reglas Compuestas</strong>: Workflows complejos con múltiples condiciones y acciones</li></ul>",
      side: "bottom",
      align: "start",
    },
    icon: createElement(Filter, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="create-rule-btn"]',
    popover: {
      title: "Crear Nueva Regla",
      description:
        "<p>Haz clic aquí para crear una nueva automatización.</p><p class='mt-2'>Podrás elegir el tipo de regla según tus necesidades de automatización.</p>",
      side: "left",
      align: "start",
    },
    icon: createElement(Plus, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="simple-rule-modal"]',
    popover: {
      title: "Reglas Simples",
      description:
        "<p>Las <strong>reglas simples</strong> siguen el patrón <strong>SI-ENTONCES</strong>:</p><ul class='space-y-1 mt-2'><li>✅ Define una <strong>condición</strong> (sensor, valor, operador)</li><li>✅ Establece una <strong>acción</strong> (encender/apagar actuador)</li><li>✅ Configura <strong>cooldown</strong> para evitar múltiples ejecuciones</li></ul><p class='mt-2 text-sm'>Perfectas para automatizaciones reactivas basadas en sensores.</p>",
      side: "bottom",
      align: "start",
    },
    icon: createElement(Zap, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="scheduled-rule-modal"]',
    popover: {
      title: "Reglas Programadas",
      description:
        "<p>Las <strong>reglas programadas</strong> ejecutan acciones en momentos específicos:</p><ul class='space-y-1 mt-2'><li>📅 <strong>Horarios específicos</strong>: Ej. Todos los días a las 19:00</li><li>🔁 <strong>Recurrencias</strong>: Lunes, miércoles y viernes</li><li>📆 <strong>Eventos únicos</strong>: Fechas especiales</li></ul><p class='mt-2 text-sm'>Ideales para rutinas predecibles y horarios fijos.</p>",
      side: "bottom",
      align: "start",
    },
    icon: createElement(Clock, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="composite-rule-option"]',
    popover: {
      title: "Reglas Compuestas - Editor Visual",
      description:
        "<p>Las <strong>reglas compuestas</strong> son workflows complejos creados visualmente:</p><ul class='space-y-1 mt-2'><li><strong>Múltiples condiciones</strong>: Combina varios sensores</li><li><strong>Lógica avanzada</strong>: AND, OR, NOT</li><li><strong>Acciones en cadena</strong>: Secuencias automatizadas</li><li><strong>Editor visual</strong>: Arrastra y conecta nodos</li></ul><p class='mt-3 text-sm text-amber-600 dark:text-amber-400'>A continuación, exploraremos el editor de workflows...</p>",
      side: "bottom",
      align: "start",
    },
    icon: createElement(Network, { size: 20, className: "inline-block" }),
    nextRoute: "/automation-editor?create=true",
  },
  // Continuación del tour en automation-editor
  {
    element: '[data-tour="editor-canvas"]',
    popover: {
      title: "Automatizaciones Complejas",
      description:
        "<p>Las <strong>automatizaciones complejas</strong> son workflows visuales que permiten:</p><ul class='space-y-1 mt-2'><li>Combinar <strong>múltiples condiciones</strong></li><li>Crear <strong>lógica avanzada</strong> (AND, OR, NOT)</li><li>Encadenar <strong>múltiples acciones</strong></li><li>Agregar <strong>delays y timers</strong></li></ul><p class='mt-2 text-sm'><strong>Tutorial en video</strong>: Mira cómo crear tu primer workflow...</p>",
      side: "bottom",
      align: "start",
    },
    icon: createElement(Network, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="node-palette"]',
    popover: {
      title: "Paleta de Nodos",
      description:
        "<p>Arrastra nodos desde la barra lateral al canvas.</p><p class='mt-2'><strong>Categorías disponibles:</strong></p><ul class='space-y-1 mt-1'><li><strong>Triggers</strong>: Sensores, eventos, horarios</li><li><strong>Condiciones</strong>: Comparaciones, lógica</li><li><strong>Utilidades</strong>: Delays, conversiones</li><li><strong>Acciones</strong>: Actuadores, notificaciones</li></ul>",
      side: "left",
      align: "start",
    },
    icon: createElement(Plus, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="trigger-nodes"]',
    popover: {
      title: "Nodos Trigger",
      description:
        "<p>Los <strong>triggers</strong> inician el flujo de trabajo:</p><ul class='space-y-1 mt-2'><li><strong>Sensor</strong>: Lectura de sensores (temperatura, humedad)</li><li><strong>Timer</strong>: Ejecución programada</li><li><strong>Evento</strong>: Cambios de estado del sistema</li><li><strong>Webhook</strong>: Llamadas API externas</li></ul><p class='mt-2 text-sm'>Todo workflow debe comenzar con al menos un trigger.</p>",
      side: "left",
      align: "start",
    },
    icon: createElement(Zap, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="condition-nodes"]',
    popover: {
      title: "Nodos de Condición",
      description:
        "<p>Las <strong>condiciones</strong> evalúan datos y controlan el flujo:</p><ul class='space-y-1 mt-2'><li>🔢 <strong>Comparación</strong>: >, <, =, ≠</li><li>🔀 <strong>Switch</strong>: Múltiples caminos según valor</li><li>🧮 <strong>Operadores lógicos</strong>: AND, OR, NOT</li><li>📏 <strong>Rangos</strong>: Entre valores min/max</li></ul><p class='mt-2 text-sm'>Conecta las salidas true/false a diferentes acciones.</p>",
      side: "left",
      align: "start",
    },
    icon: createElement(GitBranch, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="utility-nodes"]',
    popover: {
      title: "Nodos de Utilidad",
      description:
        "<p>Las <strong>utilidades</strong> transforman y procesan datos:</p><ul class='space-y-1 mt-2'><li><strong>Delay</strong>: Pausas entre acciones</li><li><strong>Debounce</strong>: Evita múltiples disparos</li><li><strong>Matemáticas</strong>: Operaciones aritméticas</li><li><strong>Formato</strong>: Conversión de datos</li></ul><p class='mt-2 text-sm'>Útiles para crear lógica más sofisticada.</p>",
      side: "left",
      align: "start",
    },
    icon: createElement(Cog, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="action-nodes"]',
    popover: {
      title: "Nodos de Acción",
      description:
        "<p>Las <strong>acciones</strong> ejecutan comandos en tus dispositivos:</p><ul class='space-y-1 mt-2'><li><strong>Actuador</strong>: Controlar relés, motores</li><li><strong>Notificación</strong>: Emails, SMS, push</li><li><strong>Log</strong>: Registrar eventos</li><li><strong>HTTP Request</strong>: Llamar APIs externas</li></ul><p class='mt-2 text-sm'>Todo workflow debe terminar con al menos una acción.</p>",
      side: "left",
      align: "start",
    },
    icon: createElement(Play, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="workflow-name"]',
    popover: {
      title: "Nombre del Workflow",
      description:
        "<p>Asigna un <strong>nombre descriptivo</strong> a tu workflow:</p><ul class='space-y-1 mt-2'><li>✅ Ej: 'Ventilación Inteligente'</li><li>✅ Ej: 'Riego Automático con Humedad'</li><li>✅ Ej: 'Control de Temperatura Invernadero'</li></ul><p class='mt-2 text-sm'>Un buen nombre facilita la gestión y mantenimiento.</p>",
      side: "bottom",
      align: "start",
    },
    icon: createElement(CheckCircle, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="simulate-workflow-btn"]',
    popover: {
      title: "Simular Workflow",
      description:
        "<p><strong>Prueba tu workflow</strong> antes de activarlo:</p><ul class='space-y-1 mt-2'><li>Ingresa <strong>valores de prueba</strong></li><li><strong>Visualiza</strong> el flujo de datos</li><li><strong>Verifica</strong> que las condiciones funcionan</li><li><strong>Detecta errores</strong> antes del despliegue</li></ul><p class='mt-2 text-sm text-amber-600 dark:text-amber-400'>Recomendado: Siempre simula antes de guardar.</p>",
      side: "left",
      align: "start",
    },
    icon: createElement(Play, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="save-workflow-btn"]',
    popover: {
      title: "Guardar y Activar",
      description:
        "<p>Cuando estés satisfecho con tu workflow:</p><ul class='space-y-1 mt-2'><li><strong>Guarda</strong> el workflow</li><li>Se desplegará automáticamente en el servidor</li><li>Puedes <strong>editarlo después</strong> desde el motor de reglas</li><li>Monitorea su <strong>ejecución en tiempo real</strong></li></ul><p class='mt-3 text-sm text-amber-600 dark:text-amber-400'>Haz clic en 'Siguiente' para volver al motor de reglas y finalizar el tour...</p>",
      side: "left",
      align: "start",
    },
    icon: createElement(CheckCircle, { size: 20, className: "inline-block" }),
    nextRoute: "/rule-engine",
  },
  // Paso final: volver a rule-engine y mostrar tabla
  {
    element: '[data-tour="rules-list"]',
    popover: {
      title: "¡Tour Completado! - Gestión de Reglas",
      description:
        "<p>¡Excelente! Ahora conoces todas las herramientas de automatización.</p><p class='mt-2'>Todas tus reglas activas aparecen aquí:</p><ul class='space-y-1 mt-2'><li><strong>Visualiza</strong> el estado de cada regla</li><li><strong>Edita</strong> parámetros sin recrear</li><li><strong>Activa/Desactiva</strong> temporalmente</li><li><strong>Elimina</strong> reglas obsoletas</li></ul><p class='mt-2 text-sm'>El estado se actualiza en tiempo real. ¡Comienza a crear tus automatizaciones! 🎉</p>",
      side: "top",
      align: "start",
    },
    icon: createElement(Activity, { size: 20, className: "inline-block" }),
  },
];

/**
 * Automation Editor tour - standalone manual tour (no onboarding tracking)
 */
export const automationEditorTour: OnboardingStep[] = [
  {
    element: '[data-tour="editor-canvas"]',
    popover: {
      title: "Automatizaciones Complejas",
      description:
        "<p>Las <strong>automatizaciones complejas</strong> son workflows visuales que permiten:</p><ul class='space-y-1 mt-2'><li>Combinar <strong>múltiples condiciones</strong></li><li>Crear <strong>lógica avanzada</strong> (AND, OR, NOT)</li><li>Encadenar <strong>múltiples acciones</strong></li><li>Agregar <strong>delays y timers</strong></li></ul><p class='mt-2 text-sm'><strong>Tutorial en video</strong>: Mira cómo crear tu primer workflow...</p>",
      side: "bottom",
      align: "start",
    },
    icon: createElement(Network, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="node-palette"]',
    popover: {
      title: "Paleta de Nodos",
      description:
        "<p>Arrastra nodos desde la barra lateral al canvas.</p><p class='mt-2'><strong>Categorías disponibles:</strong></p><ul class='space-y-1 mt-1'><li><strong>Triggers</strong>: Sensores, eventos, horarios</li><li><strong>Condiciones</strong>: Comparaciones, lógica</li><li><strong>Utilidades</strong>: Delays, conversiones</li><li><strong>Acciones</strong>: Actuadores, notificaciones</li></ul>",
      side: "left",
      align: "start",
    },
    icon: createElement(Plus, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="trigger-nodes"]',
    popover: {
      title: "Nodos Trigger",
      description:
        "<p>Los <strong>triggers</strong> inician el flujo de trabajo:</p><ul class='space-y-1 mt-2'><li><strong>Sensor</strong>: Lectura de sensores (temperatura, humedad)</li><li><strong>Timer</strong>: Ejecución programada</li><li><strong>Evento</strong>: Cambios de estado del sistema</li><li><strong>Webhook</strong>: Llamadas API externas</li></ul><p class='mt-2 text-sm'>Todo workflow debe comenzar con al menos un trigger.</p>",
      side: "left",
      align: "start",
    },
    icon: createElement(Zap, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="condition-nodes"]',
    popover: {
      title: "Nodos de Condición",
      description:
        "<p>Las <strong>condiciones</strong> evalúan datos y controlan el flujo:</p><ul class='space-y-1 mt-2'><li>🔢 <strong>Comparación</strong>: >, <, =, ≠</li><li>🔀 <strong>Switch</strong>: Múltiples caminos según valor</li><li>🧮 <strong>Operadores lógicos</strong>: AND, OR, NOT</li><li>📏 <strong>Rangos</strong>: Entre valores min/max</li></ul><p class='mt-2 text-sm'>Conecta las salidas true/false a diferentes acciones.</p>",
      side: "left",
      align: "start",
    },
    icon: createElement(GitBranch, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="utility-nodes"]',
    popover: {
      title: "Nodos de Utilidad",
      description:
        "<p>Las <strong>utilidades</strong> transforman y procesan datos:</p><ul class='space-y-1 mt-2'><li><strong>Delay</strong>: Pausas entre acciones</li><li><strong>Debounce</strong>: Evita múltiples disparos</li><li><strong>Matemáticas</strong>: Operaciones aritméticas</li><li><strong>Formato</strong>: Conversión de datos</li></ul><p class='mt-2 text-sm'>Útiles para crear lógica más sofisticada.</p>",
      side: "left",
      align: "start",
    },
    icon: createElement(Cog, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="action-nodes"]',
    popover: {
      title: "Nodos de Acción",
      description:
        "<p>Las <strong>acciones</strong> ejecutan comandos en tus dispositivos:</p><ul class='space-y-1 mt-2'><li><strong>Actuador</strong>: Controlar relés, motores</li><li><strong>Notificación</strong>: Emails, SMS, push</li><li><strong>Log</strong>: Registrar eventos</li><li><strong>HTTP Request</strong>: Llamar APIs externas</li></ul><p class='mt-2 text-sm'>Todo workflow debe terminar con al menos una acción.</p>",
      side: "left",
      align: "start",
    },
    icon: createElement(Play, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="workflow-name"]',
    popover: {
      title: "Nombre del Workflow",
      description:
        "<p>Asigna un <strong>nombre descriptivo</strong> a tu workflow:</p><ul class='space-y-1 mt-2'><li>✅ Ej: 'Ventilación Inteligente'</li><li>✅ Ej: 'Riego Automático con Humedad'</li><li>✅ Ej: 'Control de Temperatura Invernadero'</li></ul><p class='mt-2 text-sm'>Un buen nombre facilita la gestión y mantenimiento.</p>",
      side: "bottom",
      align: "start",
    },
    icon: createElement(CheckCircle, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="simulate-workflow-btn"]',
    popover: {
      title: "Simular Workflow",
      description:
        "<p><strong>Prueba tu workflow</strong> antes de activarlo:</p><ul class='space-y-1 mt-2'><li>Ingresa <strong>valores de prueba</strong></li><li><strong>Visualiza</strong> el flujo de datos</li><li><strong>Verifica</strong> que las condiciones funcionan</li><li><strong>Detecta errores</strong> antes del despliegue</li></ul><p class='mt-2 text-sm text-amber-600 dark:text-amber-400'>Recomendado: Siempre simula antes de guardar.</p>",
      side: "left",
      align: "start",
    },
    icon: createElement(Play, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="save-workflow-btn"]',
    popover: {
      title: "Guardar y Activar",
      description:
        "<p>Cuando estés satisfecho con tu workflow:</p><ul class='space-y-1 mt-2'><li><strong>Guarda</strong> el workflow</li><li>Se desplegará automáticamente en el servidor</li><li>Puedes <strong>editarlo después</strong> desde el motor de reglas</li><li>Monitorea su <strong>ejecución en tiempo real</strong></li></ul><p class='mt-2 text-sm'>¡Tu automatización compleja estará lista para funcionar 24/7!</p>",
      side: "left",
      align: "start",
    },
    icon: createElement(CheckCircle, { size: 20, className: "inline-block" }),
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
