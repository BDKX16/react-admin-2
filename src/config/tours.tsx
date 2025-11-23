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
  CheckCircle2,
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
  Menu,
  ArrowLeftRight,
} from "lucide-react";
import { createElement } from "react";

/**
 * Initial onboarding tour for new users
 * Shows welcome message and basic navigation
 */
export const initialTour: OnboardingStep[] = [
  {
    element: '[data-tour="main-dashboard"]',
    popover: {
      title: "Panel de control",
      description:
        "Tu centro de mando. Desde aquí puedes vigilar y ajustar todo lo que ocurre en tu cultivo.",
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
        "Cada uno con su historia. Mira el estado de cada controlador y sus sensores en un vistazo.",
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
        "Acción inmediata. Enciende, apaga o ajusta con un solo toque, y todo se refleja al instante.",
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
        "La ciencia al alcance de tu mano. Temperatura, humedad, voltaje… todo en tiempo real.",
      side: "top",
      align: "start",
    },
    icon: createElement(Activity, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="add-device-btn"]',
    popover: {
      title: "Agregar más dispositivos",
      description:
        "Haz crecer tu red. Suma nuevos controladores y expande tu ecosistema.",
      side: "left",
      align: "start",
    },
    icon: createElement(Plus, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="mobile-app-download"]',
    popover: {
      title: "Descarga la app móvil",
      description:
        "Lleva tu cultivo en el bolsillo. Descarga la aplicación móvil para monitorear y controlar desde cualquier lugar.",
      side: "right",
      align: "start",
    },
    icon: createElement(Download, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="calendar"]',
    popover: {
      title: "Calendario de telemetría",
      description:
        "La memoria de tu cultivo. Consulta el historial de operaciones, eventos importantes y tendencias a lo largo del tiempo.",
      side: "left",
      align: "start",
    },
    icon: createElement(Calendar, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="notifications"]',
    popover: {
      title: "Centro de notificaciones",
      description:
        "Mantente informado. Haz clic en la campana para ver alertas importantes, cambios de estado y actualizaciones de tus dispositivos.",
      side: "left",
      align: "start",
    },
    icon: createElement(Bell, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="team-switcher"]',
    popover: {
      title: "Selector de dispositivo",
      description:
        "Cambia entre dispositivos al instante. Este selector te permite alternar rápidamente entre todos tus controladores.",
      side: "right",
      align: "start",
    },
    icon: createElement(ArrowLeftRight, {
      size: 20,
      className: "inline-block",
    }),
  },
  {
    element: '[data-tour="sidebar-nav"]',
    popover: {
      title: "Menú de navegación",
      description:
        "Todas las herramientas a tu alcance. Dashboard, Dispositivos, Reglas, Gráficos, Configuración y más secciones para gestionar tu operación.",
      side: "right",
      align: "start",
    },
    icon: createElement(Menu, { size: 20, className: "inline-block" }),
  },

  {
    element: '[data-tour="user-account"]',
    popover: {
      title: "Configuración de cuenta",
      description:
        "Tu perfil y preferencias. Accede a tu información personal, cambia el tema, gestiona tu plan y cierra sesión desde aquí.",
      side: "right",
      align: "start",
    },
    icon: createElement(User, { size: 20, className: "inline-block" }),
  },
];

/**
 * OTA Update tour - shows how to update firmware from DeviceConfig page
 */
export const otaTour: OnboardingStep[] = [
  {
    element: '[data-tour="device-config-page"]',
    popover: {
      title: "¿Cómo actualizar?",
      description:
        "Desde esta página de configuración puedes actualizar el firmware de tu dispositivo de forma inalámbrica (OTA - Over The Air).",
      side: "top",
      align: "start",
    },
    icon: createElement(Settings, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="firmware-section"]',
    popover: {
      title: "Sección de Firmware",
      description:
        "Aquí verás tu versión actual de firmware. Si hay una actualización disponible, aparecerá un botón para actualizar.",
      side: "top",
      align: "start",
    },
    icon: createElement(Download, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="ota-update-button"]',
    popover: {
      title: "Actualizar ahora",
      description:
        "Haz clic en este botón cuando haya una actualización disponible. El proceso es automático y podrás ver el progreso en tiempo real.",
      side: "left",
      align: "start",
    },
    icon: createElement(Zap, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="device-config-page"]',
    popover: {
      title: "Mantente actualizado",
      description:
        "Las actualizaciones mejoran funcionalidad y seguridad. Te notificaremos cuando haya nuevas versiones disponibles.",
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
 * Rules tour - automation rules management
 */
export const rulesTour: OnboardingStep[] = [
  {
    element: '[data-tour="rules-page"]',
    popover: {
      title: "¿Qué son las Reglas?",
      description:
        "<p>Imagina tener un asistente que nunca duerme. Las reglas son automatizaciones que trabajan <strong>24/7</strong> para mantener tu cultivo en equilibrio.</p>",
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
        "<p>Tú eliges la estrategia. Desde reglas simples hasta workflows complejos, siempre hay una opción que se adapta a tu forma de trabajar.</p>",
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
        "<p>Un clic y listo. Empieza a diseñar tu propia automatización según lo que necesites.</p>",
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
        '<p>Acciones rápidas y efectivas. <strong>"Si pasa esto → entonces haz aquello"</strong>. Perfecto para respuestas inmediatas de tus sensores.</p>',
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
        "<p>Rutinas confiables. Programa horarios y recurrencias para que tu cultivo siga un ritmo constante.</p>",
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
        "<p>Aquí empieza la magia. Combina condiciones, acciones y lógica avanzada arrastrando nodos de manera intuitiva.</p>",
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
        "<p>Construye tu propio flujo. Encadena acciones, agrega timers y crea lógica avanzada sin complicaciones.</p>",
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
        "<p>Tu caja de herramientas. Triggers, condiciones, utilidades y acciones, todo listo para arrastrar y soltar.</p>",
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
        "<p>El punto de partida. Cada flujo comienza con un disparador: sensor, timer o evento.</p>",
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
        "<p>Decisiones inteligentes. Evalúa datos y dirige el flujo según lo que ocurra.</p>",
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
        "<p>Pequeños trucos, grandes resultados. Delays, conversiones y operaciones que afinan tu lógica.</p>",
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
        "<p>El toque final. Activa dispositivos, envía notificaciones o registra eventos.</p>",
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
        "<p>Ponle identidad. Un buen nombre te ayudará a reconocer y gestionar tus automatizaciones fácilmente.</p>",
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
        "<p>Prueba antes de confiar. Simula tu flujo con datos de prueba y asegúrate de que todo funcione.</p>",
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
        "<p>Hora de ponerlo en marcha. Guarda tu workflow y míralo trabajar en tiempo real.</p>",
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
      title: "¡Tour Completado!",
      description:
        "<p>¡Lo lograste! Ahora dominas las reglas de automatización y puedes crear un cultivo inteligente a tu medida. 🎉</p>",
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
        "<p>Convierte datos en claridad. Aquí verás <strong>la historia completa</strong> de tus sensores y descubrirás patrones ocultos en tiempo real.</p>",
      side: "bottom",
      align: "start",
    },
    icon: createElement(BarChart3, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="time-range-selector"]',
    popover: {
      title: "Selector de Período",
      description:
        "<p>Viaja en el tiempo. Analiza desde <strong>la última hora hasta meses completos</strong> con un simple selector. Cambiar el período actualiza todos los gráficos automáticamente.</p>",
      side: "bottom",
      align: "start",
    },
    icon: createElement(Clock, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="chart-variable-selector"]',
    popover: {
      title: "Filtro de Variables",
      description:
        "<p>Tú decides qué ver. <strong>Activa o desactiva variables</strong> con checkboxes para enfocarte en lo que importa. Compara temperatura, humedad, actuadores y más en el mismo gráfico.</p><ul class='list-disc pl-4 mt-2 text-sm'><li>Sensores: datos continuos</li><li>Actuadores: estados ON/OFF</li><li>Usa 'Todas' o 'Ninguna' para selección rápida</li></ul>",
      side: "left",
      align: "start",
    },
    icon: createElement(Filter, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="chart-timeline"]',
    popover: {
      title: "Timeline Interactivo",
      description:
        "<p>Navega con precisión. <strong>Arrastra los controles</strong> en la barra inferior para hacer zoom y explorar tramos específicos de tiempo sin perder la vista general.</p><p class='text-sm mt-2'>💡 Tip: Perfecto para identificar eventos puntuales o anomalías en períodos largos.</p>",
      side: "top",
      align: "start",
    },
    icon: createElement(Activity, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="chart-legend"]',
    popover: {
      title: "Leyenda y Colores",
      description:
        "<p>Identifica rápido. Cada variable tiene su <strong>color único</strong> y aparece en la leyenda. Click en la leyenda para ocultar/mostrar variables temporalmente.</p>",
      side: "top",
      align: "start",
    },
    icon: createElement(TrendingUp, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="chart-events"]',
    popover: {
      title: "Eventos del Sistema (Solo Pro)",
      description:
        "<p>Los usuarios <strong>Pro</strong> pueden ver eventos importantes del sistema como:</p><ul class='list-disc pl-4 mt-2 space-y-1'><li>Cambios automáticos de setpoint</li><li>Activación/desactivación de actuadores</li><li>Alarmas y notificaciones</li><li>Detalles técnicos con valores de sensores y salidas de control</li></ul><p class='text-sm text-muted-foreground mt-2'>💡 <em>Mejora a Pro para acceder a esta funcionalidad avanzada.</em></p>",
      side: "top",
      align: "start",
    },
    icon: createElement(Bell, { size: 20, className: "inline-block" }),
  },
  {
    element: '[data-tour="charts-dashboard"]',
    popover: {
      title: "Análisis Completo",
      description:
        "<p>Ahora tenés todas las herramientas. <strong>Filtrá, navegá y analizá</strong> tus datos como un profesional. Descubrí patrones, optimizá procesos y tomá decisiones basadas en datos reales. 📊✨</p>",
      side: "bottom",
      align: "start",
    },
    icon: createElement(CheckCircle2, { size: 20, className: "inline-block" }),
  },
];

/**
 * Get tour steps by type
 */
export const getTourByType = (type: OnboardingType): OnboardingStep[] => {
  switch (type) {
    case "initial":
    case "dashboard":
      return initialTour;
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
