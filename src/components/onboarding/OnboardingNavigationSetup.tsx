import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "../../contexts/OnboardingContext";

/**
 * Componente que registra la función de navegación de react-router
 * en el contexto de Onboarding para permitir navegación SPA fluida en tours.
 *
 * Debe ser colocado dentro del Router y del OnboardingProvider.
 *
 * @example
 * <BrowserRouter>
 *   <OnboardingProvider>
 *     <OnboardingNavigationSetup />
 *     <App />
 *   </OnboardingProvider>
 * </BrowserRouter>
 */
export const OnboardingNavigationSetup: React.FC = () => {
  const navigate = useNavigate();
  const { setNavigationHandler } = useOnboarding();

  useEffect(() => {
    // Registrar la función navigate para que los tours puedan usarla
    setNavigationHandler(navigate);

    // Cleanup: remover el handler al desmontar (opcional)
    return () => {
      setNavigationHandler(() => {
        // No-op fallback
      });
    };
  }, [navigate, setNavigationHandler]);

  // Este componente no renderiza nada
  return null;
};
