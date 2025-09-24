import { useState } from "react";
import useFetchAndLoad from "./useFetchAndLoad";
import useAuth from "./useAuth";
import {
  createSubscription,
  updateSubscription,
  getSubscriptionStatus,
} from "@/services/private";
import { enqueueSnackbar } from "notistack";

const useSubscription = () => {
  const { callEndpoint } = useFetchAndLoad();
  const { auth } = useAuth();
  const [loading, setLoading] = useState(false);

  const getUserPlan = () => {
    return auth?.userData?.plan || "free";
  };

  const getPlanData = () => {
    return auth?.userData?.planData || null;
  };

  const isPro = () => {
    return getUserPlan() === "pro";
  };

  const isPlus = () => {
    return getUserPlan() === "plus";
  };

  const refreshSubscriptionStatus = async () => {
    setLoading(true);
    try {
      const response = await callEndpoint(getSubscriptionStatus());

      if (!response.error && response.data) {
        // Actualizar el plan en el contexto de auth si es necesario
        console.log("Subscription status refreshed:", response.data.plan);
        return response.data.plan;
      }
    } catch (error) {
      console.error("Error refreshing subscription status:", error);
    } finally {
      setLoading(false);
    }
    return null;
  };

  const upgradeToPro = async () => {
    setLoading(true);
    try {
      // Crear una nueva subscripción Pro
      const subscriptionData = {
        plan: "pro",
        paymentMethod: "mercadopago", // Por defecto MercadoPago
      };

      const response = await callEndpoint(createSubscription(subscriptionData));

      if (!response.error) {
        enqueueSnackbar(
          "Proceso de upgrade iniciado. Serás redirigido al pago.",
          {
            variant: "success",
          }
        );
        // Aquí se podría redirigir a MercadoPago o abrir modal de pago
      } else {
        enqueueSnackbar("Error al iniciar el proceso de upgrade", {
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error al upgradar:", error);
      enqueueSnackbar("Error al procesar la solicitud", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async () => {
    setLoading(true);
    try {
      const updateData = {
        status: "cancelled",
        cancelledAt: new Date().toISOString(),
      };

      const response = await callEndpoint(updateSubscription(updateData));

      if (!response.error) {
        enqueueSnackbar("Suscripción cancelada exitosamente", {
          variant: "success",
        });
      } else {
        enqueueSnackbar("Error al cancelar la suscripción", {
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error al cancelar:", error);
      enqueueSnackbar("Error al procesar la solicitud", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    getUserPlan,
    getPlanData,
    isPro,
    isPlus,
    upgradeToPro,
    cancelSubscription,
    refreshSubscriptionStatus,
    loading,
    currentPlan: getUserPlan(),
    planData: getPlanData(),
  };
};

export default useSubscription;
