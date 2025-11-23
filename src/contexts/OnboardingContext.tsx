import * as React from "react";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  isValidElement,
} from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { driver, type Driver, type Config } from "driver.js";
import "driver.js/dist/driver.css";
import { OnboardingType, OnboardingStep } from "../types/onboarding";
import {
  onboardingService,
  type OnboardingId,
} from "../services/onboardingService";
// @ts-ignore - useAuth is exported as default from jsx file
import useAuth from "../hooks/useAuth.jsx";

// Types for the context
interface OnboardingContextType {
  // State
  activeTour: OnboardingType | null;
  isOnboardingActive: boolean;
  currentStep: number;
  completedOnboardings: OnboardingId[];
  isLoadingOnboardings: boolean;
  hasLoadError: boolean;

  // Methods
  startTour: (
    tourType: OnboardingType,
    steps: OnboardingStep[],
    config?: Partial<Config>
  ) => void;
  completeTour: (onboardingId?: OnboardingId) => Promise<void>;
  skipTour: (onboardingId?: OnboardingId) => Promise<void>;
  hasCompletedOnboarding: (onboardingId: OnboardingId) => boolean;
  refreshCompletedOnboardings: () => Promise<void>;
  setNavigationHandler: (handler: (path: string) => void) => void;

  // Driver instance (para control avanzado si es necesario)
  driverInstance: Driver | null;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return context;
};

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({
  children,
}) => {
  const { auth } = useAuth();

  // State
  const [activeTour, setActiveTour] = useState<OnboardingType | null>(null);
  const [isOnboardingActive, setIsOnboardingActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedOnboardings, setCompletedOnboardings] = useState<
    OnboardingId[]
  >([]);
  const [isLoadingOnboardings, setIsLoadingOnboardings] = useState(true);
  const [hasLoadError, setHasLoadError] = useState(false);

  // Driver instance ref
  const driverInstanceRef = useRef<Driver | null>(null);

  // Navigation handler ref - permite usar react-router navigate en tours
  const navigationHandlerRef = useRef<((path: string) => void) | null>(null);
  const hasLoadedOnboardingsRef = useRef(false);

  // Load completed onboardings on mount (solo una vez)
  useEffect(() => {
    const loadCompletedOnboardings = async () => {
      if (auth?.token && !hasLoadedOnboardingsRef.current) {
        hasLoadedOnboardingsRef.current = true;
        try {
          setIsLoadingOnboardings(true);
          setHasLoadError(false);
          const completed = await onboardingService.getCompletedOnboardings();

          // Si el servicio retorna null, hay error de red/servidor
          if (completed === null) {
            setHasLoadError(true);
            setCompletedOnboardings([]);
          } else {
            // Array vacío es válido (usuario no ha completado ningún onboarding)
            setCompletedOnboardings(completed);
            setHasLoadError(false);
          }
        } catch (error) {
          console.warn(
            "No se pudieron cargar los onboardings completados:",
            error
          );
          setHasLoadError(true);
          setCompletedOnboardings([]);
        } finally {
          setIsLoadingOnboardings(false);
        }
      } else if (!auth?.token) {
        setIsLoadingOnboardings(false);
      }
    };

    loadCompletedOnboardings();
  }, [auth?.token]);

  // Cleanup driver on unmount
  useEffect(() => {
    return () => {
      if (driverInstanceRef.current) {
        driverInstanceRef.current.destroy();
      }
    };
  }, []);

  // Refresh completed onboardings from server
  const refreshCompletedOnboardings = useCallback(async () => {
    if (auth?.token) {
      const completed = await onboardingService.getCompletedOnboardings();
      if (completed !== null) {
        setCompletedOnboardings(completed);
        setHasLoadError(false);
      } else {
        setHasLoadError(true);
      }
    }
  }, [auth?.token]);

  // Check if onboarding is completed
  const hasCompletedOnboarding = useCallback(
    (onboardingId: OnboardingId) => {
      return completedOnboardings.includes(onboardingId);
    },
    [completedOnboardings]
  );

  // Helper para navegar usando SPA si está disponible, sino usar window.location
  const navigateToRoute = useCallback((route: string) => {
    if (navigationHandlerRef.current) {
      // Usar navegación SPA
      navigationHandlerRef.current(route);
    } else {
      // Fallback a navegación con recarga
      window.location.href = route;
    }
  }, []);

  // Set navigation handler (debe ser llamado desde un componente con acceso a navigate)
  const setNavigationHandler = useCallback(
    (handler: (path: string) => void) => {
      navigationHandlerRef.current = handler;
    },
    []
  );

  // Start a tour
  const startTour = useCallback(
    (
      tourType: OnboardingType,
      steps: OnboardingStep[],
      customConfig?: Partial<Config>
    ) => {
      // Destroy previous instance if exists
      if (driverInstanceRef.current) {
        driverInstanceRef.current.destroy();
      }

      // Map OnboardingType to OnboardingId
      const onboardingIdMap: Partial<Record<OnboardingType, OnboardingId>> = {
        initial: "inicio",
        dashboard: "dashboard",
        device: "devices",
        "device-model": "devices", // device-model usa el mismo ID que devices
        ota: "ota",
        settings: "settings",
        analytics: "analytics",
        rules: "rules",
        "automation-editor": "automation-editor",
        charts: "charts",
      };
      const currentOnboardingId = onboardingIdMap[tourType];

      // Default configuration futurista
      const defaultConfig: Config = {
        showProgress: true,
        animate: true,
        smoothScroll: true,
        overlayOpacity: 0.8,
        stagePadding: 4,
        stageRadius: 10,
        // Botones en español
        nextBtnText: "Siguiente →",
        prevBtnText: "← Anterior",
        doneBtnText: "✓ Finalizar",

        // Clases personalizadas para estilos shadcn/ui
        popoverClass: "driver-popover-futuristic",

        // Callbacks
        onHighlightStarted: () => {
          setIsOnboardingActive(true);
        },
        onHighlighted: (element, step, options) => {
          setCurrentStep(options.state.activeIndex || 0);
        },
        onDeselected: (element, step, options) => {
          setIsOnboardingActive(false);
          setActiveTour(null);
          setCurrentStep(0);

          // Si el usuario cerró el tour antes de terminarlo (skip/close)
          // y no llegó al último paso, marcar como completado igual
          const isLastStep = options.state.activeIndex === steps.length - 1;
          if (!isLastStep && currentOnboardingId && auth?.token) {
            // Skip: marcar como completado de todas formas
            onboardingService
              .completeOnboarding(currentOnboardingId)
              .then((success) => {
                if (success) {
                  setCompletedOnboardings((prev) => [
                    ...prev,
                    currentOnboardingId,
                  ]);
                }
              });
          }
        },
        onDestroyed: (element, step, options) => {
          setIsOnboardingActive(false);
          setActiveTour(null);
          setCurrentStep(0);

          // Si llegó al último paso (completó el tour)
          const isLastStep = options.state.activeIndex === steps.length - 1;
          const lastStepData = steps[steps.length - 1];

          if (isLastStep && currentOnboardingId && auth?.token) {
            // Complete: marcar como completado
            onboardingService
              .completeOnboarding(currentOnboardingId)
              .then((success) => {
                if (success) {
                  setCompletedOnboardings((prev) => [
                    ...prev,
                    currentOnboardingId,
                  ]);
                }

                // Si el último paso tiene nextRoute, navegar después de completar
                if (lastStepData?.nextRoute) {
                  navigateToRoute(lastStepData.nextRoute);
                }
              });
          } else if (isLastStep && lastStepData?.nextRoute) {
            // Si no hay auth pero hay nextRoute, navegar igual
            navigateToRoute(lastStepData.nextRoute);
          }
        },

        ...customConfig,
      };

      // Create driver instance
      const driverObj = driver({
        ...defaultConfig,
        steps: steps.map((step) => {
          // Convert React icon to HTML string if present
          let iconHtml = "";
          if (step.icon) {
            if (isValidElement(step.icon)) {
              iconHtml = renderToStaticMarkup(step.icon);
            } else {
              iconHtml = String(step.icon);
            }
          }

          const mappedStep: any = {
            element: step.element,
            popover: {
              title: iconHtml
                ? `<span class="driver-icon-wrapper">${iconHtml}</span> ${step.popover?.title}`
                : step.popover?.title,
              description: step.popover?.description,
              side: step.popover?.side || "bottom",
              align: step.popover?.align || "start",
            },
          };

          // Si el paso tiene nextRoute, personalizar el comportamiento al hacer clic en "Siguiente"
          if (step.nextRoute) {
            mappedStep.popover.onNextClick = (
              element: any,
              stepObj: any,
              opts: any
            ) => {
              // Navegar usando SPA (sin recargar la página)
              navigateToRoute(step.nextRoute!);

              // Dar tiempo para que la navegación ocurra antes de avanzar
              setTimeout(() => {
                opts.driver.moveNext();
              }, 100);
            };
          }

          return mappedStep;
        }),
      });

      driverInstanceRef.current = driverObj;
      setActiveTour(tourType);

      // Start the tour
      driverObj.drive();
    },
    [auth, navigateToRoute]
  );

  // Complete the current tour manually
  const completeTour = useCallback(
    async (onboardingId?: OnboardingId) => {
      if (onboardingId && auth?.token) {
        const success = await onboardingService.completeOnboarding(
          onboardingId
        );
        if (success) {
          setCompletedOnboardings((prev) => [...prev, onboardingId]);
        }
      }

      if (driverInstanceRef.current) {
        driverInstanceRef.current.destroy();
      }

      setActiveTour(null);
      setIsOnboardingActive(false);
      setCurrentStep(0);
    },
    [auth?.token]
  );

  // Skip/close the current tour (también lo marca como completado)
  const skipTour = useCallback(
    async (onboardingId?: OnboardingId) => {
      if (onboardingId && auth?.token) {
        const success = await onboardingService.completeOnboarding(
          onboardingId
        );
        if (success) {
          setCompletedOnboardings((prev) => [...prev, onboardingId]);
        }
      }

      if (driverInstanceRef.current) {
        driverInstanceRef.current.destroy();
      }

      setActiveTour(null);
      setIsOnboardingActive(false);
      setCurrentStep(0);
    },
    [auth?.token]
  );

  const contextValue: OnboardingContextType = {
    activeTour,
    isOnboardingActive,
    currentStep,
    completedOnboardings,
    isLoadingOnboardings,
    hasLoadError,
    startTour,
    completeTour,
    skipTour,
    hasCompletedOnboarding,
    refreshCompletedOnboardings,
    setNavigationHandler,
    driverInstance: driverInstanceRef.current,
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
};
