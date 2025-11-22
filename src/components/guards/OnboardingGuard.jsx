import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const OnboardingGuard = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // No verificar si ya estamos en onboarding, login, o rutas públicas
    const publicRoutes = [
      "/login",
      "/onboarding",
      "/confirmaremail",
      "/verify-email",
    ];
    if (publicRoutes.some((route) => location.pathname.startsWith(route))) {
      return;
    }

    const userData = localStorage.getItem("userData");
    if (userData) {
      const parsedUserData = JSON.parse(userData);

      // Si el usuario necesita onboarding, redirigir
      if (parsedUserData.needsOnboarding) {
        console.log("🔄 Usuario necesita onboarding, redirigiendo...");
        navigate("/onboarding", { replace: true });
      }
    }
  }, [navigate, location]);

  return children;
};

export default OnboardingGuard;
