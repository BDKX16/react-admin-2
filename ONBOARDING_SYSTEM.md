# Sistema de Onboarding por Vista

Sistema completo de onboarding que permite gestionar tutoriales individuales para cada vista de la aplicación.

## 🎯 Características

- ✅ Onboarding por vista (array de enums en lugar de flag único)
- ✅ Persistencia en base de datos
- ✅ Auto-start configurable
- ✅ Hook personalizado `useViewOnboarding`
- ✅ Actualización automática al iniciar sesión
- ✅ Skip/Complete actualiza backend automáticamente

## 📦 Estructura

```
backend/
├── models/user.js          # Modelo con array completedOnboardings
└── routes/users.js         # Endpoints GET/PATCH /onboardings

frontend/
├── services/
│   └── onboardingService.ts    # Servicios API
├── contexts/
│   └── OnboardingContext.tsx   # Context provider
├── hooks/
│   └── useViewOnboarding.ts    # Hook personalizado
├── types/
│   └── onboarding.ts           # TypeScript types
└── examples/
    └── onboarding-usage-examples.tsx  # Ejemplos de uso
```

## 🚀 Uso Básico

### 1. Implementar en una vista

```tsx
import { useViewOnboarding } from "@/hooks/useViewOnboarding";

const MyPage = () => {
  const { startTour } = useViewOnboarding({
    onboardingId: "nodes", // ID único de la vista
    steps: [
      {
        element: "#my-element",
        popover: {
          title: "Bienvenido",
          description: "Este es el tutorial",
        },
      },
    ],
    autoStart: true, // Muestra automáticamente si no completó
  });

  return (
    <div>
      <div id="my-element">Contenido</div>
      <Button onClick={startTour}>Ver Tutorial</Button>
    </div>
  );
};
```

### 2. IDs de Onboarding Disponibles

```typescript
type OnboardingId =
  | "inicio" // Tour inicial/bienvenida
  | "dashboard" // Vista principal
  | "devices" // Gestión dispositivos
  | "nodes" // Editor Node-RED
  | "ota" // Actualizaciones OTA
  | "settings" // Configuración
  | "analytics" // Analíticas/reportes
  | "rules" // Motor de reglas y automatizaciones
  | "automation-editor" // Editor visual de workflows
  | "charts"; // Dashboard de gráficos
```

## 🔧 API del Hook

```typescript
const {
  isCompleted,    // ¿Ya completó este onboarding?
  shouldShow,     // ¿Debe mostrarse ahora?
  startTour,      // Iniciar tour manualmente
  completeTour,   // Completar y guardar en backend
  skipTour,       // Saltar y marcar como completado
} = useViewOnboarding({
  onboardingId: "nodes",
  steps: [...],
  autoStart: true,
  onComplete: () => {},
  onSkip: () => {},
});
```

## 📡 Endpoints Backend

### GET /api/onboardings

Obtiene array de onboardings completados del usuario

**Request:**

```bash
GET /api/onboardings
Authorization: Bearer <token>
```

**Response:**

```json
{
  "status": "success",
  "completedOnboardings": ["inicio", "dashboard", "devices"]
}
```

### PATCH /api/onboardings

Agrega un onboarding al array de completados

**Request:**

```bash
PATCH /api/onboardings
Authorization: Bearer <token>
Content-Type: application/json

{
  "onboardingId": "nodes"
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Onboarding completed",
  "completedOnboardings": ["inicio", "dashboard", "devices", "nodes"]
}
```

## 🎨 Ejemplos de Uso

### Auto-start al entrar a la vista

```tsx
useViewOnboarding({
  onboardingId: "nodes",
  steps: nodesTourSteps,
  autoStart: true, // Se muestra automáticamente
});
```

### Manual (botón de ayuda)

```tsx
const { startTour } = useViewOnboarding({
  onboardingId: "settings",
  steps: settingsSteps,
  autoStart: false, // No se muestra automáticamente
});

return <Button onClick={startTour}>¿Necesitas ayuda?</Button>;
```

### Con callbacks personalizados

```tsx
useViewOnboarding({
  onboardingId: "ota",
  steps: otaSteps,
  autoStart: true,
  onComplete: () => {
    toast.success("¡Tutorial completado!");
    analytics.track("onboarding_completed", { view: "ota" });
  },
  onSkip: () => {
    console.log("Usuario saltó el tutorial");
  },
});
```

### Validar antes de acción avanzada

```tsx
const { isCompleted, startTour } = useViewOnboarding({
  onboardingId: "analytics",
  steps: analyticsSteps,
  autoStart: false,
});

const handleAdvancedFeature = () => {
  if (!isCompleted) {
    const confirm = window.confirm("¿Ver tutorial primero?");
    if (confirm) {
      startTour();
      return;
    }
  }
  // Ejecutar función avanzada
};
```

## 🔄 Flujo de Funcionamiento

1. **Al iniciar sesión**:

   - Context carga automáticamente array de onboardings completados
   - Se almacena en estado local para consultas rápidas

2. **Al entrar a una vista**:

   - Hook verifica si el onboardingId está en el array
   - Si NO está y autoStart=true → muestra el tour
   - Si SÍ está → no hace nada

3. **Al completar/saltar**:

   - Envía PATCH al backend con el onboardingId
   - Backend agrega al array usando `$addToSet` (evita duplicados)
   - Actualiza estado local del context

4. **Botón manual**:
   - Siempre disponible con `startTour()`
   - Usuario puede ver el tour cuando quiera

## ➕ Agregar Nueva Vista

### 1. Backend - Agregar al enum

```javascript
// api/models/user.js
completedOnboardings: {
  type: [String],
  enum: ["inicio", "dashboard", "devices", "nodes", "ota", "settings", "analytics", "nueva-vista"],
  default: [],
}
```

### 2. Frontend - Agregar al type

```typescript
// services/onboardingService.ts
export type OnboardingId =
  | "inicio"
  | "dashboard"
  | "devices"
  | "nodes"
  | "ota"
  | "settings"
  | "analytics"
  | "nueva-vista"; // ← Agregar aquí
```

### 3. Implementar en la vista

```tsx
// pages/NuevaVista.tsx
import { useViewOnboarding } from "@/hooks/useViewOnboarding";

const NuevaVista = () => {
  useViewOnboarding({
    onboardingId: "nueva-vista",
    steps: [
      /* pasos del tour */
    ],
    autoStart: true,
  });

  return <div>...</div>;
};
```

## 🐛 Debug

Verifica el estado actual del onboarding:

```tsx
const { isCompleted, shouldShow, completedOnboardings } = useOnboarding();

console.log("Array completo:", completedOnboardings);
console.log("¿Nodes completado?", completedOnboardings.includes("nodes"));
```

## ⚠️ Notas Importantes

1. **IDs deben coincidir**: Backend enum ↔️ Frontend type
2. **$addToSet**: Previene duplicados automáticamente
3. **Skip = Complete**: Ambos marcan como completado
4. **Auto-refresh**: Context recarga al cambiar token (login/logout)
5. **Persistencia**: Array persiste en MongoDB, sobrevive a logout

## 📚 Ver Más

- `src/examples/onboarding-usage-examples.tsx` - Ejemplos completos
- `src/hooks/useViewOnboarding.ts` - Documentación del hook
- `src/contexts/OnboardingContext.tsx` - Context provider
- `TOURS_IMPLEMENTATION_GUIDE.md` - Guía de implementación de los tours en las páginas
- `src/config/tours.tsx` - Configuración de todos los tours disponibles
