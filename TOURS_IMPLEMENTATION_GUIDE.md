/\*\*

- GUÍA DE IMPLEMENTACIÓN - ONBOARDING TOURS
-
- Implementación de los tres nuevos tours:
- 1.  Rules Tour (Motor de Reglas)
- 2.  Automation Editor Tour (Editor de Workflows)
- 3.  Charts Tour (Dashboard de Gráficos)
      \*/

import { useViewOnboarding } from "@/hooks/useViewOnboarding";
import { rulesTour, automationEditorTour, chartsTour } from "@/config/tours";

// ============================================================================
// 1. RULES PAGE (RuleEngine.jsx)
// ============================================================================

/\*\*

- Agregar al inicio del componente RuleEngine
  \*/
  const RuleEngine = () => {
  // ... código existente ...

// Agregar hook de onboarding
useViewOnboarding({
onboardingId: "rules",
steps: rulesTour,
autoStart: true,
});

// ... resto del código ...
};

/\*\*

- Agregar data-tour attributes en RuleEngine.jsx:
  \*/

// En el div principal (línea ~529):
return (

  <div className="flex flex-col items-center p-4" data-tour="rules-page">
    {/* ... contenido ... */}
  </div>
);

// En los tabs de tipo de automatización (buscar MobileAutomationTypeSelector):
// Si existe un componente de tabs/selector, agregar:

<div data-tour="automation-type-tabs">
  {/* Selector de tipo: Simple, Programada, Compuesta */}
</div>

// En el botón de crear regla (buscar donde se abre automationModalOpen):
<Button
data-tour="create-rule-btn"
onClick={() => setAutomationModalOpen(true)}

>   <Plus className="w-4 h-4 mr-2" />
>   Nueva Automatización
> </Button>

// En la lista de reglas (buscar donde se mapean las rules):

<div data-tour="rules-list">
  {rules.map((rule) => (
    <Card key={rule._id}>
      {/* Contenido de la regla */}
    </Card>
  ))}
</div>

// En algún switch de activar/desactivar regla:
<Switch
data-tour="rule-toggle"
checked={rule.enabled}
onCheckedChange={() => toggleRule(rule.\_id)}
/>

// ============================================================================
// 2. AUTOMATION EDITOR PAGE (AutomationEditor.jsx)
// ============================================================================

/\*\*

- Agregar al inicio del componente AutomationEditor
  \*/
  const AutomationEditor = () => {
  // ... código existente ...

// Agregar hook de onboarding
useViewOnboarding({
onboardingId: "automation-editor",
steps: automationEditorTour,
autoStart: true,
});

// ... resto del código ...
};

/\*\*

- Agregar data-tour attributes en AutomationEditor.jsx:
  \*/

// En el div principal del editor (línea ~138):

<div
  className="w-full -mx-4 -mb-4 -pl-4 border-t"
  style={{ height: "20dvh" }}
  data-tour="editor-canvas"
>
  <NodeWorkspace
    selectedDevice={selectedDevice}
    initialData={automationData}
    onSave={handleSave}
    onChange={handleWorkspaceChange}
    userId={auth?.userData?._id}
  />
</div>

/\*\*

- Agregar data-tour attributes en NodeWorkspace.jsx:
  \*/

// En la paleta de nodos (buscar el panel lateral con nodos disponibles):

<div data-tour="node-palette" className="node-palette">
  {/* Lista de nodos arrastrables */}
</div>

// En el área de conexiones o ejemplo de conexión:

<div data-tour="node-connection">
  {/* Ejemplo de handle o punto de conexión */}
</div>

// En el botón de guardar (buscar Save button):
<Button
data-tour="save-workflow-btn"
onClick={handleSave}

>   <Save className="w-4 h-4 mr-2" />
>   Guardar Workflow
> </Button>

// En el panel de configuración de nodo:

<div data-tour="workflow-settings" className="node-settings-panel">
  {/* Panel de propiedades del nodo seleccionado */}
</div>

// ============================================================================
// 3. CHARTS PAGE (ChartDashboard.jsx)
// ============================================================================

/\*\*

- Agregar al inicio del componente ChartDashboard
  \*/
  const ChartDashboard = () => {
  const { selectedDevice } = useDevices();

// Agregar hook de onboarding
useViewOnboarding({
onboardingId: "charts",
steps: chartsTour,
autoStart: true,
});

return (
<div className="p-2 md:p-4">
<div
        className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min overflow-hidden"
        data-tour="charts-dashboard"
      >
{selectedDevice && <Chart device={selectedDevice} />}
</div>
</div>
);
};

/\*\*

- Agregar data-tour attributes en Chart.jsx (componente interno):
  \*/

// En el selector de variables (buscar dropdown/select de variables):
<Select data-tour="chart-variable-selector">
<SelectTrigger>
<SelectValue placeholder="Seleccionar variable" />
</SelectTrigger>
<SelectContent>
{variables.map((variable) => (
<SelectItem key={variable.id} value={variable.id}>
{variable.name}
</SelectItem>
))}
</SelectContent>
</Select>

// En el selector de rango de tiempo:

<div data-tour="time-range-selector" className="flex gap-2">
  <Button variant="outline" onClick={() => setRange("1h")}>
    1 Hora
  </Button>
  <Button variant="outline" onClick={() => setRange("24h")}>
    24 Horas
  </Button>
  <Button variant="outline" onClick={() => setRange("7d")}>
    7 Días
  </Button>
  {/* ... más opciones ... */}
</div>

// En el selector de tipo de gráfico:
<Select data-tour="chart-type-selector">
<SelectTrigger>
<SelectValue placeholder="Tipo de gráfico" />
</SelectTrigger>
<SelectContent>
<SelectItem value="line">Líneas</SelectItem>
<SelectItem value="bar">Barras</SelectItem>
<SelectItem value="area">Área</SelectItem>
</SelectContent>
</Select>

// En el botón de exportar:
<Button data-tour="export-data-btn" onClick={handleExport}>
<Download className="w-4 h-4 mr-2" />
Exportar Datos
</Button>

// En el contenedor del gráfico (para zoom):

<div
  data-tour="chart-zoom"
  className="chart-container"
  onWheel={handleZoom}
>
  <ResponsiveContainer width="100%" height={400}>
    <LineChart data={chartData}>
      {/* ... configuración del gráfico ... */}
    </LineChart>
  </ResponsiveContainer>
</div>

// ============================================================================
// RESUMEN DE CAMBIOS NECESARIOS
// ============================================================================

/\*\*

- 1.  RuleEngine.jsx:
- - Importar: useViewOnboarding, rulesTour
- - Agregar hook al inicio del componente
- - Agregar 5 data-tour attributes
-
- 2.  AutomationEditor.jsx:
- - Importar: useViewOnboarding, automationEditorTour
- - Agregar hook al inicio del componente
- - Agregar 1 data-tour attribute en el div principal
-
- 3.  NodeWorkspace.jsx (si existe):
- - Agregar 4 data-tour attributes en componentes internos
-
- 4.  ChartDashboard.jsx:
- - Importar: useViewOnboarding, chartsTour
- - Agregar hook al inicio del componente
- - Agregar 1 data-tour attribute en el div principal
-
- 5.  Chart.jsx (componente interno):
- - Agregar 5 data-tour attributes en controles del gráfico
    \*/

// ============================================================================
// EJEMPLO COMPLETO - RuleEngine.jsx
// ============================================================================

// Al inicio del archivo, agregar imports:
import { useViewOnboarding } from "@/hooks/useViewOnboarding";
import { rulesTour } from "@/config/tours";

const RuleEngine = () => {
const navigate = useNavigate();
const { loading, callEndpoint } = useFetchAndLoad();
const { selectedDevice } = useDevices();
const { planData, isPro, isPlus } = useSubscription();

// ... todo el código de estados existente ...

// Agregar hook de onboarding
useViewOnboarding({
onboardingId: "rules",
steps: rulesTour,
autoStart: true,
});

// ... resto del código del componente ...

return (
<div className="flex flex-col items-center p-4" data-tour="rules-page">
<h1 className="text-2xl font-bold mb-2 text-left">Control Automático</h1>
{/_ ... resto del JSX ... _/}
</div>
);
};

export default RuleEngine;
