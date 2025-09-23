// Adaptadores para pagos
export const createPaymentAdapter = (paymentData) => ({
  id: paymentData._id || paymentData.id,
  userId: paymentData.userId,
  subscriptionId: paymentData.subscriptionId,
  amount: paymentData.amount,
  currency: paymentData.currency,
  paymentMethod: paymentData.paymentMethod,
  status: paymentData.status,
  externalId: paymentData.externalId,
  externalStatus: paymentData.externalStatus,
  metadata: paymentData.metadata,
  processedAt: paymentData.processedAt
    ? new Date(paymentData.processedAt)
    : undefined,
  createdAt: new Date(paymentData.createdAt),
  updatedAt: new Date(paymentData.updatedAt),
});

export const createPaymentsListAdapter = (paymentsData) => {
  return paymentsData.map(createPaymentAdapter);
};

// Función helper para formatear el monto de pago
export const formatPaymentAmount = (amount, currency) => {
  const formatter = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: currency.toUpperCase(),
  });
  return formatter.format(amount);
};

// Función helper para obtener el color del estado del pago
export const getPaymentStatusColor = (status) => {
  switch (status) {
    case "approved":
      return "text-green-600";
    case "pending":
      return "text-yellow-600";
    case "rejected":
    case "cancelled":
      return "text-red-600";
    case "refunded":
      return "text-blue-600";
    default:
      return "text-gray-600";
  }
};

// Función helper para obtener el texto del estado del pago en español
export const getPaymentStatusText = (status) => {
  switch (status) {
    case "pending":
      return "Pendiente";
    case "approved":
      return "Aprobado";
    case "rejected":
      return "Rechazado";
    case "cancelled":
      return "Cancelado";
    case "refunded":
      return "Reembolsado";
    default:
      return "Desconocido";
  }
};
