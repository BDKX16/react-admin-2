import axios, { AxiosError } from "axios";
import store from "../redux/store";
import { enqueueSnackbar } from "notistack";

export type OnboardingId =
  | "inicio"
  | "dashboard"
  | "devices"
  | "nodes"
  | "ota"
  | "settings"
  | "analytics"
  | "rules"
  | "automation-editor"
  | "charts";

interface AxiosHeaders {
  headers: {
    token: string;
    "Content-Type": string;
  };
}

/**
 * Obtiene headers de Axios con el token del store de Redux
 */
const getAxiosHeaders = (): AxiosHeaders | null => {
  const state = store.getState();
  if (!state.user.token) {
    return null;
  }
  return {
    headers: {
      token: state.user.token,
      "Content-Type": "application/json",
    },
  };
};

/**
 * Maneja errores de las peticiones de onboarding
 */
const notifyError = (error: AxiosError): void => {
  if (error.response?.status === 401) {
    enqueueSnackbar("No autorizado", {
      variant: "error",
    });
  } else if (error.response?.status === 404) {
    // 404 es esperado si el endpoint no existe, no notificar
    console.warn(
      "Onboarding endpoint no disponible - tours deshabilitados temporalmente"
    );
  } else if (error.code === "ERR_NETWORK") {
    // Error de red, no notificar
    console.warn("Sin conexión - tours deshabilitados temporalmente");
  } else if (error.response && error.response.status !== 200) {
    enqueueSnackbar(error.response.statusText, {
      variant: "error",
    });
  }
};

/**
 * Servicio para gestionar onboardings por vista
 */
class OnboardingService {
  private baseUrl =
    import.meta.env.VITE_BASE_URL || "http://localhost:3001/api";

  /**
   * Obtiene la lista de onboardings completados del usuario
   * Retorna null si hay error de red/servidor para distinguirlo de array vacío válido
   */
  async getCompletedOnboardings(): Promise<OnboardingId[] | null> {
    const headers = getAxiosHeaders();
    if (!headers) {
      return null;
    }

    try {
      const response = await axios.get(`${this.baseUrl}/onboardings`, headers);
      return response.data.completedOnboardings || [];
    } catch (error) {
      notifyError(error as AxiosError);
      return null; // null indica error, array vacío es válido
    }
  }

  /**
   * Marca un onboarding específico como completado
   */
  async completeOnboarding(onboardingId: OnboardingId): Promise<boolean> {
    const headers = getAxiosHeaders();
    if (!headers) {
      return false;
    }

    try {
      await axios.patch(
        `${this.baseUrl}/onboardings`,
        { onboardingId },
        headers
      );
      return true;
    } catch (error) {
      notifyError(error as AxiosError);
      return false;
    }
  }
}

export const onboardingService = new OnboardingService();
