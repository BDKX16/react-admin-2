// Tipos para el sistema de onboarding y tutoriales con Driver.js
import type { DriveStep, Config as DriverConfig } from "driver.js";

export type OnboardingType =
  | "initial" // Onboarding inicial del usuario
  | "dashboard" // Tour del dashboard principal
  | "device" // Tour de dispositivo individual
  | "device-model" // Onboarding específico por modelo de dispositivo
  | "settings" // Tour de configuración
  | "ota" // Tour de actualizaciones OTA
  | "analytics" // Tour de analytics
  | "rules" // Tour del motor de reglas
  | "automation-editor" // Tour del editor de workflows
  | "charts"; // Tour de gráficos y visualización

// Extendemos DriveStep para incluir metadata adicional
export interface OnboardingStep extends DriveStep {
  // Driver.js ya incluye: element, popover { title, description, side, align }
  icon?: string | React.ReactElement; // Emoji, icono string o React element (Lucide icon)
  nextRoute?: string; // Ruta para navegar después de este paso
  prevRoute?: string; // Ruta para navegar al retroceder
}

export interface OnboardingTour {
  id: string;
  type: OnboardingType;
  title: string;
  description: string;
  steps: OnboardingStep[];
  route?: string; // Ruta donde debe mostrarse el tour
  deviceTemplate?: string; // Para tours específicos de dispositivo
  driverConfig?: Partial<DriverConfig>; // Configuración personalizada de Driver.js
}

// Ya no necesitamos OnboardingState ni UserOnboardingProgress
// El onboarding principal se persiste en backend (flag en User)
// El onboarding de dispositivos es temporal (no se persiste)
