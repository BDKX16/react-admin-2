import { useEffect, useState } from "react";
import { useOnboarding } from "../contexts/OnboardingContext";
import type { OnboardingId } from "../services/onboardingService";
import type { OnboardingStep } from "../types/onboarding";

interface UseViewOnboardingOptions {
  /**
   * ID único del onboarding (debe coincidir con el enum en backend)
   */
  onboardingId: OnboardingId;

  /**
   * Pasos del tour a mostrar
   */
  steps: OnboardingStep[];

  /**
   * Si es true, muestra el onboarding automáticamente al entrar a la vista
   * Si es false, solo verifica pero no muestra automáticamente
   */
  autoStart?: boolean;

  /**
   * Callback cuando se completa el onboarding
   */
  onComplete?: () => void;

  /**
   * Callback cuando se salta el onboarding
   */
  onSkip?: () => void;
}

interface UseViewOnboardingReturn {
  /**
   * Indica si el usuario ya completó este onboarding
   */
  isCompleted: boolean;

  /**
   * Indica si el onboarding debe mostrarse
   */
  shouldShow: boolean;

  /**
   * Inicia el tour manualmente
   */
  startTour: () => void;

  /**
   * Completa el tour manualmente
   */
  completeTour: () => Promise<void>;

  /**
   * Salta el tour
   */
  skipTour: () => Promise<void>;
}

/**
 * Hook para gestionar onboarding de una vista específica
 *
 * @example
 * ```tsx
 * // En la página de nodes
 * const { shouldShow, startTour, completeTour } = useViewOnboarding({
 *   onboardingId: "nodes",
 *   steps: nodesTourSteps,
 *   autoStart: true,
 *   onComplete: () => {
 *     toast.success("Tour completado!");
 *   }
 * });
 *
 * // Mostrar botón manual si no autoStart
 * {!shouldShow && (
 *   <Button onClick={startTour}>Ver tutorial</Button>
 * )}
 * ```
 */
export const useViewOnboarding = ({
  onboardingId,
  steps,
  autoStart = true,
  onComplete,
  onSkip,
}: UseViewOnboardingOptions): UseViewOnboardingReturn => {
  const {
    hasCompletedOnboarding,
    startTour: contextStartTour,
    completeTour: contextCompleteTour,
    skipTour: contextSkipTour,
    isLoadingOnboardings,
    hasLoadError,
  } = useOnboarding();

  const [hasStarted, setHasStarted] = useState(false);
  const isCompleted = hasCompletedOnboarding(onboardingId);
  // No mostrar el tour si hay error de carga o está cargando
  const shouldShow =
    !isCompleted && !hasStarted && !hasLoadError && !isLoadingOnboardings;

  // Auto-start el tour si está habilitado y no ha sido completado
  useEffect(() => {
    if (autoStart && shouldShow && steps.length > 0) {
      // Pequeño delay para asegurar que el DOM esté listo
      const timer = setTimeout(() => {
        startTour();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [autoStart, shouldShow, steps.length]);

  const startTour = () => {
    if (!isCompleted && steps.length > 0) {
      setHasStarted(true);
      contextStartTour(onboardingId as any, steps);
    }
  };

  const completeTour = async () => {
    await contextCompleteTour(onboardingId);
    setHasStarted(false);
    onComplete?.();
  };

  const skipTour = async () => {
    await contextSkipTour(onboardingId);
    setHasStarted(false);
    onSkip?.();
  };

  return {
    isCompleted,
    shouldShow,
    startTour,
    completeTour,
    skipTour,
  };
};
