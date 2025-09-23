import { useState, useCallback } from "react";
import { useSnackbar } from "notistack";
import { getPaymentHistory, getPaymentDetails } from "@/services/private";

export default function usePayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const fetchPayments = useCallback(
    async (page = 1, limit = 50) => {
      try {
        setLoading(true);
        setError(null);

        const result = getPaymentHistory(page, limit);
        if (!result) {
          throw new Error("Error de autenticación");
        }

        const response = await result.call;

        if (response.error) {
          throw new Error("Error al obtener el historial de pagos");
        }

        // El servicio devuelve response.data.data.payments según el endpoint
        const paymentsData = response.data?.data?.payments || [];
        setPayments(paymentsData);
        return paymentsData;
      } catch (error) {
        console.error("Error fetching payments:", error);
        setError(error.message);
        enqueueSnackbar(error.message, { variant: "error" });
        return [];
      } finally {
        setLoading(false);
      }
    },
    [enqueueSnackbar]
  );

  const getPaymentById = useCallback(
    async (paymentId) => {
      try {
        const result = getPaymentDetails(paymentId);
        if (!result) {
          throw new Error("Error de autenticación");
        }

        const response = await result.call;

        if (response.error) {
          throw new Error("Error al obtener el pago");
        }

        return response.data?.data?.payment || null;
      } catch (error) {
        console.error("Error fetching payment:", error);
        enqueueSnackbar(error.message, { variant: "error" });
        return null;
      }
    },
    [enqueueSnackbar]
  );

  const getPaymentSummary = useCallback(() => {
    const approvedPayments = payments.filter((p) => p.status === "approved");
    const totalPaid = approvedPayments.reduce((sum, p) => sum + p.amount, 0);
    const lastPayment = payments.length > 0 ? payments[0] : null;

    return {
      totalPaid,
      approvedCount: approvedPayments.length,
      totalCount: payments.length,
      lastPayment,
      pendingCount: payments.filter((p) => p.status === "pending").length,
      rejectedCount: payments.filter((p) => p.status === "rejected").length,
    };
  }, [payments]);

  return {
    payments,
    loading,
    error,
    fetchPayments,
    getPaymentById,
    getPaymentSummary,
    setError,
  };
}
