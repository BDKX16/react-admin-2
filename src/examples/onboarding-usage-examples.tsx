/**
 * EJEMPLO DE USO DEL HOOK useViewOnboarding
 *
 * Este archivo muestra cómo implementar onboarding en cualquier vista de la aplicación
 */

import React from "react";
import { useViewOnboarding } from "../hooks/useViewOnboarding";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

// Define los pasos del tour específico de esta vista
const nodesOnboardingSteps = [
  {
    element: "#nodes-header",
    popover: {
      title: "Bienvenido a Nodes",
      description: "Aquí puedes gestionar tus flujos de automatización visual",
      side: "bottom",
    },
  },
  {
    element: "#create-flow-button",
    popover: {
      title: "Crear Flujo",
      description: "Haz clic aquí para crear un nuevo flujo de automatización",
      side: "left",
    },
  },
  {
    element: "#flows-list",
    popover: {
      title: "Lista de Flujos",
      description: "Todos tus flujos aparecerán aquí",
      side: "top",
    },
  },
];

/**
 * Componente de ejemplo que implementa onboarding automático
 */
export const NodesPageExample = () => {
  // Hook que gestiona el onboarding de esta vista
  const { isCompleted, shouldShow, startTour } = useViewOnboarding({
    onboardingId: "nodes",
    steps: nodesOnboardingSteps,
    autoStart: true, // Se muestra automáticamente si no lo completó
    onComplete: () => {
      console.log("Usuario completó el tour de nodes!");
    },
    onSkip: () => {
      console.log("Usuario saltó el tour de nodes");
    },
  });

  return (
    <div>
      {/* Header con botón de ayuda */}
      <div id="nodes-header" className="flex items-center justify-between">
        <h1>Mis Flujos</h1>

        {/* Botón para ver el tour manualmente (siempre disponible) */}
        <Button
          variant="outline"
          size="sm"
          onClick={startTour}
          className="gap-2"
        >
          <HelpCircle className="h-4 w-4" />
          Ver Tutorial
        </Button>
      </div>

      {/* Botón de crear flujo */}
      <Button id="create-flow-button" className="mt-4">
        Crear Nuevo Flujo
      </Button>

      {/* Lista de flujos */}
      <div id="flows-list" className="mt-6">
        <p>Aquí van tus flujos...</p>
      </div>

      {/* Indicador de estado (solo para debug) */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-sm">
          <div>Onboarding completado: {isCompleted ? "✅" : "❌"}</div>
          <div>Debe mostrarse: {shouldShow ? "✅" : "❌"}</div>
        </div>
      )}
    </div>
  );
};

/**
 * OTROS EJEMPLOS DE USO
 */

// ========================================
// EJEMPLO 1: Onboarding SIN auto-start
// ========================================
export const DashboardPageExample = () => {
  const { startTour } = useViewOnboarding({
    onboardingId: "dashboard",
    steps: [
      /* tus pasos aquí */
    ],
    autoStart: false, // No se muestra automáticamente
  });

  return (
    <div>
      <h1>Dashboard</h1>
      <Button onClick={startTour}>¿Necesitas ayuda?</Button>
    </div>
  );
};

// ========================================
// EJEMPLO 2: Onboarding con acciones personalizadas
// ========================================
export const SettingsPageExample = () => {
  const { isCompleted, startTour } = useViewOnboarding({
    onboardingId: "settings",
    steps: [
      /* tus pasos aquí */
    ],
    autoStart: true,
    onComplete: () => {
      // Mostrar notificación
      alert("¡Genial! Ya sabes usar la configuración");
    },
    onSkip: () => {
      // Analytics o logging
      console.log("Usuario saltó el tutorial de settings");
    },
  });

  return (
    <div>
      <h1>Configuración</h1>
      {!isCompleted && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <p>¿Primera vez aquí?</p>
          <Button onClick={startTour}>Ver guía rápida</Button>
        </div>
      )}
    </div>
  );
};

// ========================================
// EJEMPLO 3: Validar completado antes de acción
// ========================================
export const AdvancedFeaturePage = () => {
  const { isCompleted, startTour } = useViewOnboarding({
    onboardingId: "analytics",
    steps: [
      /* tus pasos aquí */
    ],
    autoStart: false,
  });

  const handleAdvancedAction = () => {
    if (!isCompleted) {
      // Sugerir tutorial antes de usar función avanzada
      const confirm = window.confirm("¿Quieres ver un tutorial primero?");
      if (confirm) {
        startTour();
        return;
      }
    }

    // Ejecutar acción avanzada
    console.log("Ejecutando acción avanzada...");
  };

  return (
    <div>
      <Button onClick={handleAdvancedAction}>Función Avanzada</Button>
    </div>
  );
};

/**
 * RESUMEN DE IDs DISPONIBLES:
 *
 * - "inicio" → Tour inicial/bienvenida
 * - "dashboard" → Vista principal/resumen
 * - "devices" → Gestión de dispositivos
 * - "nodes" → Editor de flujos Node-RED
 * - "ota" → Actualizaciones OTA
 * - "settings" → Configuración
 * - "analytics" → Analíticas/reportes
 *
 * NOTA: Los IDs deben coincidir exactamente con el enum en:
 * - Backend: api/models/user.js (completedOnboardings enum)
 * - Frontend: services/onboardingService.ts (OnboardingId type)
 */
